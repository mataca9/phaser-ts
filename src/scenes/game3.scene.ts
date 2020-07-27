import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game3',
};

export class Game3Scene extends Phaser.Scene {
  public score: Phaser.GameObjects.Text;
  public score2: Phaser.GameObjects.Text;
  public scores = {
    a: 0,
    b: 0,
  };

  private player: Phaser.Physics.Arcade.Sprite;
  private player2: Phaser.Physics.Arcade.Sprite;
  private ball: Phaser.Physics.Arcade.Sprite;
  private wallLeft: Phaser.Physics.Arcade.Sprite;
  private wallRight: Phaser.Physics.Arcade.Sprite;
  // private platforms: Phaser.Physics.Arcade.Sprite[] = [];

  keyboard;

  speed = 200;

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

    // player
    this.player = this.physics.add
      .sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'wall')
      .setPosition(this.center.x - 600, this.center.y)
      .setScale(5, 90)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.player2 = this.physics.add
      .sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'wall')
      .setPosition(this.center.x + 600, this.center.y)
      .setScale(5, 90)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.ball = this.physics.add
      .sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'wall')
      .setPosition(this.center.x, this.center.y)
      .setScale(10, 10)
      .setVelocity(200, 50)
      .setBounce(1, 1)
      .setCollideWorldBounds(true);

    // wall
    this.wallLeft = this.physics.add
      .sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'wall')
      .setPosition(0, this.center.y)
      .setImmovable(true)
      .setBounce(1, 1)
      .setScale(1, getGameHeight(this));

    this.wallRight = this.physics.add
      .sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'wall')
      .setPosition(getGameWidth(this), this.center.y)
      .setImmovable(true)
      .setBounce(1, 1)
      .setScale(1, getGameHeight(this));

    // level text
    this.score = this.add
      .text(100, 50, `0`, { fill: '#FFFFFF' })
      .setFontSize(24)
      .setPosition(this.center.x - 100, 100);

    this.score2 = this.add
      .text(100, 50, `0`, { fill: '#FFFFFF' })
      .setFontSize(24)
      .setPosition(this.center.x + 100, 100);

    // keys
    this.keyboard = this.input.keyboard.addKeys({
      up2: Phaser.Input.Keyboard.KeyCodes.W,
      down2: Phaser.Input.Keyboard.KeyCodes.S,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    });

    // collision
    this.physics.add.collider(this.ball, this.player);
    this.physics.add.collider(this.ball, this.player2);

    this.physics.add.collider(this.ball, this.wallLeft, () => {
      this.setScore(this.score2);
      this.ball.setPosition(this.center.x, this.center.y);
      this.ballStart();
    });
    this.physics.add.collider(this.ball, this.wallRight, () => {
      this.setScore(this.score);
      this.ball.setPosition(this.center.x, this.center.y);
      this.ballStart();
    });

    // start
    this.start();
  }

  ballStart() {
    const random = Math.floor(Math.random() * 2);
    const dir2 = random > 0 ? 50 : -50;
    const dir = random > 0 ? 200 : -200;
    this.ball.setVelocityX(dir);
    this.ball.setVelocityY(dir2);
  }

  public setScore(score: Phaser.GameObjects.Text) {
    const value = Number(score.text) + 1;
    score.setText(`${value}`);
  }

  public start() {}

  public update() {
    const velocity = new Phaser.Math.Vector2(0, 0);
    const velocity2 = new Phaser.Math.Vector2(0, 0);
    if (this.keyboard.up.isDown) {
      velocity.y -= 1;
    }
    if (this.keyboard.down.isDown) {
      velocity.y += 1;
    }

    if (this.keyboard.up2.isDown) {
      velocity2.y -= 1;
    }
    if (this.keyboard.down2.isDown) {
      velocity2.y += 1;
    }

    if (this.ball.body.touching.left || this.ball.body.touching.right) {
      this.ball.body.velocity.x += this.ball.body.velocity.x > 0 ? 50 : -50;
    }

    const normalizedVelocity = velocity.normalize();
    this.player.setVelocity(
      normalizedVelocity.x * this.speed,
      normalizedVelocity.y * this.speed
    );

    const normalizedVelocity2 = velocity2.normalize();
    this.player2.setVelocity(
      normalizedVelocity2.x * this.speed,
      normalizedVelocity2.y * this.speed
    );
  }
}
