import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setAuthUser } from "@/redux/authSlice";
import { clearAllNotifications } from "@/redux/rtnSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const LeftSidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification,
  );
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutHandler = async () => {
    setIsLoggingOut(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setIsLogoutConfirmOpen(false);
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      setIsLogoutConfirmOpen(true);
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      setHasNewMessage(false);
      navigate("/chat");
    }
  };

  const isActive = (text) => {
    if (text === "Home") return location.pathname === "/";
    if (text === "Messages") return location.pathname === "/chat";
    if (text === "Profile") return location.pathname.includes("/profile");
    return false;
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      if (!location.pathname.includes("/chat")) {
        setHasNewMessage(true);
      }
    };

    socket.on("newMessage", handleNewMessage);

    if (location.pathname === "/chat") {
      setHasNewMessage(false);
    }

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, location.pathname]);

  const sidebarItems = [
    { icon: <Home size={18} />, text: "Home" },
    { icon: <Search size={18} />, text: "Search" },
    { icon: <TrendingUp size={18} />, text: "Explore" },
    {
      icon: (
        <div className="relative">
          <MessageCircle size={18} />
          {hasNewMessage && (
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#de7a35] rounded-full pulse-dot" />
          )}
        </div>
      ),
      text: "Messages",
    },
    { icon: <Heart size={18} />, text: "Notifications" },
    { icon: <PlusSquare size={18} />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6 rounded-full ring-1 ring-slate-300">
          <AvatarImage
            src={user?.profilePicture}
            className="rounded-full"
            alt="@profile"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut size={18} />, text: "Logout" },
  ];

  const renderNotificationContent = () => (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-700">
        Activity
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {likeNotification?.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            No new notifications
          </div>
        ) : (
          likeNotification.map((notification, index) => (
            <div
              key={`${notification.userId}-${index}`}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
            >
              <Avatar className="h-10 w-10 shrink-0 ring-1 ring-slate-200">
                <AvatarImage src={notification.userDetails?.profilePicture} />
                <AvatarFallback>
                  {notification.userDetails?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span
                    className="font-semibold cursor-pointer text-slate-800"
                    onClick={() => navigate(`/profile/${notification.userId}`)}
                  >
                    {notification.userDetails?.username}
                  </span>
                  <span className="text-slate-500 ml-1">
                    {notification.type === "follow"
                      ? "started following you"
                      : "liked your post"}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed top-3 left-3 z-30">
        <div
          className={`glass-panel h-[calc(100vh-1.5rem)] transition-all duration-300 flex flex-col ${
            isCollapsed ? "w-24 px-2 py-4" : "w-72 px-4 py-5"
          }`}
        >
          <div className="pb-4 border-b border-slate-200">
            <div className="flex items-start justify-between gap-2">
              {isCollapsed ? (
                <h1 className="text-2xl font-bold tracking-tight">C</h1>
              ) : (
                <div>
                  <p className="section-eyebrow">Control Room</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight">
                    Connecto
                  </h1>
                </div>
              )}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="icon-chip !w-8 !h-8 shrink-0"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {sidebarItems.map((item) => {
              if (item.text === "Notifications") {
                return (
                  <Popover
                    key={item.text}
                    onOpenChange={(isOpen) => {
                      if (!isOpen && likeNotification?.length > 0) {
                        dispatch(clearAllNotifications());
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        title={item.text}
                        className={`nav-chip ${
                          isCollapsed ? "justify-center px-0" : ""
                        } ${isActive(item.text) ? "is-active" : ""}`}
                      >
                        <div className="relative">
                          {item.icon}
                          {likeNotification?.length > 0 && (
                            <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1.5 rounded-full bg-[#de7a35] text-white text-[10px] font-bold flex items-center justify-center">
                              {likeNotification.length}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.text}</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 p-0 bg-white"
                      side="right"
                      align="start"
                    >
                      {renderNotificationContent()}
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <button
                  type="button"
                  title={item.text}
                  onClick={() => sidebarHandler(item.text)}
                  key={item.text}
                  className={`nav-chip ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${isActive(item.text) ? "is-active" : ""}`}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.text}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className={`mt-auto rounded-xl border border-slate-200 bg-white/75 ${
              isCollapsed ? "p-2" : "p-3"
            }`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-2.5"
              }`}
            >
              <Avatar className="w-10 h-10 ring-1 ring-slate-200">
                <AvatarImage src={user?.profilePicture} alt="user-profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.username}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.bio || "Creator dashboard"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-50">
        <div className="glass-panel !rounded-none !border-x-0 !border-t-0 px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-lg font-bold">Connecto</h1>
          <div className="flex items-center gap-1.5">
            <Popover
              onOpenChange={(isOpen) => {
                if (!isOpen && likeNotification?.length > 0) {
                  dispatch(clearAllNotifications());
                }
              }}
            >
              <PopoverTrigger asChild>
                <button type="button" className="icon-chip relative">
                  <Heart size={17} />
                  {likeNotification?.length > 0 && (
                    <span className="absolute -top-2 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#de7a35] text-white text-[10px] font-bold flex items-center justify-center">
                      {likeNotification.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-2 bg-white" align="end">
                {renderNotificationContent()}
              </PopoverContent>
            </Popover>
            <button type="button" onClick={() => setOpen(true)} className="icon-chip">
              <PlusSquare size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="glass-panel !rounded-none !border-x-0 !border-b-0 px-2 py-2 flex items-center justify-around">
          {[sidebarItems[0], sidebarItems[6], sidebarItems[3], sidebarItems[7]].map(
            (item) => (
              <button
                type="button"
                key={item.text}
                onClick={() => sidebarHandler(item.text)}
                className={`icon-chip ${isActive(item.text) ? "text-teal-700 border-teal-300 bg-teal-50" : ""}`}
              >
                {item.icon}
              </button>
            ),
          )}
        </div>
      </div>

      <Dialog
        open={isLogoutConfirmOpen}
        onOpenChange={(nextOpen) => {
          if (!isLoggingOut) {
            setIsLogoutConfirmOpen(nextOpen);
          }
        }}
      >
        <DialogContent className="bg-white border border-slate-200 sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutConfirmOpen(false)}
              disabled={isLoggingOut}
            >
              No, stay
            </Button>
            <Button
              type="button"
              className="bg-[#0f766e] hover:bg-[#115e59] text-white"
              onClick={logoutHandler}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Yes, logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSidebar;
