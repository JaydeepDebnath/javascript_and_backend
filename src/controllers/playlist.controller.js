import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlists.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    try {
        const playList = await Playlist.create({
            name,
            description,
            owner : req.user._id
        })

        if(!playList){
            throw new ApiError(404,"All fields are required to create a Playlist")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,userDataUpdate,
        "Playlist created sucessfully "))

    } catch (error) {
        throw new ApiError(500,"Error while Creatung playlist")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    try {
        const getPlayList = await Playlist.aggregate([
            {
                $match:{
                    owner : mongoose.Types.ObjectId(userId),
                }
            },
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Get user playlist sucessfully"
            ) 
        )

    } catch (error) {
        throw new ApiError(404,"Error getting user playlist")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    try {
        const playlist = await Playlist.findById(playlistId).populate('videos').populate('owner');

        if(!playlist){
            throw new ApiError(404,"Playlist does not exists")
        }
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Playlist id get sucessfully"
            ) 
        )
    } catch (error) {
        throw new ApiError(404,"Error occurs in searching playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    try {
        const playList = Playlist.findById(playlistId).populate('videos').populate('owner');
        const videos = Playlist.aggregate([
            {
                $match:{
                    videos : mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "videos",
                    foreignField : "_id",
                    as : "videos",
                }
            },
            {
                $unwind:"$videos"
            },
            {
                $project:{
                    "_id":"$videos._id",
                    "userName":"$videos.userName",
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,"Videos added to playlist"
            ) 
        )
        
    } catch (error) {
        throw new ApiError(404,"Error while adding videos to playlist")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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