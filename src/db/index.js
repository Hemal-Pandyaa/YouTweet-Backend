import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv";
dotenv.config();

async function connectDB(){
    try{
        const connectionString = process.env.DATABASE_URL + "/" + DB_NAME;
        const connection = await mongoose.connect(connectionString);
        console.log("MonogoDB connected successfully!!!")
    }catch(error) {
        console.error("MongoDb Connectino error", error)
    }
}

export default connectDB;