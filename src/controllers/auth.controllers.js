import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import crypto from "crypto";
import {emailVerificationMailgenContent, sendEmail} from "../utils/mail.js"


const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(
            500,"Something went wrong while generating the token",
        );
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    const {email,username,password,role}=req.body

   const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or name is already exists",[])
    }

    const user= await User.create({
        email,
        password,
        username,
        isEmailVerified:false
    })
    const {unHashedToken,hashedToken,tokenExpiry}=
    user.generateTemporaryToken();

    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false})

    await sendEmail(
        {
            email:user?.email,
            subject:"Please verify your email",
            mailgenContent:emailVerificationMailgenContent(
                (await user).username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
            ),
        }
    );

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201)
    .json(
        new ApiResponse(
            200,
            {user:createdUser},
            "User registered successfully and verification email has been sent on your email"
        )
    )

});

const login=asyncHandler(async(req,res)=>{
    const {email,password,username}=req.body

    if(!email){
        throw new ApiError(400,"email is required")
    }

    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(400,"User does not exist");
    }
    
    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid Credentials");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options={
        httpOnly:true,
        secure:false
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User loggedIn Successfully"
        ),
    )

});

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        //finding the user
        req.user._id,{
            //to change any field
            $set:{
                refreshToken:""
            }
        },
        {//means once everything is done give me the most updated object or the most newest object
            new:true
        },
    );
    const options={
        httpOnly:true,
        secure:false
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged out"));
});

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current User fetched Succcessfully"
        )
    )
})

const verifyEmail=asyncHandler(async(req,res)=>{
    const{verificationToken}=req.params
    if(!verificationToken){
        throw new ApiError(400,"Email verification token is missing")
    }
    let hashedToken=crypto
    .createHash("sha256")// algo should be same  while creating and passing  like sha256 or else it will not match
    .update(verificationToken)
    .digest("hex")

    const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }
    });

    if(!user){
        throw new ApiError(400,"Token is invalid or Expired")
    }

    //there is some data in these tokens so clearing it before logging out this is optional
    user.emailVerificationToken=undefined
    user.emailVerificationExpiry=undefined

    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isEmailVerified:true
            },

        )
    )
})

// const resendEmail=asyncHandler(async(req,res)=>{

// })


// const getCurrentUser=asyncHandler(async(req,res)=>{

// })



export {registerUser,login,logoutUser,getCurrentUser,verifyEmail};