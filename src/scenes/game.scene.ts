import { Input } from 'phaser';
import { take, delay, tap } from "rxjs/operators";
import { getGameWidth, getGameHeight } from '../helpers';
import { Hero } from '../models/hero';
import { Monster } from '../models/monster';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {

  public level = 1;
  public levelText: Phaser.GameObjects.Text;
  public speed: number = 200;
  private player: Hero;
  private monsters: Monster[] = [];
  private walls: Phaser.Physics.Arcade.Sprite[] = [];

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
      y: getGameHeight(this) / 2
    };

    // background
    this.add.image(this.center.x - 400, this.center.y - 300, 'background').setOrigin(0, 0);

    // player
    this.player = new Hero(this);
    this.player.$onDeath.pipe(
        tap(() => this.levelText.setText('You died. :(')),
        tap(() => this.level = 1),
        take(1), delay(5000)
      ).subscribe(() => this.scene.start('MainMenu'));
    
    // walls
    this.addWall(-400, -300, 1, 600);
    this.addWall(-400, -300, 800, 1);
    this.addWall(400, -300, 1, 600);
    this.addWall(-400, 300, 800, 1);
    
    // fixed collision
    this.physics.add.collider(this.player.sprite, this.walls);    
    
    // keys
    this.player.cursorKeys = this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D,
      'space': Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    // level text
    this.levelText = this.add.text(100, 50, `Level: ${this.level}`, { fill: '#FFFFFF' }).setFontSize(24);

    // start
    this.start();
  }

  public start() {
    this.levelText.setText(`Level: ${this.level}`);
    this.addMonster();
    this.addMonster();
    this.addMonster();
    this.addMonster();
  }

  public update() {
    this.monsters.forEach((m, i) => {
      // dynamic collision
      this.physics.collide(this.walls, m.sprite);
      this.physics.collide(this.player.sprite, m.sprite, this.monsterHit.bind(this, this.player, m));
      this.player.playerBullets.forEach(b => {
        this.physics.collide(m.sprite, b, this.monsterShot.bind(this, this.player, m, b));
        if (b.alpha === 0) {
          b.destroy();
        }
      });

      if(m.alive) {
        m.update();
      } else {
        this.monsters.splice(i, 1);
        m.sprite.destroy();
      }
    });

    this.player.update();
    if (this.monsters.length === 0) {
      this.level++;
      this.start();
    }
  }

  addWall(x: number, y: number, w: number, h: number) {
    this.walls.push(this.physics.add.sprite(this.center.x + x, this.center.y + y, 'wall').setOrigin(0, 0).setScale(w, h).setImmovable());
  }

  addMonster() {
    const x = Phaser.Math.RND.between(this.center.x - 400 + 15, this.center.x + 400 - 15);
    const y = Phaser.Math.RND.between(this.center.y - 300 + 15, this.center.y + 300 - 15);
    const monster = new Monster(this, x, y);
    monster.setTarget(this.player);
    monster.hp = this.level;
    monster.speed = monster.speed * this.level;
    this.monsters.push(monster);
  };

  monsterHit(player: Hero, monster: Monster) {
    player.takeDamage(monster.attack);
  }

  monsterShot(player: Hero, monster: Monster, bullet: Phaser.Physics.Arcade.Sprite) {
    monster.hp -= player.attack;
    bullet.setAlpha(0);
  }
}

