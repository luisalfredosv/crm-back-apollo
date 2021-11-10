import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

import User from "../models/User";
import Product from "../models/Product";
import Client from "../models/Client";
import Order from "../models/Order";

const generateToken = (user) => {
	const { id } = user;
	const secret = process.env.SECRET;
	const expiredTime = process.env.EXPIRED_TIME;
	const payload = {
		id,
	};

	return sign(payload, secret, {
		expiresIn: expiredTime,
	});
};

const findUser = async (email) => {
	return await User.findOne({
		email,
	});
};

const findClient = async (email) => {
	return await Client.findOne({
		email,
	});
};

const findProduct = async (id) => {
	return await Product.findById(id);
};

const resolvers = {
	Query: {
		getUser: async (_, { token }) => {
			const secret = process.env.SECRET;
			const userId = await verify(token, secret);

			return userId;
		},

		getProducts: async () => {
			try {
				return await Product.find();
			} catch (error) {
				console.error(error);
			}
		},

		getProduct: async (_, { id }) => {
			const product = await findProduct(id);

			if (!product) throw new Error("Producto no encontrado");

			return product;
		},

		getClients: async () => {
			try {
				return await Client.find();
			} catch (error) {
				console.log(error);
			}
		},

		getClientsOfTheSeller: async (_, {}, ctx) => {
			try {
				return await Client.find({ seller: ctx.user.id.toString() });
			} catch (error) {
				console.log(error);
			}
		},

		getClient: async (_, { id }, ctx) => {
			try {
				const client = await Client.findById(id);

				if (!client) throw new Error("Cliente no encontrado");

				if (client.seller.toString() !== ctx.user.id.toString()) {
					throw new Error("No tienes el nivel de acceso requerido");
				}

				return client;
			} catch (error) {
				console.log(error);
			}
		},

		getOrders: async () => {
			try {
				return await Order.find();
			} catch (error) {
				console.log(error);
			}
		},

		getOrdersOfTheSeller: async (_, {}, ctx) => {
			try {
				return await Order.find({
					seller: ctx.user.id.toString(),
				});
			} catch (error) {
				console.log(error);
			}
		},

		getOrder: async (_, { id }, ctx) => {
			try {
				const order = await Order.findById(id);

				if (!order) throw new Error("Pedido no encontrad");

				if (order.seller.toString() !== ctx.user.id.toString()) {
					throw new Error("No tienes las crendenciales");
				}

				return order;
			} catch (error) {}
		},

		getOrderByStatus: async (_, { status }, ctx) => {
			return await Order.find({
				seller: ctx.user.id.toString(),
				status,
			});
		},

		getTopClients: async () => {
			return await Order.aggregate([
				{
					$match: {
						status: "COMPLETADO",
					},
				},
				{
					$group: {
						_id: "$client",
						total: {
							$sum: "$total",
						},
					},
				},
				{
					$lookup: {
						from: "clients",
						localField: "_id",
						foreignField: "_id",
						as: "client",
					},
				},
				{
					$limit: 10,
				},
				{
					$sort: {
						total: -1,
					},
				},
			]);
		},

		getTopSeller: async () => {
			return await Order.aggregate([
				{
					$match: {
						status: "COMPLETADO",
					},
				},
				{
					$group: {
						_id: "seller",
						total: {
							$sum: "$total",
						},
					},
				},
				{
					$lookup: {
						from: "Users",
						localField: "_id",
						foreignField: "_id",
						as: "seller",
					},
				},
				{
					$limit: 3,
				},
				{
					$sort: {
						total: -1,
					},
				},
			]);
		},

		searchProduct: async (_, { text }) => {
			return await Product.find({
				$text: {
					$search: text,
				},
			}).limit(10);
		},
	},

	Mutation: {
		newUser: async (_, { input }) => {
			const { email, password } = input;

			const user = await findUser(email);

			if (user) throw new Error("El usuario ya existe");

			const salt = await genSalt(10);

			const hashed = await hash(password, salt);
			input.password = hashed;

			try {
				const newUser = new User(input);
				newUser.save();
				return newUser;
			} catch (error) {
				console.error(error);
			}
		},

		authUser: async (_, { input }) => {
			const { email, password } = input;

			const user = await findUser(email);

			if (!user) throw new Error("El usuario no existe");

			if (user && (await compare(password, user.password))) {
				return {
					token: generateToken(user),
				};
			}

			throw new Error("Usuario ó contraña incorrectos");
		},

		newProduct: async (_, { input }) => {
			try {
				const newProduct = new Product(input);

				return await newProduct.save();
			} catch (error) {
				console.error(error);
			}
		},

		updateProduct: async (_, { id, input }) => {
			let product = await findProduct(id);

			if (!product) throw new Error("Producto no encontrado");

			product = await Product.findByIdAndUpdate(id, input, { new: true });

			return product;
		},

		deleteProduct: async (_, { id }) => {
			const product = await findProduct(id);

			if (!product) throw new Error("Producto no encontrado");

			await Product.findByIdAndDelete(id);

			return "Producto eliminado";
		},

		newClient: async (_, { input }, ctx) => {
			const { email } = input;

			const client = await findClient(email);

			if (client) throw new Error("El cliente ya esta registrado");

			const newClient = await Client(input);

			newClient.seller = ctx.user.id;

			return await newClient.save();
		},

		updateClient: async (_, { id, input }, ctx) => {
			let client = await Client.findById(id);

			if (!client) throw new Error("El cliente no esta registrado");

			if (client.seller.toString() !== ctx.user.id.toString()) {
				throw new Error("No tienes el nivel de acceso requerido");
			}

			client = await Client.findByIdAndUpdate(id, input, {
				new: true,
			});

			return client;
		},

		deleteClient: async (_, { id, input }, ctx) => {
			let client = await Client.findById(id);

			if (!client) throw new Error("El cliente no esta registrado");

			if (client.seller.toString() !== ctx.user.id.toString()) {
				throw new Error("No tienes el nivel de acceso requerido");
			}

			await Client.findOneAndDelete({ _id: id });

			return "Cliente Eliminado";
		},

		newOrder: async (_, { id, input }, ctx) => {
			const { client, order } = input;
			const IsClient = await Client.findById(client);

			if (!IsClient) throw new Error("El cliente no esta registrado");

			if (IsClient.seller.toString() !== ctx.user.id.toString()) {
				throw new Error("No tienes el nivel de acceso requerido");
			}

			for await (const item of order) {
				const { id } = item;
				const product = await Product.findById(id);

				if (item.quantity > product.stock) {
					throw new Error(
						`El articulo ${product.name} excede la cantidad disponible`
					);
				}
			}
		},

		updateOrder: async (_, { id, input }, ctx) => {
			const { client } = input;

			const order = await Order.findById(id);

			if (!order) throw new Error("El pedido no existe");

			const isClient = await Client.findById(client);

			if (!isClient) throw new Error("El cliente no esta registrado");

			if (isClient.seller.toString() !== ctx.user.id.toString()) {
				throw new Error("No tienes el nivel de acceso requerido");
			}

			for await (const item of input.order) {
				const { id } = item;

				const product = await Product.findById(id);

				if (articulo.quantity > product.stock) {
					throw new Error(
						`El articulo ${product.name} excede la cantidad disponible`
					);
				} else {
					product.stock = product.stock - articulo.quantity;

					await product.save();
				}
			}

			return await Order.findOneAndUpdate(id, input, { new: true });
		},
		deleteOrder: async (_, { id }, ctx) => {
			const order = await Order.findById(id);

			if (order) throw new Error("El pedido no existe");

			if (order.seller.toString() !== ctx.user.id.toString()) {
				throw new Error("No tienes el nivel de acceso requerido");
			}

			await Order.findOneAndDelete({
				_id: id,
			});

			return "Pedido eliminado";
		},
	},
};

export default resolvers;
