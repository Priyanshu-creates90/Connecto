import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    message: { type: String, required: true },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedPermanently: { type: Boolean, default: false }
}, { timestamps: true });
export const Message=mongoose.model('Message',messageSchema);
