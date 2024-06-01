import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router

router.route("/tweets").post(verifyJWT,createTweet);
router.route("/tweets").get(verifyJWT,getUserTweets);
router.route("/tweets/:tweetId").put(verifyJWT,updateTweet);
router.route("/tweets/:tweetId").delete(verifyJWT,deleteTweet);

export default router