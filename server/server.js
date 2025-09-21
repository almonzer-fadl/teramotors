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

  socket.on("appointment-created", () => {
    io.emit("update-appoinemnts");
    console.log("an appointment has been created");
  });
  socket.on("customer-created", () => {
    io.emit("update-customers");
    console.log("a customer has been created");
  });
  socket.on("estimate-created", () => {
    io.emit("update-estimates");
    console.log("an estimate has been created");
  });
  socket.on("inspection-created", () => {
    io.emit("update-inspections");
    console.log("an inspection has been created");
  });
  socket.on("part-created", () => {
    io.emit("update-parts");
    console.log("a part has been created");
  });
  socket.on("job-created", () => {
    io.emit("update-jobs");
    console.log("a job has been created");
  });
  socket.on("vehicle-created", () => {
    io.emit("update-vehicles");
    console.log("a vehicle has been created");
  });
  socket.on("service-created", () => {
    io.emit("update-services");
    console.log("a service has been created");
  });
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
