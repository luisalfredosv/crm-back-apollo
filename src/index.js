import { ApolloServer } from "apollo-server";
import { config } from "dotenv";

import resolvers from "./db/resolvers";
import typeDefs from "./db/schema";

import { conectDB } from "./config/db";

config();
conectDB();

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`[SERVER] ready at ${url} 🚀`);
});
