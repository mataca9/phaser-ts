import { take, delay, tap } from 'rxjs/operators';
import { getGameWidth, getGameHeight } from '../helpers';
import { Hero } from '../models/hero';
import { Monster } from '../models/monster';
import { HeroPlatform } from '../models/hero-platform';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game2',
};

export class Game2Scene extends Phaser.Scene {
  public level = 1;
  public levelText: Phaser.GameObjects.Text;
  private player: HeroPlatform;
  private monsters: Monster[] = [];
  private walls: Phaser.Physics.Arcade.Sprite[] = [];
  private platforms: Phaser.Physics.Arcade.Sprite[] = [];

  private center = {
    x: 0,
    y: 0,
  };

  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.center = {
      x: getGameWidth(this) / 2,
      y: getGameHeight(this) / 2,
    };

    // background
    this.add
      .image(0,0, 'background')
      .setOrigin(0, 0)
      .setScale(getGameWidth(this) * 2, getGameHeight(this));

    // player
    this.player = new HeroPlatform(this);
    this.player.sprite.x = 50;
    this.player.sprite.y = 100;

    // camera
    this.cameras.main.setBounds(0, 0, getGameWidth(this) * 2, getGameHeight(this) + 100);
    this.cameras.main.startFollow(this.player.sprite);

    this.player.$onDeath
      .pipe(
        tap(() => this.levelText.setText('You died. :(')),
        tap(() => (this.level = 1)),
        take(1),
        delay(5000)
      )
      .subscribe(() => this.scene.start('MainMenu'));

    //floor
    getGameWidth(this)
    this.addPlatform(0, 5, getGameWidth(this) * 2);

    // platforms
    this.addPlatform(150, 50, 50);
    this.addPlatform(250, 100, 100);
    this.addPlatform(400, 150, 150);
    this.addPlatform(600, 200, 150);
    this.addPlatform(400, 250, 150);
    this.addPlatform(250, 300, 100);

    // platforms
    this.addPlatform(150 + getGameWidth(this), 50, 50);
    this.addPlatform(250 + getGameWidth(this), 100, 100);
    this.addPlatform(400 + getGameWidth(this), 150, 150);
    this.addPlatform(600 + getGameWidth(this), 200, 150);
    this.addPlatform(400 + getGameWidth(this), 250, 150);
    this.addPlatform(250 + getGameWidth(this), 300, 100);

    // level text
    this.levelText = this.add
      .text(100, 50, `Level: ${this.level}`, { fill: '#FFFFFF' })
      .setFontSize(24)
      .setScrollFactor(0, 0);

    // fixed collision
    this.physics.add.collider(this.player.sprite, this.walls);

    // keys
    this.player.cursorKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // start
    this.start();
  }

  public start() {
    this.levelText.setText(`Level: ${this.level}`);
    // this.addMonster();
    // this.addMonster();
    // this.addMonster();
    // this.addMonster();
  }

  public update() {
    this.monsters.forEach((monster, i) => {
      // dynamic collision
      this.physics.collide(this.walls, monster.sprite);
      this.physics.collide(
        this.player.sprite,
        monster.sprite,
        this.monsterHit.bind(this, this.player, monster)
      );
      this.player.playerBullets.forEach((bullet) => {
        this.physics.collide(
          monster.sprite,
          bullet,
          this.monsterShot.bind(this, this.player, monster, bullet)
        );
        if (bullet.alpha === 0) {
          bullet.destroy();
        }
      });

      if (monster.alive) {
        monster.update();
      } else {
        this.monsters.splice(i, 1);
        monster.sprite.destroy();
      }
    });

    this.player.update();
  }

  addPlatform(x: number, y: number, w: number) {
    this.walls.push(
      this.physics.add
        .sprite(x, getGameHeight(this) - y, 'wall')
        .setOrigin(0, 0)
        .setScale(w, 10)
        .setImmovable()
    );
  }

  addWall(x: number, y: number, w: number, h: number) {
    this.walls.push(
      this.physics.add
        .sprite(this.center.x + x, this.center.y + y, 'wall')
        .setOrigin(0, 0)
        .setScale(w, h)
        .setImmovable()
    );
  }

  addMonster() {
    const x = Phaser.Math.RND.between(
      this.center.x - 400 + 15,
      this.center.x + 400 - 15
    );
    const y = Phaser.Math.RND.between(
      this.center.y - 300 + 15,
      this.center.y + 300 - 15
    );
    const monster = new Monster(this, x, y);
    monster.setTarget(this.player);
    monster.hp = this.level;
    monster.speed = monster.speed * this.level;
    this.monsters.push(monster);
  }

  monsterHit(player: Hero, monster: Monster) {
    player.takeDamage(monster.attack);
  }

  monsterShot(
    player: Hero,
    monster: Monster,
    bullet: Phaser.Physics.Arcade.Sprite
  ) {
    monster.hp -= player.attack;
    bullet.setAlpha(0);
  }
}
