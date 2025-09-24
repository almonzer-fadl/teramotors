import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

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

  //listens to creation
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

  // listens to deletion
  socket.on("appointment-removed", () => {
    io.emit("update-appoinemnts");
    console.log("an appointment has been removed");
  });
  socket.on("customer-removed", () => {
    io.emit("update-customers");
    console.log("a customer has been removed");
  });
  socket.on("estimate-removed", () => {
    io.emit("update-estimates");
    console.log("an estimate has been removed");
  });
  socket.on("inspection-removed", () => {
    io.emit("update-inspections");
    console.log("an inspection has been removed");
  });
  socket.on("part-removed", () => {
    io.emit("update-parts");
    console.log("a part has been removed");
  });
  socket.on("job-removed", () => {
    io.emit("update-jobs");
    console.log("a job has been removed");
  });
  socket.on("vehicle-removed", () => {
    io.emit("update-vehicles");
    console.log("a vehicle has been removed");
  });
  socket.on("service-removed", () => {
    io.emit("update-services");
    console.log("a service has been removed");
  });

  // listerns to updates
  socket.on("appointment-updated", () => {
    io.emit("update-appoinemnts");
    console.log("an appointment has been updated");
  });
  socket.on("customer-updated", () => {
    io.emit("update-customers");
    console.log("a customer has been updated");
  });
  socket.on("estimate-updated", () => {
    io.emit("update-estimates");
    console.log("an estimate has been updated");
  });
  socket.on("inspection-updated", () => {
    io.emit("update-inspections");
    console.log("an inspection has been updated");
  });
  socket.on("part-updated", () => {
    io.emit("update-parts");
    console.log("a part has been updated");
  });
  socket.on("job-updated", () => {
    io.emit("update-jobs");
    console.log("a job has been updated");
  });
  socket.on("vehicle-updated", () => {
    io.emit("update-vehicles");
    console.log("a vehicle has been updated");
  });
  socket.on("service-updated", () => {
    io.emit("update-services");
    console.log("a service has been updated");
  });
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
