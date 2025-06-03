import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query
    const allCommnets=await Comment.find({
        video:videoId
    }).select("-_id -createdAt -updatedAt -video")
    
    return res
    .status(200)
    .json(new ApiResponse(200,allCommnets,"All commnets are fetched in content field"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {comment}=req.body;

    const newComment=await Comment.create({
    content:comment,
    video:videoId,
    owner:req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,newComment,"comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {comment}=req.body;

    const updatedComment=await Comment.findOneAndUpdate(
    {
        _id:commentId
    },
    {
        content:comment
    },
    {
        new:true
    }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Coment has been updated"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    const deletedComment=await Comment.findByIdAndDelete(commentId);
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Commnet deleted successfully"))
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }