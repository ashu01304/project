import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on("connected", ()=>{
            console.log("Database connected");
        }); 
        await mongoose.connect(`${process.env.MONGODB_URI}/web-dev-25`)
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
    }
}

export default connectDB;
