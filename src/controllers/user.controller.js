import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js"

import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { response } from "express"

const generateAccessAndRefreshToken = async(userId)=>
{
    try {
      const user = await User.findById(userId) 
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken  //get refresh token from user
      await user.save({validateBeforeSave : false})    // .save , save to the db.validteBeforeSave dosen't check any validation

      return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
}
)

const loginUser = asyncHandler(async(req,res)=>{
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send secure cookie

    const {email,username,password}=req.body
    console.log(email);

    if(!username && !email){
        throw new ApiError(400,"Username or password is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const { accessToken, refreshToken }=await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select
   ("-password -refreshToken")

   const options = {
    httpOnly : true,    // cookies only modifieble by db,could not from frontend 
    secure : true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,{
            user : loggedInUser,accessToken,
            refreshToken
        },
        "User logged in sucessfully"
    )
   )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,   // query
        {
            $set :
            {
                refreshToken : undefined      // // which method need to update in db
            }            
        },
        {
            new : true , 
        }
    )

    const options = {
        httpOnly : true,    // cookies only modifieble by db,could not from frontend 
        secure : true
       }

       return res
       .status(200)
       .clearCookie("accessToken",options)
       .clearCookie("refreshToken",options)
       .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>
{
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Invalid request ")
    }

    const decodedToken = jwt.verify
    (incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user) 
    {
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !==user?.refreshToken)
    {
        throw new ApiError(401,"Refresh token is Expired")
    }


    const options =    
    {
        httpOnly : ture,
        secure : true
    }
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken},
            " Access token refreshed "
             
        )
    )
})

const changeCurrentPassword = asyncHandler(async(req,
    res)=>{
        const {oldPassword,newPassword} = req.body

        // if (!(newPassword === confPassword)) {
        //     throw new ApiError(400,"Both password must be equal")
        // }

        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user
        .isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError(400,"Invalid old password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave : false})

        return res
        .status(200)
        .json(new  ApiResponse(200,{},"Password changed sucessfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,
    res)=>{
        const {fullName,eamil} = req.body           // for update files , use a differnet method

        if(!(fullName || eamil)){
           throw new ApiError(400,"All fields are required") 
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullName,
                    eamil,
                }
            },
            {new : true}

        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,
        "Account details updated sucessfully "))
});

const updateUserCoverImage = asyncHandler(async(req,res)=>
{
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
    throw new ApiError(400,"Cover Image file is missing")
   }

   const coverImage = await uploadOnCloudinary
   (coverImageLocalPath)

   if(!coverImage.url){
    throw new ApiError
    (400,"Error while uploading on Image")
   }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Cover Image Update Sucessfully")
    )
})
 
const updateUserAvatar = asyncHandler(async(req,res)=>
{
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary
   (avatarLocalPath)

   if(!avatar.url){
    throw new ApiError
    (400,"Error while uploading on avatar")
   }

   const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Avatar Updated Sucessfully")
    )

    const deleteOldAvatar = await User
    .findByIdAndDelete(
    req.user._id,
    {
        avatarLocalPath : null ,
    }
    )
})


const getUserChannelProfile = asyncHandler
(async(req,res)=>
{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"User Name is missing")
    }

    // User.find({username})

   const channel = await User.aggregate([
    {
        $match:{                                        //filtering document
            username : username
        },
    },
    {
        $lookup:{
            from:"subscriptions",
            localField : "_id",
            foreignField :"channel",
            as : "subscribers"
           }
    },
    {
        $lookup : {
            from : "subscriptions",
            localField : "_id",
            foreignField : "subscriber",
            as : "subscribersTo"
        }
    },
    {
        $addFields : {
            subscribersCount : {
                $size : "$subscribers"
            },
            channelSubscriberdToCount : {
                $size : "$subscribersTo"
            },
                isSubscribed : {
                    $cond : {
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then :true,
                        else : false,
                    }
                }
            }     
        },
        {
            $project :{
                fullName : 1,
                username : 1,
                subscribersCount : 1,
                channelSubscriberdToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage: 1,
                email : 1,
            }
        }
   ])

   if (!channel?.length) {
    throw new ApiError(404,"Channel does not exists")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,channel[0],"User channel fatched sucessfuly")
   )

   if (!channel?.length) {
    throw new ApiError(404,"Channel does not exists")
   }
})


const getWatchHistory = asyncHandler
(async(req,res)=>
    {
        const user = await User.aggregate([
            {
                $match : {
                    _id : new mongoose.Types.
                    ObjectId(req.user._id)
                }
            },
            {
                $lookup : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "WatchHistory",
                pipeline:[     // to write nested pipelines
                    {
                        $lookup:{
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline :[
                                {
                                    $project : {
                                        fullName : 1,
                                      username : 1,
                                      avatar : 1,
                                    }
                                }
                            ]
                        }
                        
                    },
                    {
                        $addFields : {              // to ignore array index
                            owner : {
                                $first:"$owner"
                            }
                        }
                    }
                ]
                
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory
                ,"Watch history fetched sucessfully"
            ) 
        )
    }
)


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
}