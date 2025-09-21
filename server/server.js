import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 5000;

const app = express();

const server = createServer(app);

app.get("/", () => {
  console.log("WELCOME TO SOCKET");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("socket id: ", socket.id, " is connected");

  socket.emit("connected", `${socket.id} is connected to the server`);
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
