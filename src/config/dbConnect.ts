import mongoose from "mongoose";

const dbConnect = async () => {
    mongoose.set('strictQuery', true);
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MongoDB URI is not defined in the environment variables.");
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export default dbConnect;
