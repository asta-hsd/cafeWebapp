import { OrderModel } from "../models"

export default defineEventHandler(async (event) => {
	let body = await readBody(event)


	console.log(body)


	const order = new OrderModel({
		orderType: body.orderType,
		options: [],
		status: OrderStatus.done,
		pickupName:  '',
		price: body.price,
		devTest: body.devTest
	})

	await order.save();


	// const order = new OrderModel(data)
	
	// console.log(data)
	// await order.save();


	// socketServer.emit(SocketEvent.refreshOrders)
})