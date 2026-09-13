import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { error } from "console";

const userSchema=new Schema(
    {
    avatar:{
        type:{
            url:String,
            localPath:String,
        },
        default:{
            url:`https://placehold.co/200x200`,
            localPath:""
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    refereshToken:{
        type:String
    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type:Date
    }
},{
    timestamps:true,
},
);

userSchema.pre("save",async function (){
    //safe gaurding that only hash when work on password not on any password
    if(!this.isModified("password")) return 
    this.password=await bcrypt.hash(this.password,10)
    
})


//methods this can be defined anywhere better to keep it with the schema itself  to check the entere password is correct

userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            //generally we keep payload of refresh token sort 
            // email:this.email,
            // username:this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateTemporaryToken=function(){
    const unHashedToken=crypto.randomBytes(20).toString("hex")
    const hashedToken=crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")

    const tokenExpiry=Date.now()+(20*60*1000) //adding 20mins of expiry to token genereated
    return {unHashedToken,hashedToken,tokenExpiry};
}


export const User=mongoose.model("User",userSchema)
