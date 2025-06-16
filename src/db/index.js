import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connetDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected! DB Host:-${connectionInstance.connection.name}`);
        
    } catch (error) {
        console.log("Error in DB connection=>",error);
        process.exit(1); 
    }
}