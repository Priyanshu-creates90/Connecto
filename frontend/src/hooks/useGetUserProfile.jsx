import React, { useEffect } from "react";
import axios from "axios";
import { setUserProfile } from "@/redux/authSlice";
import { useDispatch } from "react-redux";
const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/user/${userId}/Profile`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, dispatch]);
};

export default useGetUserProfile;
