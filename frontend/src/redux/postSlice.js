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
        }
    }
 })
 export const {setPosts,setSelectedPost} = postSlice.actions;

 export default postSlice.reducer;