import mongoose from "mongoose"
import {Comment} from "../models/comments.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {
        const comments =await Comment.aggregate([
            {
                $match:{
                    videos : mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField : "_id",
                    as : "owner",
                }
            },
            {
                $project:{
                    _id:1,
                    content :1,
                    owner : {$arrayElem:["$owner",0]},
                    createdAt : 1,
                    updatedAt:1
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,"Comment created Sucessfully"
            ) 
        )
    } catch (error) {
        throw new ApiError(404,"Video could not found ")
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    try {
        const comment = new Comment({
            content : content,
            video : videoId,
            owner:req.user._id
        });

        if (!content) {
            throw new ApiError(203,"Need some content to do a comment")
        }

        await comment.save();

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,"New comment created sucessfully"
            ) 
        )
        
    } catch (error) {
        throw new ApiError(400,"Failed to add comment into video")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { content,commentId } = req.body;

    try {

        if (!commentId) {
            throw new ApiError(400,"Comment Id is required to update the comment")
            
        }
        const updateComment = await Comment.
        findByIdAndUpdate(
            commentId,
            {
                $set:{
                    content,
                }
            },
            { new : true }
        )

        if (!updateComment) {
            throw new ApiError(404,"Comment not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updateComment,"Comment updated sucessfully"
            ) 
        )
        
    } catch (error) {
        throw new ApiError(400,"Banlk comment could not be updatd ")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.body

    try {

        if (!commentId) {
            throw new ApiError(400, "Comment ID is required to delete the comment");
        }

        const deletedComment = await Comment.
        findByIdAndDelete(commentId)

        if (!deletedComment) {
            throw new ApiError(404, "Comment not found");
        }
        
    } catch (error) {
        throw new ApiError(404,"Required comment can not be deleted")
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }