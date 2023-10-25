import { OrderModel, PickupNameModel } from "../models"
import { OrderStatus } from "../utils"

export default defineEventHandler(async () => {
	try {
		// const result = await OrderModel.aggregate([
		// 	{
		// 		$addFields: {
		// 			orderType: { $toObjectId: '$orderType' }
		// 		}
		// 	},
		// 	{
		// 		$lookup: {
		// 			from: 'ordertypes',
		// 			localField: 'orderType',
		// 			foreignField: '_id',
		// 			as: 'orderType'
		// 		}
		// 	},
		// 	{ $unwind: "$orderType" }
		// ])

		const orders = await OrderModel.find({ status: { $in: [OrderStatus.ordered, OrderStatus.pickup] } } )
		const pickupNames = await PickupNameModel.aggregate([
			{
			  $lookup: {
				from: "orders",
				localField: "name",
				foreignField: "pickupName",
				as: "orders",
			  },
			},
			{
			  $addFields:
				{
				  orders: {
					$filter: {
					  input: "$orders",
					  as: "order",
					  cond: {
						$in: [
						  "$$order.status",
						  ["ordered", "pickup"],
						],
					  },
					},
				  },
				},
			},
		  ])




		pickupNames.map(name => {
			name.ready = name.orders.length > 0 && name.orders.every(order => order.status == OrderStatus.pickup)
		})

		

		return {
			orders: orders,
			pickupNames: pickupNames.filter(name => name.orders.length > 0),
			availableNames: pickupNames.filter(name => name.orders.length == 0)
		}
	} catch (e) {
		console.log(e)
	}
})