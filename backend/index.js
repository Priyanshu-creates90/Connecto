import express ,{urlencoded} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import postRoute from "./routes/post.route.js";
import { app,server } from "./socket/socket.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirnameCurrent = path.dirname(__filename);

dotenv.config({ path: path.join(__dirnameCurrent, '..', '.env') });


const PORT=process.env.PORT || 3000;

const __dirname = path.resolve();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions={
    origin:process.env.URL,
    credentials:true,
}
app.use(cors(corsOptions));

app.use("/api/v1/user",userRoute);
app.use("/api/v1/post",postRoute);
app.use("/api/v1/message",messageRoute);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error", success: false });
});

app.use(express.static(path.join(__dirname, '/frontend/dist')));
// Catch-all route for SPA - must be last
app.get(/.*/, (req,res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
})

server.listen(PORT,()=>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})