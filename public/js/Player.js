class Player {
  constructor({ id, position, state, direction, character, health }) {
    this.id = id;
    this.position = position;
    this.state = state;
    this.direction = direction;
    this.character = character;
    this.image = new Image();
    this.health = health;
    this.image.src = `../assets/${this.character}/${this.direction}/${this.state}.png`;
  }

  staggerFrames = 10;
  frame = 0;
  cropWidth = 48;
  cropHeight = 48;
  frames = 5;
  deathFrames = 0;

  update({ state, direction, health }) {
    if (
      state == this.state &&
      direction == this.direction &&
      health == this.health
    ) {
      return;
    }

    if (health) {
      this.health = health;
    }

    if (state) {
      this.state = state;
    }
    if (direction) {
      this.direction = direction;
    }

    this.image.src = `../assets/${this.character}/${this.direction}/${this.state}.png`;

    if (this.state === "walk") {
      this.staggerFrames = 8;
    } else if (this.state === "idle") {
      this.staggerFrames = 5;
    } else if (this.state === "attack") {
      this.staggerFrames = 5;
    } else if (this.state === "hurt") {
      this.staggerFrames = 5;
    } else if (this.state === "death") {
      this.staggerFrames = 5;
    }
  }

  draw(ctx, frameX) {
    ctx.drawImage(
      this.image,
      frameX,
      0,
      this.cropWidth,
      this.cropHeight,
      this.position.x - this.cropWidth / 2,
      this.position.y - this.cropHeight / 2,
      this.cropWidth,
      this.cropHeight,
    );
  }

  animate(ctx) {
    console.log(this.health);
    if (this.state === "death") {
      this.deathFrames++;
    }
    if (this.deathFrames < 5) {
      let position = Math.floor(gameFrame / this.staggerFrames) % this.frames;
      let frameX = position * this.cropWidth;
      this.draw(ctx, frameX);
    }
  }
}
