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
        
        
    } catch (error) {
        throw new ApiError(404,"Error occurs in searching playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
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