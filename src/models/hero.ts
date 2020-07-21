import { getGameWidth, getGameHeight } from '../helpers';
import { Subject } from 'rxjs';

export class Hero {
  id: string;
  hp = 10;
  attack = 1;
  defense = 1;
  speed = 200;
  hearts: Phaser.GameObjects.Sprite[] = [];
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  sprite: Phaser.Physics.Arcade.Sprite;
  scene: Phaser.Scene;

  damageDelay = 500;
  damageOnDelay = false;
  deathHaveBeenCalled = false;

  bulletSpeed = 200;
  bulletLifespan = 5000;
  fireRate = 5;
  playerBullets: Phaser.Physics.Arcade.Sprite[] = [];
  shootOnDelay = false;

  onDeathSubject = new Subject();
  $onDeath = this.onDeathSubject.asObservable();

  constructor(scene: Phaser.Scene, id?: string) {
    if (id && localStorage.getItem(`hero-${id}`)) {
      const hero = JSON.parse(localStorage.getItem(`hero-${id}`));
      this.id = id;
      this.hp = hero.hp;
      this.attack = hero.attack;
      this.defense = hero.defense;
    } else {
      this.id = '_' + Math.random().toString(36).substr(2, 9);
    }
    this.scene = scene;
    this.sprite = this.scene.physics.add
      .sprite(
        getGameWidth(this.scene) / 2,
        getGameHeight(this.scene) / 2,
        'hero'
      )
      .setBounce(1, 1)
      .setCollideWorldBounds(true);

    this.addHearts();
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

    if (!this.alive) {
      return;
    }

    const mouse = this.scene.input.mousePointer;
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursorKeys.left.isDown) {
      velocity.x -= 1;
    }
    if (this.cursorKeys.right.isDown) {
      velocity.x += 1;
    }
    if (this.cursorKeys.up.isDown) {
      velocity.y -= 1;
    }
    if (this.cursorKeys.down.isDown) {
      velocity.y += 1;
    }
    if (mouse.isDown && !this.shootOnDelay) {
      this.shoot();
      this.shootOnDelay = true;
      setTimeout(() => {
        this.shootOnDelay = false;
      }, 1000 / this.fireRate);
    }

    const normalizedVelocity = velocity.normalize();
    this.sprite.setVelocity(
      normalizedVelocity.x * this.speed,
      normalizedVelocity.y * this.speed
    );
  }

  shoot() {
    const bullet = this.scene.physics.add.sprite(
      this.sprite.x,
      this.sprite.y,
      'bullet'
    );
    bullet.setScale(10, 10);
    this.playerBullets.push(bullet);
    this.scene.physics.moveTo(
      bullet,
      this.scene.input.x,
      this.scene.input.y,
      this.bulletSpeed
    );
    setTimeout(() => {
      bullet.destroy();
    }, this.bulletLifespan);
  }

  addHearts() {
    const distanceBetween = 20;
    for (let i = 0; i < this.hp; i++) {
      this.hearts.push(
        this.scene.add.sprite(275 + i * distanceBetween, 60, 'heart')
            .setScrollFactor(0, 0)
      );
    }
  }

  takeDamage(attack: number) {
    if (!this.alive) {
      return;
    }

    if (!this.damageOnDelay) {
      this.hp -= Math.max(0, this.defense - attack);
      this.loseHeart();
      this.damageOnDelay = true;

      const damageInterval = setInterval(() => {
        this.sprite.setAlpha(this.sprite.alpha ? 0 : 100);
      }, 50);
      setTimeout(() => {
        clearInterval(damageInterval);
        this.damageOnDelay = false;
      }, this.damageDelay);
    }
  }

  loseHeart() {
    const heart = this.hearts.pop();
    this.scene.tweens.add({
      targets: heart,
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 500,
      onComplete: () => {
        heart.destroy();
      },
    });
  }

  save() {
    let list = [];
    if (localStorage.getItem('hero-list')) {
      list = JSON.parse(localStorage.getItem('hero-list'));
      list.push(`hero-${this.id}`);
    } else {
      list.push(`hero-${this.id}`);
    }
    localStorage.setItem('hero-list', JSON.stringify(list));
    localStorage.setItem(`hero-${this.id}`, JSON.stringify(this));
  }

  delete() {
    localStorage.removeItem(`hero-${this.id}`);
  }
}
