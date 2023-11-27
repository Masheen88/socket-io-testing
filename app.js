const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes for window1.html and window2.html
app.get("/window1", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "window1.html"));
});

app.get("/window2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "window2.html"));
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = 3000;
server.listen(port, () => {
  console.log("Listening on:", `http://localhost:${port}`);
});
