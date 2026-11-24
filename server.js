// Café-Webapp: SumUp-Verkäufe -> Bestellungen -> Bestellungen-Ansicht -> Abhol-Ansicht
// Keine Abhängigkeiten, nur Node >= 20.6.
import http from 'node:http'
import { promises as fs, readFileSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(ROOT, 'public')
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'))
const FILE = path.join(DATA, 'state.json')
const PORT = Number(process.env.PORT) || 3000
const MAX_PICKUP = Number(process.env.MAX_PICKUP_TIME) || 180 // Sekunden
const IGNORE_MODIFIER = /pfand/i // z.B. Recup-Becherpfand

const NAMES = JSON.parse(readFileSync(path.join(ROOT, 'names.json'), 'utf8'))

// ---------- Zustand ----------
// order = { id, saleId, name, createdAt, readyAt|null, items: [{ label, done }] }
let orders = []
let nextName = null // Name, den die nächste eingehende Bestellung bekommt (wird auf dem /next-Screen angezeigt)
let seen = [] // bereits verarbeitete SumUp-Sale-IDs (damit nach Abholung nichts neu angelegt wird)
let saveTimer

async function load() {
	await fs.mkdir(DATA, { recursive: true })
	try { ({ orders, seen, nextName } = JSON.parse(await fs.readFile(FILE, 'utf8'))) } catch {}
	if (!nextName || orders.some(o => o.name === nextName)) nextName = freeName()
}
function save() {
	clearTimeout(saveTimer)
	saveTimer = setTimeout(() => {
		seen = seen.slice(-500)
		fs.writeFile(FILE, JSON.stringify({ orders, seen, nextName })).catch(e => console.log('[save]', e.message))
	}, 200)
}

// zufälliger Name, der gerade von keiner aktiven Bestellung (und nicht als nächster Name) vergeben ist
function freeName() {
	const used = new Set(orders.map(o => o.name))
	if (nextName) used.add(nextName)
	const free = NAMES.filter(n => !used.has(n))
	if (free.length) return free[Math.floor(Math.random() * free.length)]
	// Liste aufgebraucht: "Loki 2", "Loki 3", ...
	for (let k = 2; ; k++) {
		const f = NAMES.map(n => `${n} ${k}`).filter(n => !used.has(n))
		if (f.length) return f[Math.floor(Math.random() * f.length)]
	}
}

function addOrder(labels, saleId = null) {
	const name = nextName || freeName()
	nextName = null // sonst würde freeName() den eben vergebenen Namen für gesperrt halten
	const order = { id: randomUUID(), saleId, name, createdAt: Date.now(), readyAt: null, items: labels.map(label => ({ label, done: false })) }
	orders.push(order)
	nextName = freeName() // direkt den neuen nächsten Namen festlegen
	if (saleId) seen.push(saleId)
	save(); broadcast()
	console.log('[order]', order.name, '->', labels.join(', '))
	return order
}

function toggle(id, i) {
	const o = orders.find(o => o.id === id)
	if (!o?.items[i]) return
	o.items[i].done = !o.items[i].done
	const wasReady = !!o.readyAt
	o.readyAt = o.items.every(it => it.done) ? (o.readyAt || Date.now()) : null
	save(); broadcast()
	if (o.readyAt && !wasReady) broadcast('ready', o.name)
}

function pickup(id) {
	orders = orders.filter(o => o.id !== id)
	save(); broadcast()
}

// ---------- Live-Updates (Server-Sent Events) ----------
const clients = new Set()
const view = () => ({ now: Date.now(), maxPickup: MAX_PICKUP, nextName, orders })
function broadcast(event, data) {
	const msg = event ? `event: ${event}\ndata: ${data}\n\n` : `data: ${JSON.stringify(view())}\n\n`
	for (const res of clients) res.write(msg)
}
setInterval(() => { for (const res of clients) res.write(': ping\n\n') }, 25000)

// zu lange liegen gelassene Abholungen automatisch entfernen
setInterval(() => {
	const stale = orders.filter(o => o.readyAt && Date.now() - o.readyAt > MAX_PICKUP * 1000)
	if (stale.length) { orders = orders.filter(o => !stale.includes(o)); save(); broadcast() }
}, 5000)

// ---------- SumUp ----------
const apiKey = process.env.SUMUP_API_KEY
const merchant = process.env.SUMUP_MERCHANT_CODE

// Bei "Kuchen" steht die Sorte in features[variant_name], sonst ist name der Artikel
function itemLabel(item) {
	const variant = (item.features || []).find(f => f.name === 'variant_name')?.value
	const mods = (item.modifiers || []).map(m => m.name).filter(n => n && !IGNORE_MODIFIER.test(n))
	return (variant || item.name) + (mods.length ? ` (${mods.join(', ')})` : '')
}
const saleLabels = sale => (sale.items || [])
	.filter(i => i.type !== 'FEE')
	.flatMap(i => Array(Math.max(1, Math.round(i.quantity || 1))).fill(itemLabel(i)))

async function pollSumup() {
	const since = pollSumup.since
	try {
		const url = `https://api.sumup.com/v1.0/merchants/${encodeURIComponent(merchant)}/sales?limit=25`
		const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, 'User-Agent': 'cafeWebapp' } })
		if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
		const time = s => new Date(s.closed_at || s.created_at).getTime()
		const sales = ((await res.json()).items || []).sort((a, b) => time(a) - time(b)) // älteste zuerst
		for (const sale of sales) {
			if (sale.state !== 'CLOSED' || time(sale) < since || seen.includes(sale.id)) continue
			const labels = saleLabels(sale)
			if (labels.length) addOrder(labels, sale.id)
		}
	} catch (e) {
		console.log('[sumup]', e.message.slice(0, 300))
	}
}

// ---------- HTTP ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.ico': 'image/x-icon' }
const PAGES = { '/': 'index.html', '/bestellungen': 'bestellungen.html', '/pickup': 'pickup.html', '/next': 'next.html' }

const readJson = req => new Promise(resolve => {
	let b = ''
	req.on('data', c => (b += c))
	req.on('end', () => { try { resolve(JSON.parse(b || '{}')) } catch { resolve({}) } })
})

http.createServer(async (req, res) => {
	const url = new URL(req.url, 'http://x')

	if (url.pathname === '/events') {
		res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
		res.write(`data: ${JSON.stringify(view())}\n\n`)
		clients.add(res)
		req.on('close', () => clients.delete(res))
		return
	}

	if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
		const b = await readJson(req)
		if (url.pathname === '/api/toggle') toggle(b.id, b.i)
		else if (url.pathname === '/api/pickup') pickup(b.id)
		else if (url.pathname === '/api/test' && process.env.ENABLE_TEST === '1') addOrder(b.items || ['Testkaffee'])
		else { res.writeHead(404); return res.end() }
		res.writeHead(200, { 'Content-Type': 'application/json' })
		return res.end('{"ok":true}')
	}

	const file = PAGES[url.pathname] || decodeURIComponent(url.pathname).slice(1)
	const full = path.join(PUBLIC, file)
	if (!full.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end() }
	try {
		const data = await fs.readFile(full)
		res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' })
		res.end(data)
	} catch {
		res.writeHead(404); res.end('Not found')
	}
}).listen(PORT, async () => {
	await load()
	console.log(`[server] http://localhost:${PORT}`)
	if (!apiKey || !merchant) return console.log('[sumup] SUMUP_API_KEY / SUMUP_MERCHANT_CODE fehlen -> Poller aus')
	pollSumup.since = Date.now() - 60 * 1000
	pollSumup()
	setInterval(pollSumup, (Number(process.env.SUMUP_POLL_SECONDS) || 5) * 1000)
})
