// import mongoose from "mongoose";
import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   //conersation mean participant
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, { timestamps: true });
 export const Conversation = mongoose.model('Conversation',conversationSchema);
