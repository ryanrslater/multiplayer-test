class Player {
    constructor({
        id,
        position,
    }) {
        this.id = id;
        this.position = position;
        console.log('Player created', this);
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, 50, 50);
    }
}