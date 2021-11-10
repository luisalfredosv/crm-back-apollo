import { gql } from "apollo-server";

const typeDefs = gql`
	type User {
		id: ID
		name: String
		surname: String
		email: String
		createdAt: String
	}

	type Token {
		token: String
	}

	type Product {
		id: ID
		name: String!
		stock: Int!
		price: Float!
		createdAt: String
	}

	type Client {
		id: ID
		name: String
		surname: String
		email: String
		phone: String
		company: String
		seller: String
	}

	type Order {
		id: ID
		order: [OrderGroup]
		total: Float
		client: ID
		seller: ID
		createdAt: String
		status: StatusOrder
	}

	type OrderGroup {
		id: ID
		quantity: Int
	}

	type TopClient {
		total: Float
		client: [Client]
	}

	type TopSeller {
		total: Float
		seller: [User]
	}

	input UserInput {
		name: String!
		surname: String!
		email: String!
		password: String!
	}

	input AuthInput {
		email: String!
		password: String!
	}

	input ProductInput {
		name: String!
		stock: Int!
		price: Float!
	}

	input ClientInput {
		name: String!
		surname: String!
		email: String!
		company: String!
		phone: String
	}

	input OrderProductInput {
		id: ID
		quantity: Int
	}

	input OrderInput {
		order: [OrderProductInput]
		total: Float
		client: ID
		status: StatusOrder!
	}

	enum StatusOrder {
		PENDIENTE
		COMPLETADO
		CANCELADO
	}

	type Query {
		# Users
		getUser(token: String!): User

		# Products
		getProducts: [Product]
		getProduct(id: ID!): Product

		# Clients
		getClients: [Client]
		getClientsOfTheSeller: [Client]
		getClient(id: ID!): Client

		# Orders
		getOrders: [Order]
		getOrdersOfTheSeller: [Order]
		getOrder(id: ID!): Order
		getOrderByStatus(estado: StatusOrder!): [Order]

		# Advanced searches
		getTopClients: [TopClient]
		getTopSeller: [TopSeller]

		# Searching
		searchProduct(text: String!): [Product]
	}

	type Mutation {
		# Users
		newUser(input: UserInput): User
		authUser(input: AuthInput): Token

		# Products
		newProduct(input: ProductInput): Product
		updateProduct(id: ID!, input: ProductInput): Product
		deleteProduct(id: ID!): String

		# Clients
		newClient(input: ClientInput): Client
		updateClient(id: ID!, input: ClientInput): Client
		deleteClient(id: ID!): String

		# Orders
		newOrder(input: OrderInput): Order
		updateOrder(id: ID!, input: OrderInput): Order
		deleteOrder(id: ID!): String
	}
`;

export default typeDefs;
