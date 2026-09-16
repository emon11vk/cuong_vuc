import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  private patrolSpeed: number = 50;
  private chaseSpeed: number = 120;
  private detectRadius: number = 250;
  private enemyState: 'patrol' | 'chase' | 'attack' = 'patrol';
  private patrolTarget: Phaser.Math.Vector2;
  private spawnPoint: Phaser.Math.Vector2;
  private lastFired: number = 0;
  private fireRate: number = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(64, 64);
    
    this.setCollideWorldBounds(true);
    this.spawnPoint = new Phaser.Math.Vector2(x, y);
    this.patrolTarget = this.getRandomPatrolPoint();
  }

  private getRandomPatrolPoint(): Phaser.Math.Vector2 {
    const rx = Phaser.Math.Between(this.spawnPoint.x - 100, this.spawnPoint.x + 100);
    const ry = Phaser.Math.Between(this.spawnPoint.y - 100, this.spawnPoint.y + 100);
    return new Phaser.Math.Vector2(rx, ry);
  }

  takeDamage(amount: number) {
    this.health -= amount;
    
    // Flash white when hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    } else {
      this.enemyState = 'chase'; // Aggro on hit
    }
  }

  private die() {
    // Basic death effect
    const particles = this.scene.add.particles(this.x, this.y, 'enemy', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 10,
      tint: 0xff0000
    });
    
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
    
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
  }

  update(time: number, _delta: number, playerX: number, playerY: number, onFire?: (x: number, y: number, tx: number, ty: number) => void, canDetect: boolean = true) {
    if (!this.active) return;

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    if (canDetect && distToPlayer < this.detectRadius) {
      this.enemyState = 'chase';
    } else {
      this.enemyState = 'patrol';
    }

    if (this.enemyState === 'patrol') {
      this.patrol();
    } else if (this.enemyState === 'chase') {
      this.chase(playerX, playerY);
      
      // Attack if close enough
      if (distToPlayer < this.detectRadius * 0.8 && time > this.lastFired) {
        if (onFire) {
          onFire(this.x, this.y, playerX, playerY);
          this.lastFired = time + this.fireRate;
        }
      }
    }
  }

  private patrol() {
    const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
    if (distToTarget < 10) {
      this.patrolTarget = this.getRandomPatrolPoint();
    }
    this.scene.physics.moveTo(this, this.patrolTarget.x, this.patrolTarget.y, this.patrolSpeed);
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y));
  }

  private chase(targetX: number, targetY: number) {
    this.scene.physics.moveTo(this, targetX, targetY, this.chaseSpeed);
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY));
  }
}
