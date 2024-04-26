import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const playerVelocity = 5;
let players = [];
let walkingPlayers = [];

io.on('connection', (socket) => {

    const newPlayer = {
        id: socket.id,
       position: {
        x: 0,
        y: 0
       }
    };

    players.push(newPlayer);
    socket.emit('players', players);
    
    console.log('a user connected');
    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        io.emit('player disconnected', socket.id);
    });

    socket.on('click', (position) => {
        const playersNewLocation = {
            id: socket.id,
            x: position.x,
            y: position.y
        };
        walkingPlayers.push(playersNewLocation);
    }
);
}
);

function updatePlayers() {
    for (const walkingPlayer of walkingPlayers) {
        const player = players.find(player => player.id === walkingPlayer.id);
        const dx = walkingPlayer.x - player.position.x;
        const dy = walkingPlayer.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocityX = (dx / distance) * playerVelocity;
        const velocityY = (dy / distance) * playerVelocity;
        player.position.x += velocityX;
        player.position.y += velocityY;

        if (distance < playerVelocity) {
            walkingPlayers = walkingPlayers.filter(player => player.id !== walkingPlayer.id);
        }
    }
    io.emit('players', players);
}


setInterval(updatePlayers, 1000 / 60);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);