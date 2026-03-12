import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const DEFAULT_VISIBLE_COUNT = 4;

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);
  const [showAll, setShowAll] = useState(false);

  const visibleUsers = useMemo(() => {
    if (!Array.isArray(suggestedUsers)) return [];
    return showAll ? suggestedUsers : suggestedUsers.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [suggestedUsers, showAll]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-bold text-slate-600">People to watch</h1>
        {suggestedUsers?.length > DEFAULT_VISIBLE_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="font-medium cursor-pointer text-teal-700 hover:text-teal-800"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>

      <div className="mt-3 min-h-0 overflow-y-auto pr-1 space-y-3">
        {visibleUsers.map((user) => {
          return (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Link to={`/profile/${user?._id}`}>
                  <Avatar className="w-10 h-10 ring-1 ring-slate-200">
                    <AvatarImage src={user?.profilePicture} alt="post_image" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0">
                  <h1 className="font-semibold text-sm truncate">
                    <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                  </h1>
                  <span className="text-slate-500 text-xs truncate block">
                    {user?.bio || "No bio yet"}
                  </span>
                </div>
              </div>
              <span className="text-teal-700 text-xs font-bold cursor-pointer hover:text-teal-800">
                Follow
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedUsers;
