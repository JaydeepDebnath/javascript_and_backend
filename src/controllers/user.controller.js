import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js"

const registerUser = asyncHandler( async (rq,res)=>{
// get user details from frontend
// validation - not empty,@ have or not
// checkif user already exists : username,email
// check for images,check for avtar 
// upload them to cloudinary,avtar
// create user object - creat entry in db
// revome password and refresh token field from response
// check for user creation 
// return result

const {fullName,email,username,password} = req.body   // {destructur}.  body returns very object
console.log("Email :",email)
console.log("Fullname:",fullName)

    // if (fullName === ""){
    //     throw new ApiError(400,"Full name is required")
    // }

    if (
        [fullName,email,username].some((field)=>
        field?.trim()==="")   // if field exist '?' trim it.
        ) { 
            throw new ApiError(400,"All fields are required")
                        // we can use an array .same as multiple loop
        
         }
        //  const validateEmail = email.indexOf('@');   // email validation check

        const exitedUser = User.findOne({               //  findOne returns first User match value
            $or: [ { username },{ email } ]        // or take an array,we can check multiple methods using in a object
        })

        if ( exitedUser ) {
            throw new ApiError(409,"User with email or username already exists")
        }
        // req.body //express gives us data by body
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;        
        const profileImageLocalPath = req.files?.profileImage[0]?.path;        // multer gives files access.Avatar returns file,png,size property
        console.log(req.files);

        if (![avatarLocalPath,profileImageLocalPath]) {
            throw new ApiError(400,"Avtar and Profile Image file must be required ")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const profileImage = await uploadOnCloudinary(profileImageLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar ){
            throw new ApiError(400,"Avatar is required")
        }
        if(!profileImage){
            throw new ApiError(401,"profile file is required")
        }

        const user = await User.create({
            fullName,
            avatar : avatar.url,    // avatar url store in db
            coverImage : coverImage?.url || "",
            profileImage : profileImage.url,
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(                // findbyId is a method which pass a id
            "-password -refreshToken"                                            // .select is a method "which does not need you -..."    
        )                    
        
        if (createdUser) {
            throw new ApiError(500,"Something went wrong while registrating a user")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered sucessfully")
        )
})
export {
    registerUser,
}