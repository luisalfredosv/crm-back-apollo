import { Schema, model, Types } from "mongoose";

import Client from "./Client";
import User from "./User";

const OrdersSchema = Schema({
	order: {
		type: Array,
		required: true,
	},
	total: {
		type: Number,
		required: true,
	},
	client: {
		type: Types.ObjectId,
		required: true,
		ref: Client.name,
	},
	seller: {
		type: Types.ObjectId,
		required: true,
		ref: User.name,
	},
	status: {
		type: String,
		default: "PENDIENTE",
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

export default model("Orders", OrdersSchema);
