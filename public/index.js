const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 640;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const img = new Image();
img.src = "/assets/dungeon.png";

img.onload = () => {
  ctx.drawImage(img, 0, 0);
};

let AllCharacters = {};

const socket = io("http://localhost:3000");

socket.on("character", (character) => {
  console.log(character);
  if (AllCharacters[character.id]) {
    AllCharacters[character.id].update(character);
  } else {
    AllCharacters[character.id] = new Sprite(character);
  }
  console.log(AllCharacters);
});

socket.on("player disconnected", (playerId) => {
  delete AllCharacters[playerId];
});

let gameFrame = 0;

function animate() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  for (const player of Object.values(AllCharacters)) {
    player.animate(ctx);
  }

  requestAnimationFrame(animate);
  gameFrame++;
}

animate();

const regularUpdate = () => {
  for (const player of Object.values(AllCharacters)) {
    player.updateServer(socket);
  }
};

socket.on("update", (data) => {
  AllCharacters[data.id].endPosition = data.new_position;
  AllCharacters[data.id].position = data.current_position;
});

setInterval(regularUpdate, 2000);

const clickHandler = (event) => {
  const x = event.offsetX;
  const y = event.offsetY;
  const id = socket.id;
  position = AllCharacters[id].getClickPosition();
  socket.emit("click", {
    id,
    new_position: {
      x,
      y,
    },
    current_position: position,
  });
};

canvas.addEventListener("click", clickHandler);
