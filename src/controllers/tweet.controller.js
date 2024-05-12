import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

Tweet.config({ 
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.TWEETER_API_KEY, 
    api_secret: process.env.TWEETER_API_KEY_SECRET, 
  });

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // check twiteer account exsist or not
    // twiteer logged in
    // destructure Tweet 

    const {content,owner} = req.body

    if(!(content || owner)){
        throw new ApiError(201,"You can't upload blank tweet or without Account")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                content,
            }
        },
        {new : true}

    ).select("-password")

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}