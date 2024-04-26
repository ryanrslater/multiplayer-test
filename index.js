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

function newPlayer(id) {
    //random number between 1 and 10
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    return {
        id,
        position: {
            x: 60 + randomNumber,
            y: 590 + randomNumber
        },
        state: 'idle',
        direction: 'down',
        character: 'warrior'
    };
}

const playerVelocity = 2;
let players = [];
let walkingPlayers = [];

io.on('connection', (socket) => {


    players.push(newPlayer(socket.id));
    socket.emit('players', players);
    
    console.log('a user connected');
    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        io.emit('player disconnected', socket.id);
    });

    socket.on('click', (position) => {
        const isPlayerWalking = walkingPlayers.some(player => player.id === socket.id);
        const playersNewLocation = {
            id: socket.id,
            x: position.x,
            y: position.y
        };
        if (!isPlayerWalking) {
        walkingPlayers.push(playersNewLocation);
        } else {
            walkingPlayers = walkingPlayers.map(player => {
                if (player.id === socket.id) {
                    return playersNewLocation;
                }
                return player;
            });
        }
    }
);
}
);

function updatePlayers() {
    if (walkingPlayers.length === 0) {
        return;
    }
    for (const walkingPlayer of walkingPlayers) {
        const player = players.find(player => player.id === walkingPlayer.id);
        if (!player) {
            continue;
        }
        const dx = walkingPlayer.x - player.position.x;
        const dy = walkingPlayer.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocityX = (dx / distance) * playerVelocity;
        const velocityY = (dy / distance) * playerVelocity;
        player.position.x += velocityX;
        player.position.y += velocityY;

        if (dx > 0) {
            player.direction = 'right';
        }

        if (dx < 0) {
            player.direction = 'left';
        }

        if (dy > 0 && Math.abs(dx) < Math.abs(dy)){
            player.direction = 'down';
        }

        if (dy < 0 && Math.abs(dx) < Math.abs(dy)){
            player.direction = 'up';
        }

        if (distance < playerVelocity) {
            player.position.x = walkingPlayer.x;
            player.position.y = walkingPlayer.y;
            player.state = 'idle';
            walkingPlayers = walkingPlayers.filter(player => player.id !== walkingPlayer.id);
        } else {
            player.state = 'walk';
        }

    }

    io.emit('players', players);
}


setInterval(updatePlayers, 1000 / 60);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);