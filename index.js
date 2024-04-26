import e from 'express';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);
const playerVelocity = 2;
const attackRange = 30;
const followRange = 100;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function animateEnemy(enemy) {
    const playerInRange = players.find(player => {
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= attackRange;
    });

    if (playerInRange) {
        // Face the player
        const dx = playerInRange.position.x - enemy.position.x;
        const dy = playerInRange.position.y - enemy.position.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            enemy.direction = dx > 0 ? 'right' : 'left';
        } else {
            enemy.direction = dy > 0 ? 'down' : 'up';
        }

        // Attack the player
        enemy.state = 'attack';
        enemy.target = playerInRange.id;
    } else {
        const playerInFollowRange = players.find(player => {
            const dx = player.position.x - enemy.position.x;
            const dy = player.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= followRange;
        });

        if (playerInFollowRange) {
            // Face the player
            const dx = playerInFollowRange.position.x - enemy.position.x;
            const dy = playerInFollowRange.position.y - enemy.position.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                enemy.direction = dx > 0 ? 'right' : 'left';
            } else {
                enemy.direction = dy > 0 ? 'down' : 'up';
            }

            // Follow the player
            enemy.position.x += dx / 100;
            enemy.position.y += dy / 100;
            enemy.state = 'walk';
            enemy.target = playerInFollowRange.id;
        } else {
            // No player in range, idle state
            enemy.state = 'idle';
            enemy.target = null;
        }
    }
}


function newPlayer(id) {
    //random number between 1 and 20
    const randomX = Math.floor(Math.random() * 30) + 1;  
    const randomY = Math.floor(Math.random() * 20) + 1;  
    return {
        id,
        position: {
            x: 50 + randomX,
            y: 590 + randomY
        },
        state: 'idle',
        direction: 'down',
        character: 'warrior'
    };
}

function generateEnemies() {
    for (let i = 0; i < 5; i++) {
        const randomX = Math.floor(Math.random() * 250) + 1;  
        const randomY = Math.floor(Math.random() * 70) + 1;  
        enemies.push({
            position: {
                x: 250 + randomX,
                y: 450 + randomY
            },
            state: 'idle',
            direction: 'down',
            character: 'goblin',
            id: i,
            target: null
        });
    }
}

let players = [];
let enemies = []
let walkingPlayers = [];


io.on('connection', (socket) => {

  


    players.push(newPlayer(socket.id));
    socket.emit('players', players);
    socket.emit('enemies', enemies);
    
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

function update() {
    if (enemies.length === 0) {
        generateEnemies();
        io.emit('enemies', enemies);
    } else {
        for (const enemy of enemies) {
            animateEnemy(enemy);
        }
        io.emit('enemies', enemies);
    }

  
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


setInterval(update, 1000 / 60);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);