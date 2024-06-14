import {Router} from "express"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from '../controllers/playlist.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router

router.route("/playlist").post(verifyJWT,createPlaylist);
router.route("/playlist").get(verifyJWT,getUserPlaylists);
router.route("/playlist/:playlistId").get(getPlaylistById);
router.route("/playlist/add_video/:playlistId/:videoId").put(addVideoToPlaylist);
router.route("/playlist/remove_video/:playlistId/:videoId").delete(removeVideoFromPlaylist);
router.route("/playlist/delete/:playlistId").delete(deletePlaylist);
router.route("/playlist/update/:playlistId").patch(deletePlaylist);


export default router