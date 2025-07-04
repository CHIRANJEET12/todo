import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    }
})
app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);


app.get("/", (_req, res) => {
  res.send("API is working!");
});

const port = process.env.PORT;
mongoose.connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => console.log(`Server running on ${port}`));
  })
  .catch((err) => console.error("DB Error:", err));

export { io };