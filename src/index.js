import dotenv from "dotenv";
import app from "./app.js";

import connectDB from "./db/databaseConnection.js";


dotenv.config({
    path:"./.env",
})

console.log("MONGOOSE_URI exists:", !!process.env.MONGOOSE_URI);

//console.log("PORT =", process.env.PORT);

const port=process.env.PORT || 3000;


connectDB()
  .then(()=>{
      app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      })
  })
  .catch((err)=>{
    console.log("MongoDb connection error")
    process.exit(1)
  })



