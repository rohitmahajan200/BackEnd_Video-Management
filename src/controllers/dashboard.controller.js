import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const allDetails=await User.aggregate([
        {
            $match:{"_id":req.user._id}
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"videosDetails",
                pipeline:[
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"video",
                            as:"likeDetails",
                        },
                      
                    }, 
                    {
                         $addFields:{
                            likesCount:{
                                $size:"$likeDetails"
                            },
                        },
                    },
                    {    
                        $lookup:{
                            from:"comments",
                            localField:"_id",
                            foreignField:"video",
                            as:"commentDetails"
                        }
                    }
                ],
            },
            
        },
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200,allDetails,"deatils fectched"))
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const allVideos=await Video.find({
        owner:req.user._id
    })
    if(!allVideos){
        throw new ApiError(400,"No video is uploaded on channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,allVideos,"All video of channel is fetched"))
    
})

export {
    getChannelStats, 
    getChannelVideos
    }