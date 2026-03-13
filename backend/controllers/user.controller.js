import  User   from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import sharp from "sharp";
import { getReceiverSocketId, io } from "../socket/socket.js";


// Register a new user

export const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        // Check if user already exists
        if(!username || !email || !password){
            return res.status(400).json({
                message: "Something is missing,please check!",
                success: false
            });
        }
        const user= await User.findOne({email});
        if(user){
            return res.status(409).json({
                message: "User already exists",
                success: false
            });
        };
        const hashedPassword = await  bcrypt.hash(password,10); 
        await User.create({
            username,
            email,
            password : hashedPassword
});
        return res.status(201).json({
            message: "User registered successfully",
            success: true
        }   );
} catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
}
}

export const login = async (req, res) => {
      try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "Something is missing,please check!",
                success: false
            });
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: "User does not exist",
                success: false
            });
        }
        const isPasswordMatch = await bcrypt.compare(password,user.password); 
        if(!isPasswordMatch){
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            });
        };
        const token= await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1d'}); 
                                                                //env.secrest_key means it carry secretkey which store in .env file
        //populate each post if in the posts array of user
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if(post && post.author.equals(user._id)){
                    return post;
            }
            return null;
        })
        );
        user={
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            Posts:populatedPosts,
        }

        return res.cookie("token",token,{httpOnly:true,sameSite:'strict', maxAge : 1*24*60*60*1000}).json({ //cookie store token in variable token   //sameSite:'strict' use to give more security
            message:`Welcome back, ${user.username}`,
            success:true,
            user,
        });
      } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
      }
};
export const logout = async (_, res) => {
    try{
        return res.cookie("token","",{maxAge:0}).json({
            message:"Logged out successfully",
            success:true,
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};  

export const getProfile = async (req, res) => {
    try{
        const userId = req.params.id; //req.params.id means jiska profile dekhna hai uska id //here params use to get id from url
        //difference between req.params.id and req.id is req.id means jo login hai uska id and req.params.id means jiska profile dekhna hai uska id
        let user = await User.findById(userId).populate({path:'posts', options:{sort:{createdAt:-1}}}).populate('bookmarks');
        return res.status(200).json({
            success:true,
            user,
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }   
};

export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.id)
            .select("-password")
            .populate({ path: "posts", options: { sort: { createdAt: -1 } } })
            .populate("bookmarks");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const editProfile = async (req, res) => {
    try{
        const userId = req.id;
        const {bio,gender} = req.body;
        const profilePicture = req.file ;
        const user= await User.findById(userId).select("-password");
        if (!user){
            return res.status(404).json({
                message: "User not found",
                success: false
            });
         };
        if (typeof bio === "string") {
            user.bio = bio.trim();
        }

        if (typeof gender === "string" && gender !== "") {
            const normalizedGender = gender.toLowerCase();
            const allowedGenders = ["male", "female", "other"];

            if (!allowedGenders.includes(normalizedGender)) {
                return res.status(400).json({
                    message: "Invalid gender value",
                    success: false,
                });
            }
            user.gender = normalizedGender;
        }

        if (profilePicture) {
            const optimizedImageBuffer = await sharp(profilePicture.buffer)
                .resize({ width: 512, height: 512, fit: "cover" })
                .toFormat("jpeg", { quality: 80 })
                .toBuffer();

            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                resource_type: "image",
                folder: "socialmedia/profile",
                timeout: 120000,
            });
            user.profilePicture = cloudResponse.secure_url;
        }

            await user.save();
            return res.status(200).json({
                message: "Profile updated successfully",
                success: true,
                user,
            });
    } catch (error){
        console.log(error);
        const uploadError = error?.error ?? error;
        if (uploadError?.name === "TimeoutError" || uploadError?.http_code === 499) {
            return res.status(504).json({
                message: "Profile image upload timed out. Please retry with a smaller image.",
                success: false,
            });
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid profile data",
                success: false,
            });
        }
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try{
        const SuggestedUsers = await User.find({_id: {$ne: req.id}}).select("-password"); 
        if (!SuggestedUsers){                      
            return res.status(404).json({
                message: "No users found",
        
            });
         };
            return res.status(200).json({
                success:true,
                users:SuggestedUsers,
            });
    } catch (error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
export const followOrUnfollow = async (req, res) => {
    try{
        const followKrneWala = req.id; 
        const jiskoFollowKrunga = req.params.id; 
         if(followKrneWala === jiskoFollowKrunga){
            return res.status(400).json({
                message: "You cannot follow/unfollow yourself",
                success: false
            });
         }
         const user = await User.findById(followKrneWala);
            const targetUser = await User.findById(jiskoFollowKrunga);
            if(!user || !targetUser){
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
            //now check i have to follow or unfollow
            const isFollowing = user.following.some(
                (id) => id.toString() === jiskoFollowKrunga
            );
            if (isFollowing){
                await Promise.all([
                    User.updateOne({_id: followKrneWala},{$pull: {following: jiskoFollowKrunga}}),
                    User.updateOne({_id: jiskoFollowKrunga},{$pull: {followers: followKrneWala}}),
                ])
                return res.status(200).json({
                    message: `You have unfollowed ${targetUser.username}`,
                    success: true,
                });
            } else {
                await Promise.all([
                    User.updateOne({_id: followKrneWala},{$push: {following: jiskoFollowKrunga}}),
                    User.updateOne({_id: jiskoFollowKrunga},{$push: {followers: followKrneWala}}),
                ])

                const targetUserSocketId = getReceiverSocketId(jiskoFollowKrunga);
                if (targetUserSocketId) {
                    const followerDetails = {
                        _id: user._id,
                        username: user.username,
                        profilePicture: user.profilePicture,
                    };
                    io.to(targetUserSocketId).emit("notification", {
                        type: "follow",
                        userId: followKrneWala,
                        userDetails: followerDetails,
                        message: `${user.username} started following you`,
                        timestamp: new Date().toISOString(),
                    });
                }

                return res.status(200).json({
                    message: `You are now following ${targetUser.username}`,
                    success: true,
                });
            }
        } catch (error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }};

 
