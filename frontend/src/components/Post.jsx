import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts, selectedPost } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [comment, setComment] = useState(post.comments || []);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isCommentPending, setIsCommentPending] = useState(false);
  const [actionAnimation, setActionAnimation] = useState({
    like: false,
    comment: false,
    share: false,
    bookmark: false,
  });
  const actionTimeoutRef = useRef({});
  const likes = post.likes || [];
  const liked = likes.some((id) => String(id) === String(user?._id));
  const postLike = likes.length;

  useEffect(() => {
    setComment(post.comments || []);
  }, [post]);

  useEffect(() => {
    return () => {
      Object.values(actionTimeoutRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const triggerActionAnimation = (actionKey) => {
    if (actionTimeoutRef.current[actionKey]) {
      clearTimeout(actionTimeoutRef.current[actionKey]);
    }

    setActionAnimation((prev) => ({ ...prev, [actionKey]: false }));
    window.requestAnimationFrame(() => {
      setActionAnimation((prev) => ({ ...prev, [actionKey]: true }));
      actionTimeoutRef.current[actionKey] = window.setTimeout(() => {
        setActionAnimation((prev) => ({ ...prev, [actionKey]: false }));
      }, 420);
    });
  };

  const syncPostInStore = ({ likes, comments }) => {
    const updatedPostData = posts.map((p) =>
      p._id === post._id
        ? {
            ...p,
            ...(likes !== undefined ? { likes } : {}),
            ...(comments !== undefined ? { comments } : {}),
          }
        : p,
    );

    dispatch(setPosts(updatedPostData));

    if (selectedPost?._id === post._id) {
      dispatch(
        setSelectedPost({
          ...selectedPost,
          ...(likes !== undefined ? { likes } : {}),
          ...(comments !== undefined ? { comments } : {}),
        }),
      );
    }
  };

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText);
  };

  const likeOrDislikeHandler = async () => {
    if (!user?._id || isLikePending) return;

    triggerActionAnimation("like");
    setIsLikePending(true);
    const currentLikes = (posts.find((p) => p._id === post._id)?.likes ||
      post.likes ||
      []);
    const hasLiked = currentLikes.some(
      (id) => String(id) === String(user._id),
    );
    const nextLikes = hasLiked
      ? currentLikes.filter((id) => String(id) !== String(user._id))
      : [...currentLikes, user._id];

    syncPostInStore({ likes: nextLikes });

    try {
      const action = hasLiked ? "dislike" : "like";
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/post/${post._id}/${action}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      syncPostInStore({ likes: currentLikes });
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update like");
    } finally {
      setIsLikePending(false);
    }
  };

  const commentHandler = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isCommentPending || !user?._id) return;

    triggerActionAnimation("comment");
    setIsCommentPending(true);
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
    syncPostInStore({ comments: optimisticComments });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/post/${post._id}/comment`,
        { text: trimmedText },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      console.log(res.data);
      if (res.data.success) {
        const finalComments = optimisticComments.map((item) =>
          item._id === optimisticId ? res.data.comment : item,
        );
        setComment(finalComments);
        syncPostInStore({ comments: finalComments });
        toast.success(res.data.message);
      }
    } catch (error) {
      setComment(previousComments);
      syncPostInStore({ comments: previousComments });
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      setText(trimmedText);
    } finally {
      setIsCommentPending(false);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/post/delete/${post?._id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id,
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const bookmarkHandler = async () => {
    triggerActionAnimation("bookmark");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sharePostHandler = async () => {
    triggerActionAnimation("share");
    const shareUrlObj = new URL(window.location.href);
    shareUrlObj.searchParams.set("post", post._id);
    const shareUrl = shareUrlObj.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.author?.username}'s post`,
          text: post.caption || "Check out this post",
          url: shareUrl,
        });
        toast.success("Post shared");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Post link copied");
    } catch {
      toast.error("Could not share post");
    }
  };

  return (
    <article className="my-4 sm:my-5 w-full max-w-[640px] mx-auto rounded-[1.2rem] border border-white/75 bg-[linear-gradient(170deg,rgba(255,255,255,0.96),rgba(248,252,251,0.92))] shadow-[0_16px_34px_rgba(15,23,42,0.1)] p-3 sm:p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post.author?._id}`}>
            <Avatar className="ring-2 ring-white shadow-sm h-11 w-11">
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div className=" flex items-center gap-3">
            <Link to={`/profile/${post.author?._id}`}>
              <h1 className="hover:underline cursor-pointer text-slate-900 font-semibold tracking-tight">
                {post.author?.username}
              </h1>
            </Link>
            {user?._id === post.author._id && (
              <Badge className="bg-teal-50 text-teal-700 border border-teal-200" variant="secondary">
                Author
              </Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center bg-white">
            <DialogTitle className="sr-only">Post options</DialogTitle>
            {/* Show Unfollow only for other users' posts */}
            {user?._id !== post?.author._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                Unfollow
              </Button>
            )}
            <Button variant="ghost" className="cursor-pointer w-fit">
              Add to favorites
            </Button>
            {/* Show Delete only for user's own posts */}
            {user?._id === post?.author._id && (
              <Button
                variant="ghost"
                onClick={deletePostHandler}
                className="cursor-pointer w-fit text-red-600 hover:underline"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-2.5 rounded-xl overflow-hidden border border-white/80 shadow-[0_12px_26px_rgba(15,23,42,0.14)] bg-white/70">
        <img
          className="w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[16/10] object-cover"
          src={post.image}
          alt="post_img"
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={likeOrDislikeHandler}
            disabled={isLikePending}
            className={`icon-chip action-btn ${
              liked ? "border-[#f2b79a] bg-orange-50" : ""
            } ${actionAnimation.like ? "action-heart-pop" : ""}`}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            <Heart
              size={18}
              strokeWidth={2.1}
              className={`transition-all ${
                liked
                  ? "text-[#e5484d] fill-[#e5484d] scale-110 drop-shadow-[0_0_10px_rgba(229,72,77,0.35)]"
                  : "text-slate-700"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              triggerActionAnimation("comment");
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className={`icon-chip action-btn ${actionAnimation.comment ? "action-pop" : ""}`}
            aria-label="Open comments"
          >
            <MessageCircle size={17} />
          </button>
          <button
            type="button"
            onClick={sharePostHandler}
            className={`icon-chip action-btn ${actionAnimation.share ? "action-share-pop" : ""}`}
            aria-label="Share post"
          >
            <Share2 size={17} />
          </button>
        </div>
        <button
          type="button"
          onClick={bookmarkHandler}
          className={`icon-chip action-btn ${actionAnimation.bookmark ? "action-bookmark-pop" : ""}`}
          aria-label="Bookmark post"
        >
          <Bookmark size={17} />
        </button>
      </div>

      <span className="font-medium block mt-2.5 text-slate-700">{postLike} likes</span>
      <p className="mt-1 text-slate-700">
        <span className="font-medium mr-2 text-slate-900">{post.author?.username}</span>
        {post.caption || ""}
      </p>
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer hover:text-gray-400"
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="mt-2.5 flex items-center gap-2">
        <div className="input-shell flex-1">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>
        <Button
          onClick={commentHandler}
          disabled={!text.trim() || isCommentPending}
          className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-4"
        >
          {isCommentPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </article>
  );
};

export default Post;
