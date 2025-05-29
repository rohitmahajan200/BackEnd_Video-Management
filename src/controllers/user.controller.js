import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiErrors.js'
import {User} from "../models/user.model.js"
import {deleteImageFromCloudinary, uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";
import mongoose from "mongoose";

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
    const token=req.cookies?.refreshToken || req.body?.refreshToken;
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

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {newPassword,oldPassword}=req.body;
    const user=await User.findById(req?.user._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Password Not Matched")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    res
    .status(200)
    .json(new ApiResponse(200,{},"Password is chnaged successfully.."))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current user fetched"))
})

const updateAccoutDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body;
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }
    const user=await User.findByIdAndUpdate(req?.user._id,
    {
        $set:{
            fullName,
            email
        }
    },
    {
        new:true
    }).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Accont details updated successfully"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const newAvatar= await uploadonCloudinary(avatarLocalPath)
        if(!newAvatar.url){
        throw new ApiError(500,"Somthing went wrong while uploading avatar")
    }
    const userToRemoveExistingImage=await User.findById(req.user._id);
    
    ////////////////////////////////////////////////////////////////////////
    //  to extract Public Id fro ClodinaryURL to delete it from cloudinary
    const getPublicIdFromUrl = (url) => {
    try {
    const urlParts = url.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1]; // e.g. "photo.jpg"
    const folder = urlParts[urlParts.length - 2]; // e.g. "user-uploads"
    const fileName = fileWithExtension.replace(/\.[^/.]+$/, ""); // remove extension

    //return `${folder}/${fileName}`; // e.g. "user-uploads/photo"
    return fileName;
    } catch (error) {
    console.error("Invalid Cloudinary URL", error);
    return null;
    }
    };
    ////////////////////////////////////////////////////////////////////

    const publicID=getPublicIdFromUrl(userToRemoveExistingImage.avatar)
    
    await deleteImageFromCloudinary(publicID)
    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{avatar:newAvatar.url}
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Avatar has been updated"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const newcoverImageLocalPath= await uploadonCloudinary(coverImageLocalPath)

        if(!newcoverImageLocalPath.url){
        throw new ApiError(500,"Somthing went wrong while uploading cover image")
    }

    const userToRemoveExistingImage=await User.findById(req.user_id);
    await deleteImageFromCloudinary(userToRemoveExistingImage.coverImage)

    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{coverImage:newcoverImageLocalPath.url}
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Cover image has been updated"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
const {userName}=req.params;
if(!userName?.trim()){
    throw new ApiError(400,"User name is missing")
}
const channel=await User.aggregate([
    {
        $match:{
            userName:userName?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCounts:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },
    {
        $project:{
            fullName:1,
            userName:1,
            subscribersCount:1,
            channelsSubscribedToCounts:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
        }
    }
])
if(!channel?.length){
    throw new ApiError(404,"channel does not exist")
}
return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User Channel fetched succesfully.")
)

})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"Watch History Fetched"))
})

export
 {registerUser,loginUser,logoutUser,refreshAccessToken,
    getCurrentUser,changeCurrentPassword,updateAccoutDetails,
    updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}
