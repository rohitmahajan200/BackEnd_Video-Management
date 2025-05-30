import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

//check wheather the channel is already subscribe
//create a subscribe doc add subscriber as current user and channel as in params
const subScribeToChannel=asyncHandler(async(req,res)=>{
    const user=req.user._id;
    const {channelId}=req.params;
    
    if(new mongoose.Types.ObjectId(channelId).equals(user)){
       throw new ApiError(400,"Cannot subscibe to self")
    }

    const isAlradySubscribe=await Subscription.findOne({channel:channelId})
    if(isAlradySubscribe){
        throw new ApiError(400,"Already Subscribe to this channel")
    } 

    const subscribe=await Subscription.create({
        subscriber:user,
        channel:channelId
    })
    
    return res
    .status(200)
    .json(new ApiResponse(200,subscribe,"Channel subscribe successfully"))
    
})

export{subScribeToChannel}
