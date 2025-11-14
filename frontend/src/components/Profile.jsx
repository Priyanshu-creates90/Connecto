import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  setUserProfile,
  setAuthUser,
  setSelectedUser,
  setSuggestedUsers,
} from "@/redux/authSlice";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");

  const { userProfile, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  // Derive isFollowing from Redux store instead of local state
  const isFollowing = user?.following?.includes(userProfile?._id);

  const handleFollowUnfollow = async () => {
    try {
      // Optimistically update Redux state immediately for instant UI update
      const isCurrentlyFollowing = user?.following?.includes(userProfile?._id);

      if (isCurrentlyFollowing) {
        // Remove from following and followers arrays
        dispatch(
          setAuthUser({
            ...user,
            following: user.following.filter((id) => id !== userProfile._id),
          })
        );
        dispatch(
          setUserProfile({
            ...userProfile,
            followers: userProfile.followers.filter((id) => id !== user._id),
          })
        );
      } else {
        // Add to following and followers arrays
        dispatch(
          setAuthUser({
            ...user,
            following: [...(user.following || []), userProfile._id],
          })
        );
        dispatch(
          setUserProfile({
            ...userProfile,
            followers: [...(userProfile.followers || []), user._id],
          })
        );
      }

      const res = await axios.post(
        `https://connecto-1-psxd.onrender.com/api/v1/user/followOrUnfollow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // Refetch the profile to sync with backend
        const profileRes = await axios.get(
          `https://connecto-1-psxd.onrender.com/api/v1/user/${userId}/Profile`,
          { withCredentials: true }
        );
        if (profileRes.data.success) {
          dispatch(setUserProfile(profileRes.data.user));
        }

        // Refetch logged-in user data to sync following array
        const userRes = await axios.get(
          `https://connecto-1-psxd.onrender.com/api/v1/user/profile`,
          { withCredentials: true }
        );
        if (userRes.data.success) {
          dispatch(setAuthUser(userRes.data.user));
        }

        // Refetch suggested users to update follower counts
        const suggestedRes = await axios.get(
          `https://connecto-1-psxd.onrender.com/api/v1/user/suggested`,
          { withCredentials: true }
        );
        if (suggestedRes.data.success) {
          dispatch(setSuggestedUsers(suggestedRes.data.users));
        }

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");

      // Revert optimistic update on error by refetching
      const profileRes = await axios.get(
        `https://connecto-1-psxd.onrender.com/api/v1/user/${userId}/Profile`,
        { withCredentials: true }
      );
      if (profileRes.data.success) {
        dispatch(setUserProfile(profileRes.data.user));
      }

      const userRes = await axios.get(
        `https://connecto-1-psxd.onrender.com/api/v1/user/profile`,
        { withCredentials: true }
      );
      if (userRes.data.success) {
        dispatch(setAuthUser(userRes.data.user));
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMessage = () => {
    dispatch(setSelectedUser(userProfile));
    navigate("/chat");
  };

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col gap-10 sm:gap-16">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_2fr] gap-6 md:gap-8">
          <section className="flex items-center justify-center">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-52 lg:w-52">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilephoto"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-3 sm:gap-5">
              <div className="flex items-center font-bold text-xl sm:text-2xl md:text-3xl gap-2">
                <span className="truncate">{userProfile?.username}</span>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length || 0}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers?.length || 0}{" "}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following?.length || 0}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm sm:text-base">
                  {userProfile?.bio}
                </span>
                <Badge className="w-fit text-xs sm:text-sm" variant="secondary">
                  <AtSign className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                  <span className="pl-1">{userProfile?.username}</span>{" "}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 bg-gray-100 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        Edit profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-9 sm:h-10 bg-gray-100 text-xs sm:text-sm"
                    >
                      View archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-9 sm:h-10 bg-gray-100 text-xs sm:text-sm"
                    >
                      Ad tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button
                      onClick={handleFollowUnfollow}
                      variant="secondary"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    >
                      Unfollow
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="secondary"
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    >
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleFollowUnfollow}
                    className="bg-[#1877F2] hover:bg-[#3192d2] text-white font-bold h-10 sm:h-12 w-full sm:w-auto text-sm sm:text-base"
                  >
                    Follow
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm overflow-x-auto">
            <span
              className={`py-3 cursor-pointer whitespace-nowrap ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer whitespace-nowrap ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer whitespace-nowrap ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span>
            <span
              className={`py-3 cursor-pointer whitespace-nowrap ${
                activeTab === "tags" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("tags")}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post.image}
                    alt="postimage"
                    className="rounded-sm my-2 w-full aspect-square object-cover "
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-40 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      {/* //inset-0 means */}
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">
                          {post?.likes.length}
                        </span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base">
                          {post?.comments.length}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
