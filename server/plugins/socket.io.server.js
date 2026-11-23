import { Server } from 'socket.io'
import { OrderStatus, SocketEvent } from "../utils/index";
import { updateOrder, getOrdersView } from '../utils/store';

export default defineNitroPlugin((nitroApp) => {
	const config = useRuntimeConfig()
	const socketServer = new Server(config.public.socketPort,{
		serveClient: false,
		cors: { origin: '*' }
	})

	// für den SumUp-Poller verfügbar machen
	nitroApp.socketServer = socketServer

	socketServer.on('connection',(socket) => {
		socket.on(SocketEvent.updateOrder, (order) => {
			updateOrder(order._id, order)
			socketServer.emit(SocketEvent.refreshOrders)
			if(order.status == OrderStatus.pickup) {
				const group = getOrdersView().pickupNames.find(n => n.name == order.pickupName)
				if(group?.ready) socketServer.emit(SocketEvent.pickupOrder, order.orderType+" für "+group.name)
			}
		})
	})
})
