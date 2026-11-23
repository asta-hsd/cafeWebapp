import { initStore } from '../utils/store'

export default defineNitroPlugin(async () => {
	await initStore()
	console.log('[store] JSON-Speicher geladen')
})
