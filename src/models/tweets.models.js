import { Timestamp } from "mongodb";
import mongoose, {Schema} from "mongoose";


const tweetSchema = new Schema(
    {
      owner : { 
        type : Schema.Types.ObjectId,    // twetee from "owner"
        ref : "User"
        },
        content : {
            type : String,
            required : true
        }
    },
    {timestamps : true})


export const Tweet = mongoose.model("Tweet",tweetSchema)