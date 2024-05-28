import mongoose,{isValidObjectId, set} from "mongoose";
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.file?.path

    if(!videoLocalPath){
        throw new ApiError(200,"Video file is missing")    // title,des validation check
    }

    const video = await uploadOnCloudinary
    (videoLocalPath)

    if(!video.url){
        throw new ApiError
        (400,"Error while uploading on video")
       }
    
       const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set :{
                videoFile : video.url
            }
        },
        {new : true}
    )

    const mediaDevices = navigator.mediaDevices;

        if(!mediaDevices){
            throw new ApiError(201,"Error while using mediaDevices")
        }


        mediaDevices.getUserMedia({video: true})
        .then(stream=>{
            const videoCapture = new videoCapture(stream);

            // start video capturing.
            videoCapture.start();

            // capture a frame of video

            const frame = videoCapture.read();

            // stop capturing video

            videoCapture.stop();

            return res
            .status(200)
            .json(
                new ApiResponse(200,"Video Captured Sucessfully")
            )

        })


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(404,"Video not found")
        }
    } catch (error) {
        throw new ApiError(500,"Error retriving video")
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description,thumbnail} = req.body
    //TODO: update video details like title, description, thumbnail

    if(!(title ||description ||thumbnail)){
        throw new ApiError(201,"All fields are requird")
    }

    const userDataUpdate = await Video.findById(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail,
            }
        },
        {new : true}   
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,userDataUpdate,
    "Video details updated sucessfully "))
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const deleteVideo = await Video.findByIdAndDelete(videoId)

        if(!deleteVideo){
            throw new ApiError(404,"Video not found ");
        }
    } catch (error) {
        throw new ApiError(404,"Not existing video can not be deleted")
        
    }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    try {
        const video = await Video.findById(videoId)
        
        if(!video){
            throw new ApiError(404,"Video not Found")
        }

        video.published = !video.published;

        await video.save();

        return res
        .status(200)
        .json(
            new ApiResponse(200,"Video Updated Sucessfully")
        )
    
    } catch (error) {
        throw new ApiError(400,"Errors that occur during the toggeled process")
    }
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}