import { Schema, model, Types } from "mongoose";

import User from "./User";

const ClientsSchema = Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	surname: {
		type: String,
		required: true,
		trim: true,
	},
	company: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	phone: {
		type: String,
		trim: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	vendedor: {
		type: Types.ObjectId,
		require: true,
		ref: User.name,
	},
});

export default model("Clients", ClientsSchema);
