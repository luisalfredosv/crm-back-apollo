import { ApolloServer } from "apollo-server";
import { config } from "dotenv";
import { verify } from "jsonwebtoken";

import resolvers from "./db/resolvers";
import typeDefs from "./db/schema";

import { conectDB } from "./config/db";

config();
conectDB();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const token = req.headers.authorization ?? "";

		if (token) {
			try {
				const secret = process.env.SECRET;
				const user = await verify(token, secret);
				return {
					user,
				};
			} catch (error) {
				console.error(error);
			}
		}
	},
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`[SERVER] ready at ${url} 🚀`);
});
