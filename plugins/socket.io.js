import io from 'socket.io-client'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig().public
	console.log(`${config.socketUrl}:${config.socketPort}`)
	const socket = io(window.location.hostname+':'+config.socketPort,{
		autoConnect: false,
	})

	return {
		provide: {
			io: socket
		}
	}
})