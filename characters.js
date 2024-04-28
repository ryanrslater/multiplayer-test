export class Player {
  constructor({ id }) {
    const randomX = Math.floor(Math.random() * 30) + 1;
    const randomY = Math.floor(Math.random() * 20) + 1;
    this.id = id;
    this.position = {
      x: 50 + randomX,
      y: 590 + randomY,
    };
    this.endPosition = {
      x: 50 + randomX,
      y: 590 + randomY,
    };
    this.character = "warrior";
    this.health = 100;
  }

  attackRange = 30;
  followRange = 100;
  target = null;

  isEnemy() {
    return false;
  }

  update({ current_position, new_position }) {
    this.position = current_position;
    this.endPosition = new_position;
  }

  updatePosition(x, y) {
    this.endPosition = {
      x,
      y,
    };
  }

  needsAnimating(characters, players) {
    return (
      this.position.x !== this.endPosition.x ||
      this.position.y !== this.endPosition.y
    );
  }

  get() {
    return {
      id: this.id,
      position: this.position,
      health: this.health,
      endPosition: this.endPosition,
      character: "warrior",
    };
  }
}
export class Enemy {
    constructor({ id }) {
      const randomX = Math.floor(Math.random() * 30) + 1;
      const randomY = Math.floor(Math.random() * 20) + 1;
      this.id = id;
      this.position = {
        x: 50 + randomX,
        y: 590 + randomY,
      };
      this.endPosition = {
        x: 50 + randomX,
        y: 590 + randomY,
      };
      this.state = "idle";
      this.direction = "down";
      this.character = "skeleton";
      this.health = 100;
      this.image = `../assets/${this.character}/${this.direction}/${this.state}.png`;
    }
    velocity = 2;
    attackRange = 30;
    followRange = 100;
    frames = 5;
    target = null;
  
    isEnemy() {
      return true;
    }
  
    updatePosition(x, y) {
      this.endPosition = {
        x,
        y,
      };
    }
  
    needsAnimating(characters, players) {
      return (
        this.position.x !== this.endPosition.x ||
        this.position.y !== this.endPosition.y
      );
    }
  
    updateFrames() {
      switch (this.state) {
        case "walk":
          this.frames = 8;
          break;
        case "idle":
          this.frames = 5;
          break;
        case "attack":
          this.frames = 5;
          break;
        case "hurt":
          this.frames = 5;
          break;
        case "death":
          this.frames = 5;
          break;
      }
    }
  
    animate(players) {
      const playerInRange = players.find((player) => {
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.attackRange; // Fixed: access attackRange using 'this'
      });
  
      if (playerInRange) {
        // Face the player
        const dx = playerInRange.position.x - this.position.x;
        const dy = playerInRange.position.y - this.position.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? "right" : "left";
        } else {
          this.direction = dy > 0 ? "down" : "up";
        }
  
        // Attack the player
        this.state = "attack";
        this.target = playerInRange.id;
  
        // Reduce health of player
        const player = players.find((player) => player.id === playerInRange.id);
        player.health -= 1;
        if (player.health <= 0) {
          player.health = 0;
          player.state = "death";
        }
      } else {
        const playerInFollowRange = players.find((player) => {
          const dx = player.position.x - this.position.x;
          const dy = player.position.y - this.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= this.followRange; // Fixed: access followRange using 'this'
        });
  
        if (playerInFollowRange) {
          // Face the player
          const dx = playerInFollowRange.position.x - this.position.x;
          const dy = playerInFollowRange.position.y - this.position.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? "right" : "left";
          } else {
            this.direction = dy > 0 ? "down" : "up";
          }
  
          // Follow the player
          this.position.x += (dx / 100) * playerVelocity; // Fixed: use playerVelocity from global scope
          this.position.y += (dy / 100) * playerVelocity; // Fixed: use playerVelocity from global scope
          this.state = "walk";
          this.target = playerInFollowRange.id;
        } else {
          // No player in range, idle state
          this.state = "idle";
          this.target = null;
        }
      }
      this.image = `../assets/${this.character}/${this.direction}/${this.state}.png`;
      this.updateFrames();
    }
  
    get() {
      return {
        id: this.id,
        position: this.position,
        image: this.image,
        health: this.health,
        frames: this.frames,
      };
    }
  }
  