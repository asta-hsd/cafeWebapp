import { OrderModel } from "../models"

export default defineEventHandler(async (event) => {
	try {
		let {startDate, endDate} = await getQuery(event)
		
		const orders = await OrderModel.aggregate([
			[
				{
				  $match:
					{
					  createdAt: {
						$gte: new Date(startDate),
						$lt: new Date(endDate),
					  },
					},
				},
				{
				  $lookup:
					{
					  from: "ordertypes",
					  localField: "orderType",
					  foreignField: "name",
					  as: "orderType",
					},
				},
				{
				  $unwind:
					"$orderType",
				},
			  ]	
		])

		return orders
	} catch (e) {
		console.log(e)
	}
})