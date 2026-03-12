import {Server} from "socket.io";
import express from "express";
import http from "http";
import { isAllowedOrigin } from "../utils/cors.js";


const app = express();

const server = http.createServer(app);

const io = new Server( server ,{
    cors:{
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods:['GET','POST'],
        credentials:true
    }

})

const userSocketMap={} ;  //this map stores socket id coreesponding the user id; userId -> socketId

export const getReceiverSocketId=(receiverId) =>  userSocketMap[receiverId];

io.on('connection',(socket)=>{
    const userId =socket.handshake.query.userId ; //handshake is a method and by handshake.query we are taking login use id
    if(userId){
        userSocketMap[userId]=socket.id; // we store user id and his socket id in usersocketMap
        console.log(`User connected: UserId= ${userId}, SocketId= ${socket.id}`);
        }
            io.emit('getOnlineUsers', Object.keys(userSocketMap)); //getOnlineUsers is an event and this event listen in frontend side
                                // Object.keys(userSocketMap) Giving id 
    socket.on('disconnect',()=>{ //if user disconnect
            if(userId){
                    console.log(`User disconnected: UserId = ${userId} ,SocketId= ${socket.id}`);
                    delete userSocketMap[userId];
                }
                io.emit('getOnlineUsers',Object.keys(userSocketMap));
            });
            })

            export{app,server,io};
