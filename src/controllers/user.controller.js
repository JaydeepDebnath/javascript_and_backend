import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async(req,res)=>{
   return res.status(200).json({   // status code with json message
        message : "Okay"
   }) 
})

export {
registerUser,
}