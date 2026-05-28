import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/database";
import "./config/redis";
import { redisConnection } from "./config/redis"; 
import { QueueEvents } from "bullmq";
import "./queue/worker";
import apiRoutes from "./routes/api";


connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-assignment-creator-puce.vercel.app'], 
  methods: ['GET', 'POST']
}));
app.use(express.json());

app.use("/api/papers", apiRoutes);
// Create HTTP Server for both Express and WebSockets
const httpServer = createServer(app);

// Initialize Socket.io WebSocket Server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://ai-assignment-creator-puce.vercel.app'],
    methods: ['GET', 'POST']
  }
});

// Basic Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend Server is running smoothly!" });
});

// WebSocket Connection Listener
io.on("connection", (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ==========================================
// THE NEW MAGIC: Listen to the AI Worker and Ping the Frontend
// ==========================================
const queueEvents = new QueueEvents("paper-generation", { 
  connection: redisConnection as any 
});

queueEvents.on("completed", ({ jobId }) => {
  console.log(`📣 AI Finished! Broadcasting 'paper-ready' for ID: ${jobId}`);
  // This sends a ping to the Next.js frontend!
  io.emit("paper-ready", { paperId: jobId }); 
});
// ==========================================

// Start Server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server safely running on http://localhost:${PORT}`);
});