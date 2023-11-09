import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
	orderType: { type: String, required: true },
	options: [String],
	pickupName: String,
	status: {type: String, enum: ['ordered','pickup','done'], required: true },
	price: Number,
	devTest: Boolean
}, { timestamps: true })

const orderTypeSchema = new mongoose.Schema({
	name: String,
	price: Number
})

const optionSchema = new mongoose.Schema({
	name: String,
	price: Number
})

const pickupNameSchema = new mongoose.Schema({
	name: String
})

const OrderModel = mongoose.model('order',orderSchema)
const OrderTypeModel = mongoose.model('ordertype',orderTypeSchema)
const OptionModel = mongoose.model('option',optionSchema)
const PickupNameModel = mongoose.model('pickupname',pickupNameSchema)

export { OrderModel, OrderTypeModel, OptionModel, PickupNameModel }