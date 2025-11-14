import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Comment = ({ comment }) => {
  return (
    <div className="my-2">
      <div className="flex gap-2 sm:gap-3 items-start">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <AvatarImage src={comment?.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-xs sm:text-sm break-words">
            {comment?.author.username}{" "}
            <span className="font-normal pl-1">{comment?.text}</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Comment;
