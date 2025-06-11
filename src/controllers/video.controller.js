import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType=1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    page=parseInt(page,10)
    limit=parseInt(limit,10)
    sortType=parseInt(sortType,10)

    const allVideos=await Video.aggregate([
        {
            $match:{
                ispublished:true
            }
        },
        {
            $sort:{sortBy:sortType}
        },
        {
            $facet:{
                metaData:[{$count:'totalCount'}],
                data:[
                    {
                        $skip:((page-1) *limit)
                    },
                    {
                        $limit:limit
                    }
                ]
            }
            
        }
        
    ])
    res
    .status(200)
    .json(new ApiResponse(200,allVideos,"All videos are get fetched.."))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description,ispublish} = req.body
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
        ispublished:ispublish,
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
    const { videoId } = req.params;
    const {title, description}=req.body;
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
    if(!videoId){
        throw new ApiError(400,"video id is required")
    }
    const deletedVideo=await Video.findByIdAndDelete(videoId);
    if(!deletedVideo){
         throw new ApiError(500,"Something went wrong while deleting the video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"video deleted successfully"))
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const updatedVideo=await Video.findById(videoId);

        updatedVideo.ispublished=!updatedVideo.ispublished

        await updatedVideo.save()

        return res
        .status(200)
        .json(new ApiResponse(200,updateVideo,))
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}