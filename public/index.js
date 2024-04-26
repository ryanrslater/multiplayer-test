const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;




ctx.fillRect(0, 0, canvas.width, canvas.height);

let AllPlayers = {};

const socket = io('http://localhost:3000');

socket.on('players', (players) => {
    for (const player of players) {
        if (!AllPlayers[player.id]) {
            AllPlayers[player.id] = new Player(player);
        } else {
            AllPlayers[player.id].position = player.position;
        }
    }
}
);

socket.on('player disconnected', (playerId) => {
    console.log('player disconnected', playerId);
    delete AllPlayers[playerId];
}
);

function animate() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const player in AllPlayers) {
        AllPlayers[player].draw(ctx);
    }
    requestAnimationFrame(animate);
}

animate();


const clickHandler = (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    console.log(x, y);
    socket.emit('click', { x, y });
}

canvas.addEventListener('click', clickHandler);
