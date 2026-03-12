import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { appendMessage } from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [userLastMessage, setUserLastMessage] = useState(() => {
    const saved = localStorage.getItem("chatLastMessages");
    return saved ? JSON.parse(saved) : {};
  });
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth,
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem("chatLastMessages", JSON.stringify(userLastMessage));
  }, [userLastMessage]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const senderId = lastMsg.senderId?._id || lastMsg.senderId;
      const receiverId = lastMsg.receiverId?._id || lastMsg.receiverId;
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

  const sortedUsers = React.useMemo(() => {
    return [...suggestedUsers].sort((a, b) => {
      const aTime = userLastMessage[a._id]?.timestamp || 0;
      const bTime = userLastMessage[b._id]?.timestamp || 0;
      return bTime - aTime;
    });
  }, [suggestedUsers, userLastMessage]);

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(appendMessage(res.data.newMessage));
        setTextMessage("");
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
    <div className="w-full h-[calc(100vh-8rem)] flex gap-4 lg:gap-5">
      <section
        className={`${
          selectedUser ? "hidden lg:flex" : "flex"
        } w-full lg:w-[340px] flex-col glass-panel p-3 lg:p-4`}
      >
        <p className="section-eyebrow px-3">Inbox</p>
        <h1 className="font-bold mt-1 mb-3 px-3 text-lg md:text-xl">
          {user?.username}
        </h1>
        <div className="overflow-y-auto pr-1 h-full space-y-1">
          {sortedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            const selected = selectedUser?._id === suggestedUser?._id;
            return (
              <div
                key={suggestedUser._id}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  selected
                    ? "bg-teal-50 border border-teal-200"
                    : "hover:bg-white/70 border border-transparent"
                }`}
              >
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 ring-1 ring-slate-200">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-sm sm:text-base truncate">
                    {suggestedUser?.username}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-teal-700" : "text-slate-400"
                    }`}
                  >
                    {isOnline ? "online now" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedUser ? (
        <section className="flex-1 elevated-card flex flex-col h-full overflow-hidden">
          <div className="flex gap-3 items-center px-4 py-3 border-b border-slate-200 bg-white/85 sticky top-0 z-10">
            <button
              onClick={() => dispatch(setSelectedUser(null))}
              className="lg:hidden mr-1 text-xl text-slate-500"
            >
              {"<"}
            </button>
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-1 ring-slate-200">
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-semibold truncate">
                {selectedUser?.username}
              </span>
              <span className="text-xs text-slate-500">Direct thread</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center gap-2 p-3 sm:p-4 border-t border-t-slate-200 bg-white/85">
            <div className="input-shell flex-1">
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                type="text"
                className="focus-visible:ring-transparent text-sm sm:text-base border-none shadow-none bg-transparent px-0"
                placeholder="Write a message..."
              />
            </div>
            <Button
              className="bg-teal-700 hover:bg-teal-800 h-10 rounded-full px-5 text-sm sm:text-base"
              onClick={() => sendMessageHandler(selectedUser?._id)}
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="hidden lg:flex flex-1 elevated-card flex-col items-center justify-center px-4 text-center">
          <MessageCircleCode className="w-20 h-20 my-3 text-teal-700" />
          <h1 className="font-semibold text-lg">Start a conversation</h1>
          <span className="text-sm text-slate-500 mt-1">
            Pick someone from the left panel to start messaging.
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
