import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(8, 8);
    
    // Setup physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCircle(4);
      body.setCollideWorldBounds(true);
      body.onWorldBounds = true; // Emit event when hitting bounds
    }

    // Default appearance if no texture
    if (!scene.textures.exists('bullet')) {
      const g = scene.make.graphics();
      g.fillStyle(0xffff00, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('bullet', 8, 8);
      g.destroy();
      this.setTexture('bullet');
    }
  }

  fire(x: number, y: number, targetX: number, targetY: number, speed: number = 400) {
    this.setActive(true);
    this.setVisible(true);
    this.enableBody(true, x, y, true, true);
    
    // Calculate angle
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.setRotation(angle);
    
    // Set velocity
    this.scene.physics.velocityFromRotation(angle, speed, this.body?.velocity);
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
  }

  update() {
    if (!this.active) return;
    // If bullet goes out of camera bounds, destroy it
    if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
      this.die();
    }
  }
}
