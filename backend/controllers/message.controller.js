import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    // Check if conversation exists between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If not found, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    // Push message ID into conversation and save both
    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // Implementing real-time messaging using socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log("Error in sendMessage:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({ success: true, messages: [] });
    }

    // Filter out messages deleted for this user
    const filteredMessages = conversation.messages.filter(
      msg => !msg.isDeletedPermanently && !msg.deletedFor.includes(senderId)
    );

    return res.status(200).json({
      success: true,
      messages: filteredMessages,
    });
  } catch (error) {
    console.log("Error in getMessage:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.id;
    const { messageId } = req.params;
    const { deleteType } = req.body; // 'permanent' or 'forme'

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Check if user is sender or receiver
    if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (deleteType === 'permanent') {
      // Only sender can delete permanently
      if (message.senderId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Only sender can delete permanently" });
      }
      message.isDeletedPermanently = true;
      await message.save();

      // Emit socket event to both users
      const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messageDeleted', { messageId, deleteType: 'permanent' });
      }
    } else {
      // Delete for me
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.log("Error in deleteMessage:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
