import mongoose,{isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
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
        req.video._id,
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
    //TODO: get video by id

    const getVideo = await Video.findById(req.videos?._id)

    if(!getVideo){
        throw new ApiError(201,"Database dosen't found any video ID")
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description,thumbnail} = req.body

    if(!(title || description || thumbnail)){
        throw new ApiError(201,"Video title , description and thumbnail are required")
    }

    const updateVideoDetails = await Video.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                title,
                description,
            }
        },
        {new : true}

    ).select("-password")

    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath){
     throw new ApiError(400,"Thumbnail file is missing")
    }
 
    const uploadThumbnail = await uploadOnCloudinary
    (thumbnailLocalPath)
 
    if(!uploadThumbnail.url){
     throw new ApiError
     (400,"Error while uploading on Thumbnail")
    }

    const updateThumbnail = await Video.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                thumbnail : uploadThumbnail.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Thumbnail,Title,Description Updated Sucessfully")
    )

})

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video

//     const deleteAVideo = await User
//     .findByIdAndDelete(
//     req.videoId._id,
//     {
//         avatarLocalPath : null ,
//     }
//     )
// })