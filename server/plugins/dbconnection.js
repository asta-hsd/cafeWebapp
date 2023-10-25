import mongoose from "mongoose"

export default async () => {
	const config = useRuntimeConfig()
	const DB_OPTIONS = {
		dbName: config.dbName
	}
	try {
		let connection = await mongoose.connect(config.dbUrl,DB_OPTIONS)
	} catch(e) {
		console.log(e)
	}
}