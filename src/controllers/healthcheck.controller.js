import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";


// const healthCheck=async(req,res,next)=>{
//     try{
//         const user=await getUserFromeDB()
//         res.status(200).json(new ApiResponse(200,{message:"Server is running"}))
//     }catch(error){
//         next(err)
//     }
// }


//better version of the error handling code written above
const healthCheck=asyncHandler((req,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"Server is running"}))
    
});

export {healthCheck};