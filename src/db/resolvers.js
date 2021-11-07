import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

import User from "../models/User";
import Product from "../models/Product";
import Client from "../models/Client";

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
	},
};

export default resolvers;
