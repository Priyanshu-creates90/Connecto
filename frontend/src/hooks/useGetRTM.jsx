import { appendMessage } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

//real time message
const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      dispatch(appendMessage(newMessage));
    };
    socket?.on("newMessage", handleNewMessage);
    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch]);
};
export default useGetRTM;
