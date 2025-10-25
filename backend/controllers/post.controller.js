import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import{Post} from "../models/post.model.js";
import User from "../models/user.model.js";
import {Comment} from "../models/comment.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        if(!image) return res.status(400).json({ message: "Image is required" });
        //image upload to cloudinary

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800 ,height:800,fit:'inside'}) // Resize to a width of 800px
            .toFormat('jpeg',{quality:80}) // Convert to JPEG format and set quality to 80
            .toBuffer(); // Get the optimized image buffer

            const fileUri =`data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            const post = await Post.create({
                caption,
                image: cloudResponse.secure_url,
                author: authorId
            });
            const user = await User.findById(authorId);
            if(user){
                user.posts.push(post._id);
                await user.save();
            }
            await post.populate({path:"author",select:"password"});

            return res.status(201).json({
                message: "Post created successfully",
                success: true,
                post,
            });
            } catch (error) {
        console.log(error);
    } 
}
 export const getAllPost = async (req, res) => {
try {
    const posts= await Post.find().sort({createdAt:-1})
    .populate({path:"author",select:"username  profilePicture"})
    .populate({ path:"comments",
                sort:{createdAt:-1}, // Sort comments by createdAt in descending order
                populate:{path:"author",select:"username  profilePicture"}
    });
    return res.status(200).json({
        message: "Posts fetched successfully",
        success: true,
        posts,
    })
    
} catch (error) {
    console.log(error);
} 
};
export const getUserPost= async (req, res) => {
    try {
        const authorId = req.id;
        const posts= await Post.find({author:authorId}).short({createdAt:-1})
        .populate({path:"author",select:"username , profilePicture"})
        .populate({ path:"comments",sort:{createdAt:-1},
                    populate:{path:"author",select:"username , profilePicture"}
        });
        return res.status(200).json({
            posts,
            success:true,
            message:"User posts fetched successfully",
        });
    } catch (error) {
        console.log(error);
        
    }
}
export const likePost = async (req, res) => {
    try {
        const LikeKarneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: "Post not found",success:false });

        // Check if the user has already liked the post
        await post.updateOne({ $addToSet: { likes: LikeKarneWalaUserKiId } });
        await post.save();

        // implement socket io for real-time like update
        return res.status(200).json({
            message: "Post liked ",
            success: true,
             });

    } catch (error) {
       
    }
}
 export const disLikePost = async (req, res) => {
    try {
        const LikeKarneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: "Post not found",success:false });

        // Check if the user has already liked the post
        await post.updateOne({ $pull: { likes: LikeKarneWalaUserKiId } });
        await post.save();

        //
        return res.status(200).json({
            message: "Post disliked ",
            success: true,
             });

    } catch (error) {
       
    }
}
export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const { text } = req.body;
        const post = await Post.findById(postId);
        if(!text) return res.status(400).json({ message: "text is required",success:false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId,
        })

        await comment.populate({
            path:"author",
            select:"username  profilePicture"
            });
        post.comments.push(comment._id);
        await post.save();
      
        return res .status(201).json({
            message: "Comment added successfully",
            success: true,
            comment,
        });
    } catch (error) {
      console.log(error);  
    }
};
export const getCommentsOfPost = async (req, res) => {
   try {
    const postId = req.params.id;
    const comments= await Comment.find({post:postId}).populate("author","username  profilePicture");
    if(!comments) return res.status(404).json({ message: "No comments found for this post ",success:false });
    return res.status(200).json({
        success: true,
        comments,
    });
    
   } catch (error) {
    console.log(error);
   }
}
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: "Post not found",success:false });
        // Check if the requesting user is the author of the post
        if(post.author.toString() !== authorId){
            return res.status(403).json({ message: "You are not authorized to delete this post",success:false });
        }
        // Delete the post
        await Post.findByIdAndDelete(postId);

        //remove post id from user's posts array
        let user = await User.findById(authorId);
        user.posts=user.posts.filter((id) => id.toString() !== postId);
        await user.save();

        //dlete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true,
        });
        
    } catch (error) {
        console.log(error); 
    }
}
   export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const post= await Post.findById(postId);
        if(!post) return res.status(404).json({ message: "Post not found",success:false });

        const user= await User.findById(userId);
        if(user.bookmarks.includes(post._id)){
            // Post already bookmarked, remove it
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({
                type:'unsaved',
                message: "Post removed from bookmarks",
                success: true,
            });
 } else {
            // Post not bookmarked, add it
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({
                type:'saved',
                message: "Post bookmarked successfully",
                success: true,
            });
        }
         
    } catch (error) {
        console.log(error);
    }
   }