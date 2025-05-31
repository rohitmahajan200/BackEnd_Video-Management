import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType=1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const allVideos=await Video.aggregate([
        {
            $facet:{
                metaData:[{$count:'totalCount'}],
                data:[
                    {$skip:((page-1) *limit)},{$limit:limit}
                ]
            },
            
        },
        {
            $sort:{sortBy:sortType}
        }
        
    ])
    res
    .status(200)
    .json(new ApiResponse(200,allVideos,"All videos are get fetched.."))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
    const videoFile=req.files?.videoFile[0].path;
    const thumbnail=req.files?.thumbnail[0].path;
    
    const uplaodedVideo = await uploadonCloudinary(videoFile);
    const uplaodedThumbnail = await uploadonCloudinary(thumbnail);
    
    const video= await Video.create({
        videofile:uplaodedVideo.url,
        thumbnail:uplaodedThumbnail.url,
        title,
        description,
        duration:uplaodedVideo.duration,
        views:0,
        ispublished:true,
        owner:req.user._id
    })

    res
    .status(201)
    .json(new ApiResponse(201,video,"Video has been uploaded"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"video id is mandatory")
    }
    const video=await Video.findById(videoId);
    return res
    .status(200)
    .json(new ApiResponse(200,video.videofile,"Video fetched successfully"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description}=req.body
    const thumbnailLocalPath=req.file.path;
    const result=await uploadonCloudinary(thumbnailLocalPath)
    const video=Video.findByIdAndUpdate(videoId,
    {
        title,
        description,
        thumbnail:result.url,
    },
    {
        new:true, runValidators:false
    })

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video has been updated"))
    //TODO: update video details like title, description, thumbnail
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}