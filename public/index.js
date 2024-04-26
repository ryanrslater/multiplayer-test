const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


canvas.width = 960;
canvas.height = 640;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const img = new Image();
img.src = '/assets/dungeon.png';

img.onload = () => {
    ctx.drawImage(img, 0, 0);
}



let AllPlayers = {};
let AllEnemies = {};

const socket = io('http://localhost:3000');

socket.on('players', (players) => {
    for (const player of players) {
        if (!AllPlayers[player.id]) {
            AllPlayers[player.id] = new Player(player);
        } else {
            AllPlayers[player.id].position = player.position;
            AllPlayers[player.id].update(player);
        }
    }
}
);

socket.on('enemies', (enemies) => {

    for (const enemy of enemies) {
        if (!AllEnemies[enemy.id]) {
            
    
            AllEnemies[enemy.id] = new Player(enemy);
        } else {
            AllEnemies[enemy.id].position = enemy.position;
            AllEnemies[enemy.id].update(enemy);
        }
    }
}
);



socket.on('player disconnected', (playerId) => {
    console.log('player disconnected', playerId);
    delete AllPlayers[playerId];
}
);

let gameFrame = 0;

function animate() {
 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    for (const player in AllPlayers) {
        AllPlayers[player].animate(ctx);
    }

   

    for (const enemy in AllEnemies) {
        AllEnemies[enemy].animate(ctx);
    }
    requestAnimationFrame(animate);
    gameFrame++;
}

animate();


const clickHandler = (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    socket.emit('click', { x, y });
}

canvas.addEventListener('click', clickHandler);
