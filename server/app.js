import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http"; // Needed for socket.io
import { Server } from "socket.io";
import config from "./src/config/index.js";
import middleware from "./src/middleware/index.js";
import routes from "./src/route/index.js";
import "./src/jobs/paymentReminder.job.js";

const app = express();

// Middleware
app.use(middleware);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", routes);

app.get("/", (req, res) => res.send("Running..."));

// Create HTTP server for socket.io
const server = http.createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to your frontend URL
  },
});

// Map to track online users
export const onlineUsers = new Map();

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("register", (userId) => {
    const sockets = onlineUsers.get(userId) || [];
    sockets.push(socket.id);
    onlineUsers.set(Number(userId), sockets);
  });
  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, sockets] of onlineUsers.entries()) {
      onlineUsers.set(
        userId,
        sockets.filter((id) => id !== socket.id)
      );
      if (onlineUsers.get(userId).length === 0) {
        onlineUsers.delete(userId);
      }
    }
  });
});

// Start server
const PORT = config.PORT || 3300;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT} Server is running`);
});

// Handle server startup errors
server.on("error", (err) => {
  console.error("Failed to start server:", err);
});
