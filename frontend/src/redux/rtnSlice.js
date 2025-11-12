import { createSlice } from "@reduxjs/toolkit";

const rtnSlice= createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification: [], // Empty array as initial state
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            // Handle different notification types
            switch(action.payload.type) {
                case 'clear':
                    // Clear all notifications on login/logout
                    state.likeNotification = [];
                    break;

                case 'like':
                    // Only process likes with valid postId
                    if (action.payload.postId) {
                        // Remove any existing dislike notification from this user for this post
                        state.likeNotification = state.likeNotification.filter(
                            item => !(item.userId === action.payload.userId && 
                                    item.postId === action.payload.postId && 
                                    item.type === 'dislike')
                        );
                        // Add like notification only if it doesn't exist
                        const exists = state.likeNotification.some(
                            item => item.userId === action.payload.userId && 
                                    item.postId === action.payload.postId && 
                                    item.type === 'like'
                        );
                        if (!exists) {
                            // Add new notifications at the start of the array
                            state.likeNotification.unshift({
                                ...action.payload,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                    break;

                case 'dislike':
                    // Remove only the like notification from this user for this post
                    state.likeNotification = state.likeNotification.filter(
                        item => !(item.userId === action.payload.userId && 
                                item.postId === action.payload.postId && 
                                item.type === 'like')
                    );
                    break;

                default:
                    break;
            }
        },
        clearAllNotifications: (state) => {
            state.likeNotification = [];
        }
    }
});
export const {setLikeNotification, clearAllNotifications}= rtnSlice.actions;
export default rtnSlice.reducer;