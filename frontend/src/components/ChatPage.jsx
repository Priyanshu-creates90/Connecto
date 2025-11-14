import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [userLastMessage, setUserLastMessage] = useState(() => {
    const saved = localStorage.getItem("chatLastMessages");
    return saved ? JSON.parse(saved) : {};
  });
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  // Save to localStorage whenever userLastMessage changes
  useEffect(() => {
    localStorage.setItem("chatLastMessages", JSON.stringify(userLastMessage));
  }, [userLastMessage]);

  // Update last message timestamp when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const senderId = lastMsg.senderId?._id || lastMsg.senderId;
      const receiverId = lastMsg.receiverId?._id || lastMsg.receiverId;

      // Determine which user to update (the other person in conversation)
      const otherUserId = senderId === user?._id ? receiverId : senderId;

      if (otherUserId && otherUserId !== user?._id) {
        setUserLastMessage((prev) => ({
          ...prev,
          [otherUserId]: {
            timestamp: Date.now(),
            message: lastMsg.message,
          },
        }));
      }
    }
  }, [messages, user?._id]);

  // Sort suggested users based on last message timestamp
  const sortedUsers = React.useMemo(() => {
    return [...suggestedUsers].sort((a, b) => {
      const aTime = userLastMessage[a._id]?.timestamp || 0;
      const bTime = userLastMessage[b._id]?.timestamp || 0;
      return bTime - aTime; // Most recent first
    });
  }, [suggestedUsers, userLastMessage]);

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `https://connecto-1-psxd.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
        // Update last message timestamp for this user
        setUserLastMessage((prev) => ({
          ...prev,
          [receiverId]: {
            timestamp: Date.now(),
            message: textMessage,
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <section
        className={`${
          selectedUser ? "hidden md:flex" : "flex"
        } w-full md:w-1/4 my-4 md:my-8 flex-col`}
      >
        <h1 className="font-bold mb-4 px-3 text-lg md:text-xl">
          {user?.username}
        </h1>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {sortedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id); //include give true of false
            return (
              <div
                key={suggestedUser._id} //  Unique key added here
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-sm sm:text-base truncate">
                    {suggestedUser?.username}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chat Section */}
      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <button
              onClick={() => dispatch(setSelectedUser(null))}
              className="md:hidden mr-2 text-xl"
            >
              ←
            </button>
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-medium truncate">
                {selectedUser?.username}
              </span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center p-3 sm:p-4 border-t border-t-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent text-sm sm:text-base"
              placeholder="Messages..."
            />
            <Button
              className="bg-blue-500 hover:bg-blue-400 h-9 sm:h-10 text-sm sm:text-base"
              onClick={() => sendMessageHandler(selectedUser?._id)}
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="hidden md:flex flex-col items-center justify-center mx-auto px-4">
          <MessageCircleCode className="w-24 h-24 sm:w-32 sm:h-32 my-4" />
          <h1 className="font-medium text-base sm:text-lg">Your messages</h1>
          <span className="text-sm sm:text-base text-gray-600">
            Send a message to start a chat.
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
