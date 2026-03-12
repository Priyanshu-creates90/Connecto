import SuggestedUsers from "@/components/SuggestedUsers";
import { createSlice } from "@reduxjs/toolkit";

const updateLikesByPostId = (collection = [], { postId, userId, type }) => {
    if (!Array.isArray(collection) || !postId || !userId) {
        return collection;
    }

    return collection.map((post) => {
        if (post?._id !== postId) {
            return post;
        }

        const likes = post.likes || [];
        const normalizedUserId = String(userId);
        const hasLiked = likes.some((id) => String(id) === normalizedUserId);

        if (type === "like" && !hasLiked) {
            return { ...post, likes: [...likes, userId] };
        }

        if (type === "dislike" && hasLiked) {
            return {
                ...post,
                likes: likes.filter((id) => String(id) !== normalizedUserId),
            };
        }

        return post;
    });
};

const authSlice=createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
    },
    reducers:{
        setAuthUser:(state,action)=>{
            state.user=action.payload;
        },
        setSuggestedUsers:(state,action) =>{
            state.suggestedUsers=action.payload;
        },
        setUserProfile:(state,action) =>{
            state.userProfile=action.payload;
        },
        setSelectedUser:(state,action) =>{
            state.selectedUser=action.payload;
        },
        applyRealtimeLikeUpdateToProfile:(state,action)=>{
            const { postId, userId, type } = action.payload || {};
            if (!postId || !userId || (type !== "like" && type !== "dislike")) {
                return;
            }

            if (state.userProfile?.posts) {
                state.userProfile = {
                    ...state.userProfile,
                    posts: updateLikesByPostId(state.userProfile.posts, {
                        postId,
                        userId,
                        type,
                    }),
                    bookmarks: updateLikesByPostId(state.userProfile.bookmarks, {
                        postId,
                        userId,
                        type,
                    }),
                };
            }
        }
    }
});
export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    applyRealtimeLikeUpdateToProfile,
} = authSlice.actions;
export default authSlice.reducer;
