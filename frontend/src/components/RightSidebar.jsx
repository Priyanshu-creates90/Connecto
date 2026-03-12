import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <aside className="hidden xl:block w-full">
      <div className="glass-panel p-5 sticky top-4 h-[calc(100vh-2rem)] flex flex-col animate-rise">
        <p className="section-eyebrow mb-3">Your Studio</p>
        <div className="flex items-center gap-3">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="w-14 h-14 ring-2 ring-white shadow-sm">
            <AvatarImage src={user?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-base truncate">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
            <p className="text-[13px] text-slate-500 truncate mt-0.5">
              {user?.bio || "Create your first campaign today."}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/80 border border-slate-200 p-3">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Today
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            Keep your community active by replying to comments quickly.
          </p>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-hidden">
          <SuggestedUsers />
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
