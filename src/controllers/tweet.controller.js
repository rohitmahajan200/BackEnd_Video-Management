import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler  from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { tweet } = req.body;
  const newTweet = await Tweet.create({
    owner: req.user._id,
    content: tweet,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newTweet, "New tweet created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userTweet = await Tweet.find({
    owner: req.user._id,
  });
  
  if(userTweet<=0){
    throw new ApiError(400,"User not tweet anything yet")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweet, "all tweets of user has been fetched")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { tweet } = req.body;
  const updatedTweet = await Tweet.findByIdAndUpdate(
    {
      _id: tweetId,
    },
    {
      content: tweet,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "all tweets of user has been fetched")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  await Tweet.findByIdAndDelete(tweetId);

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Tweet is deleted"))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
