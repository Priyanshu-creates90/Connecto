import {createSlice} from "@reduxjs/toolkit";

const chatSlice =createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
    },
    reducers:{
        //actions
        setOnlineUsers:(state,action)=>{
            state.onlineUsers= action.payload;
        },
        setMessages:(state,action)=>{
            state.messages= action.payload;
        },
        appendMessage:(state,action)=>{
            const incomingMessage = action.payload;
            const exists = state.messages.some((msg) => msg._id === incomingMessage._id);
            if (!exists) {
                state.messages.push(incomingMessage);
            }
        },
        
    }
});

export const{setOnlineUsers,setMessages,appendMessage}= chatSlice.actions;
export default chatSlice.reducer;
