import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const [comment, setComment] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments || []);
    } else {
      setComment([]);
    }
  }, [selectedPost]);

  const syncCommentsInStore = (nextComments) => {
    if (!selectedPost?._id) return;

    const updatedPostData = posts.map((p) =>
      p._id === selectedPost._id ? { ...p, comments: nextComments } : p,
    );

    dispatch(setPosts(updatedPostData));
    dispatch(setSelectedPost({ ...selectedPost, comments: nextComments }));
  };

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !selectedPost?._id || !user?._id || isSending) return;

    setIsSending(true);
    const optimisticId = `temp-${Date.now()}`;
    const previousComments = [...comment];
    const optimisticComment = {
      _id: optimisticId,
      text: trimmedText,
      author: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    };
    const optimisticComments = [...previousComments, optimisticComment];
    setComment(optimisticComments);
    setText("");
    syncCommentsInStore(optimisticComments);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/post/${selectedPost?._id}/comment`,
        { text: trimmedText },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const finalComments = optimisticComments.map((item) =>
          item._id === optimisticId ? res.data.comment : item,
        );
        setComment(finalComments);
        syncCommentsInStore(finalComments);
        toast.success(res.data.message);
      }
    } catch (error) {
      setComment(previousComments);
      syncCommentsInStore(previousComments);
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      setText(trimmedText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className=" bg-white max-w-5xl p-0 flex flex-col"
      >
        <DialogTitle className="sr-only">Post comments</DialogTitle>
        <DialogDescription className="sr-only">
          Read comments and add a new comment to this post.
        </DialogDescription>
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt="post_img"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center bg-white">
                  <DialogTitle className="sr-only">Post options</DialogTitle>
                  <DialogDescription className="sr-only">
                    More actions for this post.
                  </DialogDescription>
                  <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                    Unfollow
                  </div>
                  <div className="cursor-pointer w-full">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              {comment.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
              {/* comments ayenge */}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border border-gray-300 p-2  rounded text-sm "
                />
                <Button
                  disabled={!text.trim() || isSending}
                  onClick={sendMessageHandler}
                  variant="outline"
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
