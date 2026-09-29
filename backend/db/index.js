import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

let connectionPromise;

// Reuses the connection across warm serverless invocations.
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      .then((connectionInstance) => {
        console.log(
          `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );
        return connectionInstance.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
