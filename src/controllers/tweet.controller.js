import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import axios from 'axios'

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // check twiteer account exsist or not
    // twiteer logged in
    // destructure Tweet 

    const {content,owner} = req.body
    try {
        const checkOwner = await Tweet.findById(owner)
        
        if(!(checkOwner || content)){
            throw new ApiError(404,"Both fields are required to create a tweet");
        }
        const response = await axios.get('https://api.twitter.com/2/users/by/username/${owner}',{
            headers:{
                Authorization : 'Bearer ${process.env.TWITTER_BEARER_TOKEN}',
            },
        });
        
        return res
        .status(200)
        .json(
            new ApiResponse(200,"Tweet created Sucessfully")
        )
       } catch (error) {
        throw new ApiError(404,"Account does not  exists")
    }

})

const getUserTweets = asyncHandler(async (req, res) => {
    //  TODO: get user tweets
    const userId = req.user._id || req.params.userId

    const teweet = await Tweet.find({owner:userId}).select('-password');

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User tweet get Sucessfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const {owner,content} = req.body

        // Check owner exsits or content not
    
        if(!(owner,content)){
            throw new ApiError(400,"Owner or Content is missing");
        }
    
        // Update tweet
        const updateTweet = await Tweet.findByIdAndUpdate(
            owner,
            {
                $set:{
                   content,
                }
            },
            { new : true }
        );

        if(!updateTweet){
            throw new ApiError(404,"Tweet not found");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,"Tweeter updated Sucessfully")
        )
    } catch (error) {
        throw new ApiError(404,"Problem occures in updating tweet")
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    try {

        const {owner} = req.body

        // Check Twetter owner exsists or not
        if(!owner){
            throw new ApiError(400,"Twetter owner is missing")
        }

        const deleteOldTweet = await Tweet.findByIdAndDelete(
                owner,
                {
                    content : null ,
                }
            )
        if(!deleteOldTweet){
            throw new ApiError(404,"Tweet not found");
        }    

        return res
        .status(200)
        .json(
        new ApiResponse(200,"Tweet deleted Sucessfully")
    )
    } catch (error) {
        throw new ApiError(404,"Non Exsisting tweet can not be deleted")
    }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}