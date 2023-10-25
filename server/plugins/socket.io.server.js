import { Server } from 'socket.io'
import { OrderStatus, SocketEvent } from "../utils/index";
import { OrderModel } from '../models';

export default defineNitroPlugin((nitroApp) => {
	const config = useRuntimeConfig()
	const socketServer = new Server(config.public.socketPort,{
		serveClient: false,
		cors: {
			origin: '*'
		}
	})

	socketServer.on('connection',(socket) => {
		console.log("Connected:")

		socket.on(SocketEvent.newOrder, async (data) => {
			const order = new OrderModel(data)
	
			console.log('sent order')
			console.log(data)
			await order.save();


			socketServer.emit(SocketEvent.refreshOrders)
		})

		socket.on(SocketEvent.updateOrder, async (order) => {
			await OrderModel.findOneAndUpdate({_id: order._id},order)
			socketServer.emit(SocketEvent.refreshOrders)
			if(order.status == OrderStatus.pickup) {
				const resp = await $fetch('/api/orders')
				let orderName = resp.pickupNames.find(name => name.name == order.pickupName)

				if(orderName.ready) {
					orderName.completedAt = new Date()
					socketServer.emit(SocketEvent.pickupOrder, orderName)
				}
			}
		})

	})
})