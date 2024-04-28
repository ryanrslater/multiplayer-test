const frame_rates = {
  "../assets/warrior/down/idle.png": 5,
  "../assets/warrior/down/walk.png": 8,
  "../assets/warrior/down/death.png": 6,
  "../assets/warrior/up/idle.png": 5,
  "../assets/warrior/up/walk.png": 8,
  "../assets/warrior/up/death.png": 6,
  "../assets/warrior/right/idle.png": 5,
  "../assets/warrior/right/walk.png": 8,
  "../assets/warrior/right/death.png": 6,
  "../assets/warrior/left/idle.png": 5,
  "../assets/warrior/left/walk.png": 8,
  "../assets/warrior/left/death.png": 6,
};

class Sprite {
  constructor({ id, position, health, character }) {
    this.id = id;
    this.position = position;
    this.endPosition = position;
    this.spritePosition = position;
    this.health = health;
    this.character = character;
    this.frames = frames;
    this.img = new Image();
    this.img.src = `../assets/${character}/down/idle.png`;
    this.state = "idle";
    this.direction = "down";
    this.frames = frame_rates[this.img.src];
  }
  cropWidth = 48;
  cropHeight = 48;
  staggerFrames = 10;
  velocity = 2;
  attackRange = 30;
  followRange = 100;

  update({ position, health, frames, endPosition }) {
    if (endPosition && endPosition !== this.endPosition) {
      this.endPosition = endPosition;
    }

    if (position && position !== this.position) {
      this.position = position;
      this.spritePosition = position;
    }
    if (health && health !== this.health) {
      this.health = health;
    }
    if (frames && frames !== this.frames) {
      this.frames = frames;
    }
  }

  getClickPosition() {
    return this.spritePosition;
  }

  updateServer(socket) {
    if (this.position === this.endPosition) {
      return;
    }
    socket.emit("update", {
      new_position: this.endPosition,
      current_position: this.spritePosition,
    });
  }

  render(ctx, frameX) {
    ctx.drawImage(
      this.img,
      frameX,
      0,
      this.cropWidth,
      this.cropHeight,
      this.spritePosition.x - this.cropWidth / 2,
      this.spritePosition.y - this.cropHeight / 2,
      this.cropWidth,
      this.cropHeight,
    );
  }

  animate(ctx) {
    let dx = this.endPosition.x - this.position.x;
    let dy = this.endPosition.y - this.position.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (dx > 0) {
      this.direction = "right";
    }

    if (dx < 0) {
      this.direction = "left";
    }

    if (dy < 0 && Math.abs(dx) < Math.abs(dy)) {
      this.direction = "up";
    }

    if (dy > 0 && Math.abs(dx) < Math.abs(dy)) {
      this.direction = "down";
    }

    if (distance > 1) {
      this.spritePosition.x += (dx / distance) * this.velocity;
      this.spritePosition.y += (dy / distance) * this.velocity;

      this.state = "walk";
    } else {
      this.spritePosition = this.position;
      this.endPosition = this.position;
      this.state = "idle";
    }

    this.img.src = `../assets/${this.character}/${this.direction}/${this.state}.png`;
    this.frames =
      frame_rates[
        `../assets/${this.character}/${this.direction}/${this.state}.png`
      ];
    let position = Math.floor(gameFrame / this.staggerFrames) % this.frames;
    let frameX = position * this.cropWidth;

    this.render(ctx, frameX);
  }
}
