import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

//real time message
const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { messages } = useSelector((store) => store.chat);
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      dispatch(setMessages([...messages, newMessage]));
    };
    socket?.on("newMessage", handleNewMessage);
    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [messages, socket, dispatch]);
};
export default useGetRTM;
