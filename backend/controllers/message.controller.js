 import { Conversation } from "../models/conversation.model.js";

 export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const{message}=req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });
        if (!conversation) {
            conversation = await conversation.create({
                participants: [senderId, receiverId],
            })
        };
        const newMessage =  await Message.create({
            senderId,
            receiverId,
            message});

          if(newMessage) conversation.messages.push(newMessage._id);
          await Promise.all([conversation.save(), newMessage.save()]);

          //implementing real-time messaging using socket.io
          

            return res.status(200).json({
                success: true,
                newMessage
            });
    } catch (error) {
        console.log(error);
    }
 }

    export const getMessage = async (req, res) => {
        try {
            const senderId = req.id;
            const receiverId = req.params.id;
            const conversation = await Conversation.find({
                participants: { $all: [senderId, receiverId] },
            });
            if (!conversation) return req.status(200).json({success:true,messages:[]});

            return res.status(200).json({
                success: true,
                messages: conversation?.messages });

        } catch (error) {
            console.log(error);
        }
    }