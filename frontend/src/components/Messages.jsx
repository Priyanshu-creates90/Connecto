import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessage();
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    messageId: null,
    isSentByMe: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () =>
      setContextMenu({
        show: false,
        x: 0,
        y: 0,
        messageId: null,
        isSentByMe: false,
      });
    if (contextMenu.show) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu.show]);

  const handleContextMenu = (e, messageId, isSentByMe) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate position to keep menu in viewport
    const menuWidth = 200;
    const menuHeight = 110;
    let x = e.clientX;
    let y = e.clientY;

    // Adjust if menu would go off right edge
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 20;
    }

    // Adjust if menu would go off bottom edge
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 20;
    }

    // Ensure minimum distance from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setContextMenu({
      show: true,
      x,
      y,
      messageId,
      isSentByMe,
    });
  };

  const handleMessageClick = (e, messageId, isSentByMe) => {
    // For double click
    if (isSentByMe) {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 110;

      let x = rect.right - menuWidth; // Align to right of message
      let y = rect.bottom + 5;

      // Adjust if menu would go off right edge
      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 20;
      }

      // Adjust if menu would go off left edge
      if (x < 10) {
        x = 10;
      }

      // Adjust if menu would go off bottom edge
      if (y + menuHeight > window.innerHeight) {
        y = rect.top - menuHeight - 5; // Show above message
      }

      setContextMenu({
        show: true,
        x,
        y,
        messageId,
        isSentByMe,
      });
    }
  };

  const handleDeleteMessage = async (deleteType) => {
    try {
      const res = await axios.delete(
        `https://connecto-1-psxd.onrender.com/api/v1/message/delete/${contextMenu.messageId}`,
        {
          data: { deleteType },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        // Remove message from local state
        const updatedMessages = messages.filter(
          (msg) => msg._id !== contextMenu.messageId
        );
        dispatch(setMessages(updatedMessages));
      }
    } catch (error) {
      console.log(error);
    }
    setContextMenu({
      show: false,
      x: 0,
      y: 0,
      messageId: null,
      isSentByMe: false,
    });
  };

  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button
              className="h-8 my-2 bg-slate-200 cursor-pointer"
              variant="secondary"
            >
              View profile
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {messages &&
          messages.map((msg) => {
            const isSentByMe =
              msg.senderId?._id === user?._id || msg.senderId === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${
                  isSentByMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  onContextMenu={
                    isSentByMe
                      ? (e) => handleContextMenu(e, msg._id, isSentByMe)
                      : undefined
                  }
                  onDoubleClick={
                    isSentByMe && !isMobile
                      ? (e) => handleMessageClick(e, msg._id, isSentByMe)
                      : undefined
                  }
                  onClick={
                    isSentByMe && isMobile
                      ? (e) => handleMessageClick(e, msg._id, isSentByMe)
                      : undefined
                  }
                  className={`p-2 rounded-2xl max-w-xs break-words ${
                    isSentByMe ? "cursor-pointer select-none" : ""
                  } ${
                    isSentByMe
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Menu - Only for messages sent by me */}
      {contextMenu.show && contextMenu.isSentByMe && (
        <div
          className="fixed bg-white shadow-xl rounded-lg py-1 z-[9999] border border-gray-300 w-[200px]"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            maxWidth: "calc(100vw - 20px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage("forme");
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 text-sm text-gray-700 whitespace-nowrap"
          >
            Delete for Me
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage("permanent");
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 text-sm text-red-600 font-medium whitespace-nowrap"
          >
            Delete for Everyone
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;
