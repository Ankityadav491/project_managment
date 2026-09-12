import mongoose from  "mongoose";   

//mongoose.connect(process.env.MONGOOSE_URI) this might work and might not might throw error so to handle error gracefully we use try catch and methods 

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGOOSE_URI) //we use await because connection might take some time 
    }catch(error){
        console.error("MongoDB connection error",error)
        process.exit(1) //exist if the database is not connected
    }
}

export default connectDB