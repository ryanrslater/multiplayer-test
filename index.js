const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Player, Enemy } = require("./characters.js");

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let characters = {};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function characterEmitter(io, character) {
  const data = character.get();
  io.emit("character", data);
}

io.on("connection", (socket) => {
  players.push(socket.id);
  const newPlayer = new Player({
    id: socket.id,
  });
  characters[socket.id] = newPlayer;

  characterEmitter(io, newPlayer);

  socket.on("disconnect", () => {
    players = players.filter((player) => player.id !== socket.id);
    delete characters[socket.id];
    io.emit("player disconnected", socket.id);
  });

  socket.on("click", (position) => {
    characters[socket.id].endPosition = position.new_position;
    characters[socket.id].position = position.current_position;
    characterEmitter(io, characters[socket.id]);
  });
  socket.on("update", (data) => {
    characters[socket.id].update(data);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
