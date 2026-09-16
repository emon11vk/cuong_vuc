import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { NPC } from '../entities/NPC';

export class ChuaLang1Scene extends Scene {
  private player!: Player;
  private stamina: number = 100;
  private noise: number = 0;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isFlareActive: boolean = false;
  private flareOverlay!: Phaser.GameObjects.Rectangle;
  private winZone!: Phaser.GameObjects.Rectangle;
  private npcs!: Phaser.GameObjects.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  constructor() {
    super('ChuaLang1');
  }

  create() {
    // Water background
    this.add.rectangle(512, 384, 1024, 768, 0x1a3a3a);
    
    // Lotus patches (cover)
    this.add.rectangle(300, 300, 150, 150, 0x004400, 0.7);
    this.add.rectangle(700, 500, 200, 150, 0x004400, 0.7);

    // Player
    this.player = new Player(this, 100, 700);

    // Win Zone (Boat)
    this.winZone = this.add.rectangle(950, 100, 100, 200, 0x8b4513);
    this.physics.add.existing(this.winZone, true);
    this.physics.add.overlap(this.player, this.winZone, this.triggerWin, undefined, this);

    // Enemies
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.enemies.add(new Enemy(this, 300, 300)); // On lotus patch
    this.enemies.add(new Enemy(this, 700, 500)); // On lotus patch
    
    // Bullets
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Bullet collisions
    this.physics.add.overlap(this.playerBullets, this.enemies, (e, b) => {
      (e as unknown as Enemy).takeDamage(50);
      (b as Bullet).die();
    });
    this.physics.add.overlap(this.enemyBullets, this.player, (p, b) => {
      (p as unknown as Player).takeDamage(10);
      (b as Bullet).die();
    });

    // NPC
    this.npcs = this.add.group({ classType: NPC, runChildUpdate: true });
    const mai = new NPC(this, 150, 700, 'Mai');
    mai.setDialogue([
      { speaker: 'Mai', text: 'Vinh, the water is deep here. Move slowly to conserve stamina.' },
      { speaker: 'Mai', text: 'When the French fire flares, hold SPACE to dive underwater, but watch your breath (stamina)!' }
    ]);
    this.npcs.add(mai);

    useHanoiStore.getState().setDialogue({
      speaker: 'Mai',
      text: 'The French are firing flares! When the screen flashes yellow, press SPACE (or ACTION button) to dive underwater. Watch your stamina!'
    });

    // Flare visual
    this.flareOverlay = this.add.rectangle(512, 384, 1024, 768, 0xffaa00, 0);
    this.flareOverlay.setBlendMode('ADD');

    // Flare Loop
    this.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        this.isFlareActive = true;
        this.tweens.add({
          targets: this.flareOverlay,
          fillAlpha: 0.5,
          duration: 500,
          yoyo: true,
          hold: 3000,
          onComplete: () => { this.isFlareActive = false; }
        });
      }
    });

    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  update(_time: number, delta: number) {
    if (this.player.health <= 0) {
      this.gameOver('You were killed!');
      return;
    }

    const isDiving = this.spaceKey.isDown || this.player.actionButtonDown;
    
    if (isDiving) {
      this.player.setVelocity(0); // Can't move while diving
      this.player.setAlpha(0.2); // Visual indicator of diving
      this.stamina -= delta * 0.05; // Drain stamina
    } else {
      this.player.setAlpha(1);
      this.player.update(false, _time, (x, y, tx, ty) => {
        const bullet = this.playerBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 600);
        this.noise += 20; // Shooting makes noise
      });
      
      const isMoving = this.player.body?.velocity.x !== 0 || this.player.body?.velocity.y !== 0;
      
      if (isMoving) {
        this.noise += delta * 0.01;
        this.stamina -= delta * 0.01;
      } else {
        this.noise -= delta * 0.02;
        this.stamina += delta * 0.02;
      }
    }

    this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100);
    this.noise = Phaser.Math.Clamp(this.noise, 0, 100);

    useHanoiStore.getState().setStamina(this.stamina);
    useHanoiStore.getState().setNoiseLevel(this.noise);

    if (this.stamina <= 0) {
      this.gameOver('You drowned from exhaustion!');
    } else if (this.noise >= 100) {
      this.gameOver('You made too much noise splashing!');
    } else if (this.isFlareActive && !isDiving) {
      this.gameOver('You were spotted by the flare! Remember to dive (SPACE) when it gets bright.');
    }

    // NPC updates
    this.npcs.getChildren().forEach(child => {
      (child as NPC).update(this.player);
    });

    // Enemy updates
    this.enemies.getChildren().forEach(child => {
      const enemy = child as Enemy;
      // Enemies can't detect player if they are diving, unless they are very close
      const canDetect = !isDiving;
      
      enemy.update(_time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 300);
      }, canDetect);
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
      speaker: 'Mai',
      text: 'You made it to the boat. The wounded are safe.'
    });
  }
}
