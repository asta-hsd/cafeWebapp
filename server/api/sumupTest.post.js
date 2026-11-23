import { createOrder } from '../utils/store'

// Nur zum Testen ohne Terminal:
// curl -X POST localhost:3000/api/sumupTest -H 'content-type: application/json' -d '{"name":"7","orderType":"Cappuccino","price":2.5}'
export default defineEventHandler(async (event) => {
	if (!import.meta.dev) throw createError({ statusCode: 404 })
	const b = await readBody(event)
	createOrder({ orderType: b.orderType || 'Testbestellung', pickupName: String(b.name || '1'), price: b.price || 0 })
	useNitroApp().socketServer?.emit('refreshOrders')
	return { ok: true }
})
