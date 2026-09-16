import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class Level3Scene extends Scene {
  private player!: Player;
  private searchlights!: Phaser.GameObjects.Rectangle[];
  private noiseAccumulator: number = 0;
  private winZone!: Phaser.GameObjects.Rectangle;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  constructor() {
    super('Level3');
  }

  create() {
    // Environment (River at bottom, Bridge at top)
    this.add.rectangle(512, 100, 1024, 200, 0x555555); // Bridge
    this.add.rectangle(512, 600, 1024, 400, 0x1a3344); // River

    // Player
    this.player = new Player(this, 100, 600);
    this.player.setCollideWorldBounds(true);
    
    // Searchlights
    this.searchlights = [];
    for (let i = 0; i < 3; i++) {
      const light = this.add.rectangle(300 + i * 250, 400, 100, 800, 0xffff00, 0.3);
      this.searchlights.push(light);
      
      // Tween sweeping
      this.tweens.add({
        targets: light,
        x: light.x + 200,
        duration: 2000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Win Zone
    this.winZone = this.add.rectangle(950, 600, 100, 400, 0x00ff00, 0.3);
    this.physics.add.existing(this.winZone, true);

    this.physics.add.overlap(this.player, this.winZone, this.triggerWin, undefined, this);

    // Enemies
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.enemies.add(new Enemy(this, 300, 100)); // On bridge
    this.enemies.add(new Enemy(this, 700, 100)); // On bridge
    this.enemies.add(new Enemy(this, 800, 600)); // Near win zone

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

    // Fog Emitter
    this.add.particles(0, 0, 'wall', {
      x: { min: 0, max: 1024 },
      y: { min: 400, max: 768 },
      lifespan: 10000,
      speedX: { min: -10, max: 10 },
      alpha: { start: 0.1, end: 0 },
      scale: { min: 2, max: 4 },
      blendMode: 'ADD'
    });

    useHanoiStore.getState().setDialogue({
      speaker: 'Commissar Lê',
      text: 'The French are searching the river from Long Bien bridge. Wade through the water. Do not move when the searchlights pass over you, and keep quiet! (Move right to row, freeze to lower noise)'
    });
  }

  update(time: number, delta: number) {
    if (this.player.health <= 0) {
      this.gameOver('You were killed!');
      return;
    }

    this.player.update(false, time, (x, y, tx, ty) => {
      const bullet = this.playerBullets.get(x, y) as Bullet;
      if (bullet) bullet.fire(x, y, tx, ty, 600);
      // Shooting increases noise massively
      this.noiseAccumulator += 20; 
    });
    
    // Check movement for Noise Meter
    const isMoving = this.player.body?.velocity.x !== 0 || this.player.body?.velocity.y !== 0;
    
    if (isMoving) {
      this.noiseAccumulator += delta * 0.02; // Increase noise
    } else {
      this.noiseAccumulator -= delta * 0.05; // Decrease noise
    }
    
    // Clamp noise
    this.noiseAccumulator = Phaser.Math.Clamp(this.noiseAccumulator, 0, 100);
    useHanoiStore.getState().setNoiseLevel(this.noiseAccumulator);

    if (this.noiseAccumulator >= 100) {
      this.gameOver('You made too much noise! The French heard you.');
      return;
    }

    // Check searchlight intersection
    if (isMoving) {
      for (const light of this.searchlights) {
        const playerBounds = this.player.getBounds();
        const lightBounds = light.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, lightBounds)) {
          this.gameOver('You were spotted moving in the searchlight!');
          return;
        }
      }
    }
    
    // Update enemies
    this.enemies.getChildren().forEach(child => {
      const enemy = child as Enemy;
      // Enemies can always detect player if they are noisy, otherwise standard detect radius
      const canDetect = this.noiseAccumulator > 50 || (!isMoving && false); // simplify
      
      enemy.update(time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 300);
      }, true); // Enemies in Level3 always use standard detection
    });
  }

  gameOver(reason: string) {
    this.scene.pause();
    useHanoiStore.getState().endGame(false);
    useHanoiStore.getState().setDialogue({
      speaker: 'System',
      text: reason
    });
  }

  triggerWin() {
    this.scene.pause();
    useHanoiStore.getState().endGame(true);
    useHanoiStore.getState().setTrivia({
      question: 'How did the Capital Regiment successfully evacuate thousands of troops without alerting the nearby French forces?',
      options: [
        'They launched a massive frontal diversionary attack.',
        'They crossed the Red River silently at night under heavy fog, beneath the bridge.',
        'They surrendered and were deported.'
      ],
      correctIndex: 1
    });
  }
}
