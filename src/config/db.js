import { connect } from "mongoose";

const options = {
	// autoIndex: false, // Don't build indexes
	// maxPoolSize: 10, // Maintain up to 10 socket connections
	// serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	// socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	// family: 4, // Use IPv4, skip trying IPv6
	useNewUrlParser: true,
	useUnifiedTopology: true,
	// useFindAndModify: false,
	// useCreateIndex: true,
};

export const conectDB = async () => {
	try {
		await connect(process.env.MONGO_URL, options);
		console.log(`[DATABASE] ready 📦`);
	} catch (error) {
		console.error(`[DATABASE]Err: ${error}`);
		process.exit(1);
	}
};
