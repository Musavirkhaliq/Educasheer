import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is not defined");
        }

        // Check if MONGO_URL already includes a database name
        const mongoUrl = process.env.MONGO_URL.includes(DB_NAME)
            ? process.env.MONGO_URL
            : `${process.env.MONGO_URL}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(mongoUrl);
        console.log(`\n MongoDB Connected, DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed", error);
        process.exit(1);
    }
}

export default connectDB;