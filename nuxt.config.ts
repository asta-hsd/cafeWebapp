// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		head: {
			htmlAttrs: {
				lang: 'de',
			},
		}
	},
	runtimeConfig: {
		dbUrl: process.env.DATABASE_URL,
		dbName: process.env.DBNAME,
		public: {
			socketPort: process.env.SOCKET_PORT,
			socketUrl: process.env.SOCKET_URL,
			maxPickupTime: process.env.MAX_PICKUP_TIME
		}
	},
	plugins: [
		'./plugins/socket.io',
		'./plugins/VueDatePicker'
	],
	// nitro: {
	// 	plugins: [
	// 		'./plugins/socket.io.server'
	// 	]	
	// },
  	devtools: { enabled: true }
})
