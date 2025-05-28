import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiErrors.js'
import {User} from "../models/user.model.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";

const genrateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken= user.genrateAccessToken();
        const refreshToken= user.genrateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while genrating tokens")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
   
    const {fullName,email,password,userName}=req.body;
    
    if([fullName,email,password,userName].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fileds are required")
    }

    const existingUser= await User.findOne({
        $or:[{email},{userName}]
    });

    if(existingUser){        
        throw new ApiError(409,"User alredy exist")
    }

    const avtarLocalPath=req.files?.avatar[0]?.path;
    
    //const coverLocalPath=req.files?.coverImage[0]?.path;
    let coverLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverLocalPath=req.files.coverImage[0].path
    }

    if(!avtarLocalPath){
        throw new ApiError(400,"Avatar is mandatory")
    }

    const avatar=await uploadonCloudinary(avtarLocalPath);
    const coverImage=await uploadonCloudinary(coverLocalPath);
    
    if(!avatar){
        throw new ApiError(400,"Avatar is mandatory")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registration")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User Regsitered Successfully")
    )






});

const loginUser=asyncHandler(async(req,res)=>{
    //extract data from body    
    const {userName,email,password}=req.body;

    //check email/username & password is not empty
    if(!(userName || email)){
        throw new ApiError(400,"Username or Email is required")
    }

    //check if user exist or not
    //extract password if user exist
    const user=await User.findOne({
        $or:[{userName},{email}]
    })
    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    //compaire encrypted password with user enterd password
    const isPasswordValid=await user.isPasswordCorrect(password)
     if(!isPasswordValid){
        throw new ApiError(401,"Incorrect Password")
    }
    
    //genrate the access and refresh token and set in cookies
    const {accessToken,refreshToken}=await genrateAccessAndRefreshToken(user._id)

    const loggedUser=await User.findById(user._id).select("-password -refreshToken")
    //return the user

    const options={
        httpOnly:true,
        secure:true,
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            user:loggedUser,
            accessToken,
            refreshToken
        },
        "User LoggedIn Successfully"))
});

const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    })

    const options={
        httpOnly:true,
        secure:true,
    }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
    
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const token=req.cookies?.refreshToken;
    if(!token){
        throw new ApiError(401,"Unauthorised")
    }
    try {
        const oldRefreshToken=await jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(oldRefreshToken._id);
        if(user.refreshToken!==token){
            throw new ApiError(401,"Invalid Token")
        }
        const {accessToken,refreshToken}=await genrateAccessAndRefreshToken(user._id)
        
        
          const options={
            httpOnly:true,
            secure:true,
        }
    
        res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken
            },
            "Access Token Refreshed."
        ))
    
    } catch (error) {
        throw new ApiError(501,error.message || "Somthing went wrong while refreshing the token")
    }
})
export {registerUser,loginUser,logoutUser,refreshAccessToken}
