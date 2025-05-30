import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";


//check wheather the channel is already subscribe
//create a subscribe doc add subscriber as current user and channel as in params
const subScribeToChannel=asyncHandler(async(req,res)=>{
    const user=req.user._id;
    const {channelId}=req.params;

    const subscribe=await Subscription.create({
        subscriber:user,
        channel:channelId
    })
    
    return res
    .status(200)
    .json(subscribe),
    "Channel subscribe successfully"
})

export{subScribeToChannel}
