import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if([name, description].some(value=>!value)){
        throw new ApiError(400,"Name and Description is mandatory");
    }
    const newPlalist=await Playlist.create({name,
    description,
    owner:req.user._id,
    videos:[]
    //TODO: create playlist
})
    return res
    .status(201)
    .json(new ApiResponse(201,newPlalist,"New playlist has been created"))
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400,"User id is required")
    }
    //TODO: get user playlists
    // const userPlaylist=await Playlist.findOne({
    //     owner:userId
    // });
    const userPlaylist=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"videos",
                as:"videoDetail"
            }
        },
    ])


    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Play list fetched for user"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }
    //TODO: get user playlists
    const userPlaylist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"videos",
                as:"videoDetail"
            }
        },
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Play list fetched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if([playlistId, videoId].some(value=>!value)){
        throw new ApiError(400,"playlist id and video id is mandatory");
    }
    await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet:{videos:videoId}
        },
        {
            new:true
        }
    )

    const userPlaylist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"videos",
                as:"videoDetail"
            }
        },
    ])
    
    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Video is added to playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
     if([playlistId, videoId].some(value=>!value)){
        throw new ApiError(400,"playlist id and video id is mandatory");
    }
     const userPlaylist=await Playlist.findById(playlistId);

    const allvideos= userPlaylist.videos;
    const updatedArray=allvideos.filter((video)=>!new mongoose.Types.ObjectId(video._id).equals(new mongoose.Types.ObjectId(videoId)));
    userPlaylist.videos=updatedArray
    await userPlaylist.save();

    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Video is added to playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    // if(isValidObjectId(playlistId)){
    //     throw new ApiError(400,"Play list id is not valid")
    // }
    const deletedList=await Playlist.findByIdAndDelete(playlistId);
    if(!deletedList){
        throw new ApiError(400,"Play list not exist or Something wrong")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"List is deleted"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
        if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }
    //TODO: get user playlists
    const userPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
    {
       // $set:{
            name,
            description
        //}
    },
    {
        new:true,
        runValidators:true
    });

    userPlaylist.name=name,
    userPlaylist.description=description

    await userPlaylist.save();
    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Play list has been updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}