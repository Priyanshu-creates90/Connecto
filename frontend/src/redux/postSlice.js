import { createSlice } from "@reduxjs/toolkit";
 const postSlice = createSlice ({
    name:"post",
    initialState:{
        posts:[],
        selectedPost:null,
    },
    reducers:{
        setPosts:(state,action) =>{
            if (Array.isArray(action.payload)) {
                // If receiving an array of posts (initial load)
                state.posts = action.payload;  // Backend already sorts by createdAt
            } else {
                // If receiving a single new post
                state.posts = [action.payload, ...state.posts];
            }
        },
        setSelectedPost:(state,action) =>{
            state.selectedPost=action.payload;
        },
        applyRealtimeLikeUpdate:(state,action) =>{
            const { postId, userId, type } = action.payload || {};
            if (!postId || !userId || (type !== "like" && type !== "dislike")) {
                return;
            }

            const updateLikes = (likes = []) => {
                const normalizedUserId = String(userId);
                const hasLiked = likes.some((id) => String(id) === normalizedUserId);

                if (type === "like" && !hasLiked) {
                    return [...likes, userId];
                }

                if (type === "dislike" && hasLiked) {
                    return likes.filter((id) => String(id) !== normalizedUserId);
                }

                return likes;
            };

            state.posts = state.posts.map((post) =>
                post?._id === postId
                    ? { ...post, likes: updateLikes(post.likes) }
                    : post
            );

            if (state.selectedPost?._id === postId) {
                state.selectedPost = {
                    ...state.selectedPost,
                    likes: updateLikes(state.selectedPost.likes),
                };
            }
        }
    }
 })
 export const {setPosts,setSelectedPost,applyRealtimeLikeUpdate} = postSlice.actions;

 export default postSlice.reducer;
