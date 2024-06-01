import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {userId} = req.user || req.user._id;
    // TODO: toggle subscription
    try {
        const updateUser = await Subscription.aggregate([
            {
                $match:{
                    subscriber: new mongoose.Types
                    .ObjectId(userId),
                    channel : mongoose.Types.ObjectId(channelId)
                }
            },
            {
            $lookup:{
                from : "Subscriptions",
                localField : "channel",
                foreignField : "_id",
                as: "channelDetails",
                }
            },
            {
                $project:{
                    "_id":"$channelDetails._id",
                    "userName":"$channelDetails.userName",
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Toggeled Subscription Sucessfully"
            ) 
        )
    } catch (error) {
        throw new ApiError(500,"Error toggling subscription")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    try {

        const subscriber = await Subscription.aggregate([
            {
                $match:{
                    channel: mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup:{
                    from : "users",
                    localField: "subscriber",
                    foreignField:"_id",
                    as : "subscriber"
                }
            },
            {
                $unwind:"$subscriber"
            },
            {
                $project:{
                    "_id" : "$subscriber._id",
                    "usrName": "$subscriber.userName"
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Channel Subscriber get Sucessfully"
            ) 
        )
    } catch (error) {
        throw new ApiError(404,"Error in Subscribing channel")
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    try {
        const subscribedChannel = await Subscription.aggregate([
            {
                $match:{
                    channel : mongoose.Types
                    .ObjectId(subscriberId)
                }
            },
            {
                $lookup:{
                    from : "users",
                    localField: "channel",
                    foreignField: "_id",
                    as : "channelDetails"
                }
            },
            {
                $unwind: "$channel"
            },
            {
                $project: {
                    "_id": "$channel._id",
                    "UserName" : "$channel.userName"
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Subscribed channel get Sucessfully"
            ) 
        )
        
    } catch (error) {
        throw new ApiError(404,"Error occured in Subscribed Channel")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}