import mongoose from "mongoose"
import {config} from "./config"

import { exit } from "process";

export const connectDB =async ()=>{
    try{
        await mongoose.connect(config.mongo.uri as string);
        console.log("databse connected")
    } catch (err) {
        console.log("Error in connecting to database: ", (err as Error).message)
        exit(1);
    }
}   