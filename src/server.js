import express from "express";
import dotenv from "dotenv";
import { Server as IOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const port = process.env.PORT || 8081;
const app = express();

/* SERVER */
const serverExpress = app.listen(port, (err) => {
  if (err) {
    console.log(`Error starting the server ${err}`);
  } else {
    console.log(`Server listening in port: ${port}`);
  }
});

const io = new IOServer(serverExpress);

app.use(express.static(path.join(__dirname, "../public")));

let socketsConnected = new Set();

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id} `);
  socketsConnected.add(socket.id);

  io.emit("clients-total", socketsConnected.size);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id} `);
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  socket.on("client:message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback-message", data);
  });
});
