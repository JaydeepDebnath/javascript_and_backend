import {Router} from "express"
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from '../controllers/comments.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router

router.route("/get_video_comments/:videoId").get(getVideoComments)
router.route("/add_comments/:videoId").post(addComment)
router.route("/update_comments/:commentId").patch(updateComment)
router.route("/delete_comments/:commentId").delete(deleteComment)