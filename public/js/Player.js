


class Player {
    constructor({
        id,
        position,
        state,
        direction,
        character
    }) {
        this.id = id;
        this.position = position;
        this.state = state;
        this.direction = direction;
        this.character = character;
        this.image = new Image();
        this.image.src = `../assets/${this.character}/${this.direction}/${this.state}.png`;
    }

    staggerFrames = 10;
    frame = 0;
    cropWidth = 48;
    cropHeight = 48;
    frames = 5;

    update({
        state,
        direction
    }) {

        if (state == this.state && direction == this.direction) {
            return;
        }


        if (state) {
            this.state = state;
        }
        if (direction) {
            this.direction = direction;
        }
 
        this.image.src = `../assets/${this.character}/${this.direction}/${this.state}.png`;

        if (this.state === 'walk') {
            this.staggerFrames = 8;
        } else if (this.state === 'idle') {
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
            this.cropHeight
        );

    }
    animate(ctx) {
        let position = Math.floor(gameFrame / this.staggerFrames) % this.frames
        let frameX = position * this.cropWidth;
        this.draw(ctx, frameX);

    }
}