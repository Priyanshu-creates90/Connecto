import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import {addComment, addNewPost, bookmarkPost, deletePost, disLikePost, getAllPost, getCommentsOfPost, getUserPost, likePost} from '../controllers/post.controller.js';
import e from 'express';

const router = express.Router();
router.route("/addpost").post(isAuthenticated,upload.single("postImage"),addNewPost );  
router.route("/all").get(isAuthenticated,getAllPost); 
router.route("/userpost/all").get(isAuthenticated,getUserPost ); 
router.route("/:id/Like").get(isAuthenticated,likePost);
router.route("/:id/disLike").get(isAuthenticated,disLikePost);
router.route("/:id/comment").post(isAuthenticated,addComment);
router.route("/:id/comment/all").post(isAuthenticated,getCommentsOfPost);
router.route("/delete/:id").post(isAuthenticated,deletePost);
router.route("/:id/bookmark").post(isAuthenticated,bookmarkPost);
 
     export default router;