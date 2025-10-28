import { Button } from './components/ui/button'
import Singup from './components/Singup.jsx'
import Login from './components/Login'
import {createBrowserRouter,RouterProvider } from 'react-router-dom'
import MainLayout from './components/MainLayout'

import Profile from './components/Profile'
import Home from './components/Home'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import {io} from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'

const browserRouter=createBrowserRouter([
  {
    path: "/",
    element:<MainLayout />,
    children:[
      {
        path:'/',
        element:<Home/>
      },
      {
        path:'/profile/:id',
        element:<Profile />
      },
      {
        path:'/account/edit',
        element:<EditProfile />
      }, {
        path:'/chat',
        element:<ChatPage />
      },
    ]
  },
      {
        path:'/login',
        element: <Login />
      },
      {
        path:'/singup',
        element: <Singup />
  }
])

function App() {

  const {user}=useSelector(store=> store.auth);
  const {socket}=useSelector(store=>store.socketio);
  const dispatch = useDispatch ();
  useEffect(() => {
       if (user) {
        const socketio= io('http://localhost:8000',{
          query:{
            userId:user?._id
          },
          transports:['websocket']
        });
        dispatch(setSocket(socketio));
        //listen all the events
        socketio.on('getOnlineUsers',(onlineUsers)=>{
          dispatch(setOnlineUsers(onlineUsers));
        });
          return ()=>{
            socketio.close();
            dispatch(setSocket(null));
          }
       } else if(socket){
          socket?.close();
        dispatch(setSocket(null));
       }
  },[user,dispatch]);
    return (
    <>
      <RouterProvider router={browserRouter}/>
    </>
  )
}

export default App
