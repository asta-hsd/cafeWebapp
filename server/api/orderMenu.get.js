import { OptionModel, OrderTypeModel } from "../models"

export default defineEventHandler(async () => {
	try {
		const options = await OptionModel.find()
		const types = await OrderTypeModel.find()
		return {
			options: options,
			orderTypes: types
		}
	} catch (e) {
		console.log(e)
	}
})