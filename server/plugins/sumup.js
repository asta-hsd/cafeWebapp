import { createOrder, hasSumupId, nextFreeNumber } from '../utils/store'

// Holt neue SumUp-Zahlungen (egal ob vom Terminal oder aus der App) per Polling
// und legt dafür automatisch eine Bestellung an. Pickup + 2. Display bleiben unverändert.
//
// .env:
//   SUMUP_API_KEY=sup_sk_...
//   SUMUP_MERCHANT_CODE=MXXXXXXX
//   SUMUP_POLL_SECONDS=5   (optional)

import { readFileSync } from 'node:fs'
import path from 'node:path'

const API = 'https://api.sumup.com/v2.1/merchants'

// Optional: data/prices.json, z.B. {"3": "Kaffee", "4": "Cappuccino", "2.5": "Tee"}
// Wird genutzt, wenn SumUp keine Artikelnamen liefert (Zuordnung über den Preis).
function loadPrices() {
	try { return JSON.parse(readFileSync(path.resolve(process.env.DATA_DIR || './data', 'prices.json'), 'utf8')) } catch { return {} }
}
const euro = n => Number(n).toFixed(2).replace('.', ',') + ' €'

export default defineNitroPlugin((nitroApp) => {
	const apiKey = process.env.SUMUP_API_KEY
	const merchant = process.env.SUMUP_MERCHANT_CODE
	if (!apiKey || !merchant) {
		console.log('[sumup] SUMUP_API_KEY / SUMUP_MERCHANT_CODE fehlen -> Poller aus')
		return
	}

	let since = new Date().toISOString() // nur Zahlungen ab App-Start
	let counter = 0

	function nextPickupName() {
		counter = nextFreeNumber(counter) // nächste Nummer, die gerade nicht in Benutzung ist
		return String(counter)
	}

	async function get(url) {
		const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, 'User-Agent': 'cafeWebapp' } })
		if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
		return res.json()
	}

	// Sales-API: hier stehen die Artikelnamen (items[].name), die Zahlung steht in payments[].reference
	async function fetchSaleNames(code) {
		for (let attempt = 0; attempt < 2; attempt++) {
			try {
				const r = await get(`https://api.sumup.com/v1.0/merchants/${encodeURIComponent(merchant)}/sales?limit=25`)
				const sale = (r.items || []).find(sl => (sl.payments || []).some(p => p.reference === code))
				if (sale) {
					return sale.items.filter(i => i.type !== 'FEE').flatMap(i => {
						const mods = (i.modifiers || []).map(m => m.name).join(', ')
						const label = i.name + (mods ? ` (${mods})` : '')
						return Array(Math.max(1, Math.round(i.quantity || 1))).fill(label)
					})
				}
			} catch (e) {
				console.log('[sumup] Sales-API:', e.message.slice(0, 200))
				return null
			}
			await new Promise(r => setTimeout(r, 2000)) // Verkauf taucht manchmal erst kurz später auf
		}
		return null
	}

	// Artikelnamen stehen im Beleg (Receipts-API), die Transaktion selbst hat nur Preis und Menge
	async function fetchProducts(code) {
		try {
			const r = await get(`https://api.sumup.com/v1.1/receipts/${encodeURIComponent(code)}?mid=${encodeURIComponent(merchant)}`)
			const products = r.transaction_data?.products || []
			console.log('[sumup] Beleg-Artikel:', JSON.stringify(products))
			if (products.some(p => p.name)) return products
		} catch (e) {
			console.log('[sumup] Beleg konnte nicht geladen werden:', e.message)
		}
		try {
			return (await get(`${API}/${merchant}/transactions?transaction_code=${encodeURIComponent(code)}`)).products || []
		} catch (e) {
			console.log('[sumup] Artikel konnten nicht geladen werden:', e.message)
			return []
		}
	}

	async function poll() {
		try {
			const url = `${API}/${merchant}/transactions/history?changes_since=${encodeURIComponent(since)}&statuses[]=SUCCESSFUL&limit=50`
			const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } })
			if (!res.ok) throw new Error(`SumUp ${res.status} ${await res.text()}`)
			const data = await res.json()
			const items = data.items || []
			let added = 0

			for (const tx of items.reverse()) { // älteste zuerst
				const id = tx.transaction_code || tx.id
				if (!id || hasSumupId(id)) continue
				console.log('[sumup] neue Zahlung', id, tx.amount)
				const name = nextPickupName()
				let names = await fetchSaleNames(id)
				if (!names || names.length === 0) {
					const products = await fetchProducts(id)
					if (products.length === 0) console.log('[sumup] keine Artikel gefunden, zeige Betrag')
					const prices = loadPrices()
					const label = p => p.name || p.description || prices[String(p.price)] || euro(p.price ?? tx.amount)
					names = products.length ? products.flatMap(p => Array(p.quantity || 1).fill(label(p))) : [prices[String(tx.amount)] || euro(tx.amount)]
				}
				console.log('[sumup] Artikel:', names.join(', '))
				// pro Stück eine Bestellung, alle mit derselben Abholnummer
				names.forEach((item, i) => createOrder({
					orderType: item,
					pickupName: name,
					price: i === 0 ? tx.amount : 0,
					sumupId: i === 0 ? id : `${id}#${i}`
				}))
				added++
			}
			if (added) nitroApp.socketServer?.emit('refreshOrders')
			since = new Date(Date.now() - 60 * 1000).toISOString() // kleines Überlappungsfenster, Duplikate fängt sumupId ab
		} catch (e) {
			console.log('[sumup]', e.message)
		}
	}

	setInterval(poll, (Number(process.env.SUMUP_POLL_SECONDS) || 5) * 1000)
})