import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app=express();

//basic config
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

//cors config
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    
    credentials:true,

    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    
    allowedHeaders:["Content-Type","Authorization"]
}))


//importing the routes

import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js"


app.use("/api/v1/healthcheck",healthCheckRoutes);

app.use("/api/v1/auth",authRouter);



app.get("/",(req,res)=>{
    res.send("welcome")
})

export default app;