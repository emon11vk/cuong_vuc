import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { Bullet } from '../entities/Bullet';

export class Level1Scene extends Scene {
  private player!: Player;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private breakableWalls!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private npcs!: Phaser.GameObjects.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  
  private tank!: Phaser.Physics.Arcade.Sprite;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private breakProgress: number = 0;
  private breakingWall: Phaser.GameObjects.GameObject | null = null;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super('Level1');
  }

  create() {
    // Lighting
    this.lights.enable();
    this.lights.setAmbientColor(0x333333);

    // Street (Death Zone)
    const street = this.add.rectangle(512, 100, 1024, 200, 0x333333);
    this.physics.add.existing(street, true);

    // Tank on street
    this.tank = this.physics.add.sprite(100, 100, 'enemy');
    this.tank.setDisplaySize(128, 128);
    this.tank.setTint(0x555555); // Gray tank
    this.tweens.add({
      targets: this.tank,
      x: 900,
      duration: 4000,
      yoyo: true,
      repeat: -1
    });

    // Groups
    this.walls = this.physics.add.staticGroup();
    this.breakableWalls = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.npcs = this.add.group({ classType: NPC, runChildUpdate: true });
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    
    // Draw 4 houses
    for (let i = 0; i < 4; i++) {
      const x = 128 + i * 256;
      (this.walls.create(x, 200, 'wall') as Phaser.Physics.Arcade.Sprite).setDisplaySize(256, 32).refreshBody().setPipeline('Light2D');
      (this.walls.create(x, 700, 'wall') as Phaser.Physics.Arcade.Sprite).setDisplaySize(256, 32).refreshBody().setPipeline('Light2D');
      
      if (i < 3) {
        (this.walls.create(x + 128, 300, 'wall') as Phaser.Physics.Arcade.Sprite).setDisplaySize(32, 128).refreshBody().setPipeline('Light2D');
        const bWall = this.breakableWalls.create(x + 128, 450, 'wall') as Phaser.Physics.Arcade.Sprite;
        bWall.setDisplaySize(32, 64).refreshBody().setPipeline('Light2D');
        bWall.setTint(0x884400); 
        (this.walls.create(x + 128, 600, 'wall') as Phaser.Physics.Arcade.Sprite).setDisplaySize(32, 128).refreshBody().setPipeline('Light2D');
      }
    }

    // Win Zone
    const winZone = this.add.rectangle(900, 450, 100, 100, 0x00ff00, 0.3);
    this.physics.add.existing(winZone, true);

    // Player
    this.player = new Player(this, 100, 450);
    this.lights.addLight(this.player.x, this.player.y, 150, 0xffffff, 1.0);

    // Add NPC
    const commander = new NPC(this, 100, 300, 'Commander');
    commander.setDialogue([
      { speaker: 'Chính ủy Lê', text: 'Vinh! Chúng ta phải di chuyển qua các ngôi nhà! Phố đang bị xe thiết giáp Pháp tuần tra.' },
      { speaker: 'Chính ủy Lê', text: 'Đứng gần các bức tường màu nâu và giữ phím SPACE để đục tường!' },
      { speaker: 'Chính ủy Lê', text: 'Dùng chuột để nhắm và click để bắn bất cứ kẻ thù nào trong nhà. Đi thôi!' }
    ]);
    this.npcs.add(commander);

    // Add Enemies inside houses
    const enemy1 = new Enemy(this, 350, 450);
    const enemy2 = new Enemy(this, 600, 350);
    const enemy3 = new Enemy(this, 600, 550);
    this.enemies.addMultiple([enemy1, enemy2, enemy3]);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.breakableWalls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.breakableWalls);
    
    // Bullet collisions
    this.physics.add.collider(this.playerBullets, this.walls, (b) => (b as Bullet).die());
    this.physics.add.collider(this.playerBullets, this.breakableWalls, (b) => (b as Bullet).die());
    this.physics.add.collider(this.enemyBullets, this.walls, (b) => (b as Bullet).die());
    this.physics.add.collider(this.enemyBullets, this.breakableWalls, (b) => (b as Bullet).die());
    
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => {
      (e as unknown as Enemy).takeDamage(50);
      (b as Bullet).die();
    });
    
    this.physics.add.overlap(this.enemyBullets, this.player, (b, p) => {
      (p as unknown as Player).takeDamage(10);
      (b as Bullet).die();
    });

    this.physics.add.overlap(this.player, street, this.gameOver, undefined, this);
    this.physics.add.overlap(this.player, this.tank, this.gameOver, undefined, this);
    this.physics.add.overlap(this.player, winZone, this.triggerWin, undefined, this);

    useHanoiStore.getState().setDialogue({
      speaker: 'Chỉ huy',
      text: 'Bảo vệ cơ sở an toàn! Dùng phím WASD/Joystick để di chuyển và Click/Chạm để bắn. Hãy cầm cự cho đến khi tiêu diệt hết kẻ thù!'
    });

    // Input
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    this.progressBar = this.add.graphics();
  }

  update(time: number, delta: number) {
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }

    // Player update & shooting callback
    this.player.update(false, time, (x, y, tx, ty) => {
      const bullet = this.playerBullets.get(x, y) as Bullet;
      if (bullet) {
        bullet.fire(x, y, tx, ty, 600);
      }
    });

    // Update light position
    this.lights.lights[0].setPosition(this.player.x, this.player.y);

    // Enemy AI & shooting callback
    this.enemies.getChildren().forEach(child => {
      const enemy = child as unknown as Enemy;
      enemy.update(time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) {
          bullet.fire(x, y, tx, ty, 300); // Slower enemy bullets
        }
      });
    });

    // NPC updates
    this.npcs.getChildren().forEach(child => {
      (child as NPC).update(this.player);
    });

    // Wall breaking logic
    this.progressBar.clear();
    if (this.spaceKey.isDown) {
      let closestWall: Phaser.Physics.Arcade.Sprite | null = null;
      let minDistance = 60;
      this.breakableWalls.getChildren().forEach((child) => {
        const wall = child as Phaser.Physics.Arcade.Sprite;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, wall.x, wall.y);
        if (dist < minDistance) {
          closestWall = wall;
          minDistance = dist;
        }
      });

      if (closestWall) {
        if (this.breakingWall !== closestWall) {
          this.breakingWall = closestWall;
          this.breakProgress = 0;
        }
        this.breakProgress += delta;
        this.progressBar.fillStyle(0x000000, 0.8);
        this.progressBar.fillRect(this.player.x - 20, this.player.y - 40, 40, 6);
        this.progressBar.fillStyle(0xffaa00, 1);
        this.progressBar.fillRect(this.player.x - 20, this.player.y - 40, 40 * (this.breakProgress / 3000), 6);

        if (this.breakProgress >= 3000) {
          (closestWall as Phaser.Physics.Arcade.Sprite).destroy();
          this.breakingWall = null;
          this.breakProgress = 0;
        }
      } else {
        this.breakProgress = 0;
        this.breakingWall = null;
      }
    } else {
      this.breakProgress = 0;
      this.breakingWall = null;
    }
  }

  gameOver() {
    this.scene.pause();
    useHanoiStore.getState().endGame(false);
    useHanoiStore.getState().setDialogue({
      speaker: 'Hệ thống',
      text: 'Bạn đã hy sinh. Hãy thử lại.'
    });
  }

  triggerWin() {
    this.scene.pause();
    useHanoiStore.getState().endGame(true);
    useHanoiStore.getState().setTrivia({
      question: 'Trung đoàn Thủ đô đã sử dụng chiến thuật nào để di chuyển an toàn giữa các ngôi nhà trong Khu Phố Cổ?',
      options: [
        'Chỉ sử dụng hệ thống cống ngầm.',
        '"Đục tường" - đục lỗ xuyên qua tường của các ngôi nhà liền kề.',
        'Mặc đồng phục của quân Pháp để ngụy trang.'
      ],
      correctIndex: 1
    });
  }
}
