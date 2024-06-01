import {Router} from 'express'
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/videos").get(verifyJWT,getAllVideos);
router.route("/videos/publish/:videoId").post(verifyJWT,upload.single("videoLocalPath"),publishAVideo);
router.route("/videos/:videoId").get(getVideoById);
router.route("/videos/:videoId").put(verifyJWT,updateVideo);
router.route("/videos/:videoId").delete(verifyJWT,deleteVideo);
router.route("/videos/togglePublish/:videoId").put(togglePublishStatus);


export default router
