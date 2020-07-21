import { Hero } from './hero';

export class HeroPlatform extends Hero {
  speed = 200;
  jumpForce = 400;

  constructor(scene: Phaser.Scene, id?: string) {
    super(scene, id);
    this.sprite.setGravityY(900).setBounce(0, 0).setCollideWorldBounds(false);
  }

  get alive() {
    return this.hp > 0;
  }

  update() {
    if (!this.alive && !this.deathHaveBeenCalled) {
      this.deathHaveBeenCalled = true;
      this.sprite.setTint(0);
      this.sprite.setVelocity(0, 0);
      this.sprite.setAlpha(0.8);
      this.sprite.setImmovable();
      this.onDeathSubject.next();
    }

    if (this.cursorKeys.left.isDown) {
      this.sprite.setVelocityX(-this.speed);
    } else if (this.cursorKeys.right.isDown) {
      this.sprite.setVelocityX(this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }
    if (this.cursorKeys.up.isDown && this.sprite.body.touching.down) {
      this.sprite.setVelocityY(-this.jumpForce);
    }
  }
}
