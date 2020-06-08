import { Hero } from "./hero";

export class Monster {
    id: string;
    hp = 1;
    attack: number = 0;
    defense: number = 0;
    speed: number = 50;
    sprite: Phaser.Physics.Arcade.Sprite;
    scene: Phaser.Scene;
    target: Hero;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = this.scene.physics.add.sprite(x, y, 'monster')
            .setBounce(1, 1)
            .setCollideWorldBounds(true);
    }

    get alive() {
        return this.hp > 0;
    }

    setTarget(target: Hero) {
        this.target = target;
    }

    update() {
        if (this.sprite && this.target && this.target.alive) {
            const velocity = new Phaser.Math.Vector2(0, 0);

            if (this.target.sprite.x < this.sprite.x) {
              velocity.x -= 1;
            }
            if (this.target.sprite.x > this.sprite.x) {
              velocity.x += 1;
            }
            if (this.target.sprite.y < this.sprite.y) {
              velocity.y -= 1;
            }
            if (this.target.sprite.y > this.sprite.y) {
              velocity.y += 1;
            }
        
            const normalizedVelocity = velocity.normalize();
            this.sprite.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
        }
    }
}