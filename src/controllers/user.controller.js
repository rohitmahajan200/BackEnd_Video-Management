import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiErrors.js'
import {User} from "../models/user.model.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
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

export {registerUser}
