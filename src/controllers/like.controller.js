import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    let newLike;
    if(!videoId){
        throw new ApiError(400,"PRovide proper video id")
    }

    const isAlredyLiked=await Like.findOneAndDelete({video:videoId});

    if(!isAlredyLiked){
        newLike= await Like.create({
        commnet:null,
        video:videoId,
        likeBy:req.user._id,
        tweet:null
    })
     return res
    .status(201)
    .json(new ApiResponse(201,newLike,"You Liked the video"))
    }

    return res
    .status(201)
    .json(new ApiResponse(201,{},"Like is removed"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    let newLike;
    if(!commentId){
        throw new ApiError(400,"Provide proper comment id")
    }

    const isAlredyLiked=await Like.findOneAndDelete({commnet:commentId});

    if(!isAlredyLiked){
        newLike= await Comment.create({
        commnet:commentId,
        video:null,
        likeBy:req.user._id,
        tweet:null
    })
     return res
    .status(201)
    .json(new ApiResponse(201,newLike,"You Liked the comment"))
    }

    return res
    .status(201)
    .json(new ApiResponse(201,{},"Like is removed"))


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    let newLike;
    if(!tweetId){
        throw new ApiError(400,"Provide proper tweet id")
    }
    const isAlredyLiked=await Tweet.findOneAndDelete({tweet:tweetId});

    if(!isAlredyLiked){
        newLike= await Tweet.create({
        commnet:null,
        video:null,
        likeBy:req.user._id,
        tweet:tweetId
    })
     return res
    .status(201)
    .json(new ApiResponse(201,newLike,"You Liked the tweet"))
    }

    return res
    .status(201)
    .json(new ApiResponse(201,{},"Like is removed"))

}
)
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allVideos=await Like.aggregate([
        {
            $match:{
                    likeBy:req.user._id,
                    commnet:null,
                    tweet:null
            }
        },
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"video",
                as:"videoList"
            }
        },
        {
            $unwind:"$videoList"
        },
        {
            $addFields:{
                video:"$videoList.videofile"
            }
        },
        {
            $project:{video:1}
        }
        
    ])
    console.log(allVideos);
    
    if(!allVideos){
        throw new ApiError(400,{},"User not liked any video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,allVideos,"Liked video fetched"))
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}