import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class ChuaLang2Scene extends Scene {
  private tank!: Phaser.Physics.Arcade.Sprite;
  private mine!: Phaser.GameObjects.Rectangle;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isMinePlaced: boolean = false;
  private tankSpeed: number = 50;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  constructor() {
    super('ChuaLang2');
  }

  create() {
    // Road
    this.add.rectangle(512, 384, 1024, 200, 0x443322); // Mud road

    // Tank coming from left
    this.tank = this.physics.add.sprite(50, 384, 'enemy');
    this.tank.setDisplaySize(192, 192);
    this.tank.setTint(0x555555);

    // Player
    this.player = new Player(this, 800, 600);

    // Enemies (Escorts)
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.enemies.add(new Enemy(this, 100, 300));
    this.enemies.add(new Enemy(this, 100, 500));

    // Bullets
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Collisions
    this.physics.add.overlap(this.playerBullets, this.enemies, (e, b) => {
      (e as unknown as Enemy).takeDamage(50);
      (b as Bullet).die();
    });
    this.physics.add.overlap(this.playerBullets, this.tank, (t, b) => {
      (b as Bullet).die(); // Tank is immune to bullets
    });
    this.physics.add.overlap(this.enemyBullets, this.player, (p, b) => {
      (p as unknown as Player).takeDamage(10);
      (b as Bullet).die();
    });

    // Setup input
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    useHanoiStore.getState().setDialogue({
      speaker: 'Mai',
      text: 'A French half-track is coming! Click/Tap the road to place a Lunge Mine, then shoot the escorts. When the tank hits the mine, press SPACE (or ACTION) to detonate!'
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore clicks on virtual joystick or action button areas for placing mine
      if (pointer.x < 300 && pointer.y > 450) return; 
      if (pointer.x > 700 && pointer.y > 450) return; 

      if (!this.isMinePlaced) {
        this.mine = this.add.rectangle(pointer.x, 384, 40, 40, 0xff0000);
        this.physics.add.existing(this.mine, true);
        this.isMinePlaced = true;
      }
    });
  }

  update(_time: number, delta: number) {
    if (!this.isMinePlaced) return;

    this.tank.x += (this.tankSpeed * delta) / 1000;

    if (this.tank.x > 1024) {
      this.gameOver('The tank breached the barricade!');
      return;
    }

    if (this.spaceKey.isDown || this.player.actionButtonDown) {
      if (!this.mine) return;
      
      // Check if tank is over mine
      const dist = Phaser.Math.Distance.Between(this.tank.x, this.tank.y, this.mine.x, this.mine.y);
      if (dist < 80) {
        // Boom
        this.mine.destroy();
        this.tank.destroy();
        this.triggerWin();
      } else {
        // Triggered too early
        this.gameOver('You triggered the mine too early! The tank destroyed you.');
      }
    }

    if (this.player.health <= 0) {
      this.gameOver('You were killed by the escorts!');
      return;
    }

    this.player.update(false, _time, (x, y, tx, ty) => {
      if (this.isMinePlaced) { // Only shoot after placing mine
        const bullet = this.playerBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 600);
      }
    });

    // Escorts advance with tank
    this.enemies.getChildren().forEach(child => {
      const enemy = child as Enemy;
      // If they are far behind tank, move them forward, otherwise they patrol/chase
      if (enemy.x < this.tank.x - 50) {
        enemy.x += (this.tankSpeed * delta) / 1000;
      }
      enemy.update(_time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 300);
      }, true);
    });
  }

  gameOver(reason: string) {
    this.scene.pause();
    useHanoiStore.getState().endGame(false);
    useHanoiStore.getState().setDialogue({ speaker: 'System', text: reason });
  }

  triggerWin() {
    this.scene.pause();
    useHanoiStore.getState().endGame(true);
    useHanoiStore.getState().setDialogue({
      speaker: 'Gunner Hoàng',
      text: 'Incredible! The half-track is destroyed. You bought us enough time to relocate the artillery!'
    });
  }
}
