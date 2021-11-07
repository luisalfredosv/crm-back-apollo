import { genSalt, hash, compare } from "bcrypt";
import { sign, decode, verify } from "jsonwebtoken";

import User from "../models/Usuario";

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

const resolvers = {
	Query: {
		getUser: async (_, { token }) => {
			const secret = process.env.SECRET;
			const userId = await verify(token, secret);

			return userId;
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
	},
};

export default resolvers;
