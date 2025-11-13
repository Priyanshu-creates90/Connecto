import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setAuthUser } from "@/redux/authSlice";
import { clearAllNotifications } from "@/redux/rtnSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/Profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      setHasNewMessage(false);
      navigate("/chat");
    }
  };

  useEffect(() => {
    // Listen for new messages
    socket?.on("newMessage", () => {
      if (!location.pathname.includes("/chat")) {
        setHasNewMessage(true);
      }
    });

    // Clear message indicator when on chat page
    if (location.pathname === "/chat") {
      setHasNewMessage(false);
    }

    return () => {
      socket?.off("newMessage");
    };
  }, [socket, location.pathname]);
  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    {
      icon: (
        <div className="relative">
          <MessageCircle />
          {hasNewMessage && (
            <div className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          )}
        </div>
      ),
      text: "Messages",
    },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-7 h-7 rounded-full">
          <AvatarImage
            src="{user?.profilePicture}"
            className="rounded-full"
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        //   <Avatar className="w-7 h-7">
        //   <AvatarImage src={user?.profilePicture} alt="post_image" />
        //   <AvatarFallback>CN</AvatarFallback>
        // </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen">
      <div className="flex flex-col">
        <h1 className="mt-8 ml-4 pl-3 font-bold text-xl">Connecto</h1>
        <div>
          {sidebarItems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center gap-3 relative  hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {item.icon}
                <span>{item.text}</span>
                {item.text === "Notifications" && (
                  
                  <Popover
                    onOpenChange={(open) => {
                      if (!open && likeNotification?.length > 0) {
                        dispatch(clearAllNotifications());
                      }
                    }}
                  >
                    <PopoverTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant={
                          likeNotification?.length > 0 ? "destructive" : "ghost"
                        }
                        className={`rounded-full h-5 w-5 absolute bottom-6 left-6 ${
                          likeNotification?.length > 0 ? "bg-red-500" : ""
                        }`}
                      >
                        {likeNotification?.length || null}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="flex flex-col">
                        <div className="border-b px-4 py-2 font-semibold">
                          Notifications
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto">
                          {likeNotification?.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              No new notifications
                            </div>
                          ) : (
                            likeNotification.map((notification, index) => (
                              <div
                                key={`${notification.userId}-${index}`}
                                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-accent border-b last:border-0 transition-colors"
                                //   onClick={(e) => {
                                //     e.stopPropagation();
                                //     navigate(`/post/${notification.postId}`);
                                //   }
                                // }
                              >
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage
                                    src={
                                      notification.userDetails?.profilePicture
                                    }
                                  />
                                  <AvatarFallback>
                                    {notification.userDetails?.username
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">
                                    <span
                                      className="font-semibold hover:bold  cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/profile/${notification.userId}`
                                        );
                                      }}
                                    >
                                      {notification.userDetails?.username}
                                    </span>
                                    <span className="text-muted-foreground ml-1">
                                      {/* {notification.message || */}
                                      liked your post
                                      {/* } */}
                                    </span>
                                  </p>
                                  {/* <span className="text-xs text-muted-foreground">
                                    {notification.createdAt
                                      ? new Date(
                                          notification.createdAt
                                        ).toLocaleTimeString()
                                      : "Just now"}
                                  </span> */}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
