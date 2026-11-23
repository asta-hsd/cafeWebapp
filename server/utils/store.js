import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// Einfacher JSON-Speicher: alle Bestellungen liegen in DATA_DIR/orders.json (Standard: ./data)

const DIR = path.resolve(process.env.DATA_DIR || './data')
const FILE = path.join(DIR, 'orders.json')
const KEEP_DONE_HOURS = 48

let orders = []
let saveTimer = null

export async function initStore() {
	await fs.mkdir(DIR, { recursive: true })
	try { orders = JSON.parse(await fs.readFile(FILE, 'utf8')) } catch { orders = [] }
	prune()
}

function prune() {
	const cutoff = Date.now() - KEEP_DONE_HOURS * 36e5
	orders = orders.filter(o => o.status !== 'done' || new Date(o.updatedAt).getTime() > cutoff)
}

function scheduleSave() {
	clearTimeout(saveTimer)
	saveTimer = setTimeout(async () => {
		prune()
		const tmp = FILE + '.tmp'
		await fs.writeFile(tmp, JSON.stringify(orders))
		await fs.rename(tmp, FILE) // atomar, keine halb geschriebene Datei
	}, 200)
}

export function createOrder(data) {
	const now = new Date().toISOString()
	const order = {
		_id: randomUUID(),
		orderType: data.orderType,
		options: [],
		pickupName: data.pickupName || '',
		status: 'ordered',
		price: data.price,
		sumupId: data.sumupId,
		createdAt: now,
		updatedAt: now
	}
	orders.push(order)
	scheduleSave()
	return order
}

export function updateOrder(id, data) {
	const order = orders.find(o => o._id === id)
	if (!order) return null
	const { _id, createdAt, ...rest } = data
	Object.assign(order, rest, { updatedAt: new Date().toISOString() })
	scheduleSave()
	return order
}

export function hasSumupId(id) {
	return orders.some(o => o.sumupId === id)
}

export function activeOrders() {
	return orders.filter(o => o.status === 'ordered' || o.status === 'pickup')
}

// nächste Abholnummer (1-99), die gerade nicht in Benutzung ist
export function nextFreeNumber(last = 0) {
	const used = new Set(activeOrders().map(o => o.pickupName))
	for (let i = 1; i <= 99; i++) {
		const n = ((last + i - 1) % 99) + 1
		if (!used.has(String(n))) return n
	}
	return (last % 99) + 1
}

// Struktur, die pickup.vue und bestellungen.vue erwarten
export function getOrdersView() {
	const active = activeOrders()
	const groups = new Map()
	for (const o of active) {
		if (!groups.has(o.pickupName)) groups.set(o.pickupName, [])
		groups.get(o.pickupName).push(o)
	}
	const pickupNames = [...groups].map(([name, list]) => {
		const ready = list.every(o => o.status === 'pickup')
		const entry = { name, orders: list, ready }
		if (ready) entry.completedAt = list.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b)).updatedAt
		return entry
	})
	return { orders: active, pickupNames }
}
