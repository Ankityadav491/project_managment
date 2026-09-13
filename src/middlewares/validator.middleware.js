import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";


//reusable format most of the time it is same 
export const validate=(req,res,next)=>{
    const errors=validationResult(req);
    if(errors.isEmpty()){
        return next();
    }
    const extractedErrors=[];
    errors.array().map((error)=>extractedErrors.push(
        {
            [err.path]:err.msg
        }));
        throw new ApiError(422,"Entered data is not valid",extractedErrors);
};
