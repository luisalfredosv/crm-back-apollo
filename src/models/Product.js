import { Schema, model } from "mongoose";

const ProductsSchema = Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	stock: {
		type: Number,
		required: true,
		trim: true,
	},
	price: {
		type: Number,
		required: true,
		trim: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

export default model("Products", ProductsSchema);
