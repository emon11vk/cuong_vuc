import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key, left: Phaser.Input.Keyboard.Key, right: Phaser.Input.Keyboard.Key };
  public joystick!: any;
  public actionButtonDown: boolean = false;
  public health: number = 100;
  private lastFired: number = 0;
  private fireRate: number = 300; // ms

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(64, 64);

    this.setCollideWorldBounds(true);
    
    // Standard WASD + Arrows
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      // Add WASD keys if not using arrows
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    } else {
      throw new Error("Keyboard not found");
    }

    // Enable multi-touch
    scene.input.addPointer(2);
    
    // Create virtual joystick
    this.joystick = (scene.plugins.get('rexVirtualJoystick') as any).add(scene, {
      x: 150,
      y: scene.cameras.main.height - 150,
      radius: 80,
      base: scene.add.circle(0, 0, 80, 0x888888).setAlpha(0.3).setDepth(1000).setScrollFactor(0),
      thumb: scene.add.circle(0, 0, 40, 0xcccccc).setAlpha(0.5).setDepth(1000).setScrollFactor(0),
      dir: '8dir',
      forceMin: 16,
    });

    // Create Action Button (for SPACE bar actions)
    const actionBtn = scene.add.circle(scene.cameras.main.width - 150, scene.cameras.main.height - 150, 60, 0x00aaff).setAlpha(0.3).setDepth(1000).setScrollFactor(0).setInteractive();
    scene.add.text(scene.cameras.main.width - 150, scene.cameras.main.height - 150, 'ACTION', { fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
    
    actionBtn.on('pointerdown', () => this.actionButtonDown = true);
    actionBtn.on('pointerup', () => this.actionButtonDown = false);
    actionBtn.on('pointerout', () => this.actionButtonDown = false);

    // Default appearance if no texture
    if (!scene.textures.exists('player')) {
      const g = scene.make.graphics();
      g.fillStyle(0x00ff00, 1);
      g.fillRect(0, 0, 32, 32);
      g.generateTexture('player', 32, 32);
      g.destroy();
      this.setTexture('player');
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
    
    if (this.health <= 0) {
      // Player dies
      this.setTint(0x555555);
      this.disableBody(true, false);
      // Let the scene handle game over
    }
  }

  update(isStealth: boolean = false, time: number = 0, onShoot?: (x: number, y: number, targetX: number, targetY: number) => void) {
    if (this.health <= 0) return;

    this.setVelocity(0);
    const speed = isStealth ? 100 : 200;

    let vx = 0;
    let vy = 0;

    // Movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

    if (this.joystick && this.joystick.force > 0) {
      this.scene.physics.velocityFromRotation(this.joystick.rotation, speed, this.body?.velocity);
    } else {
      this.setVelocity(vx, vy);
    }

    // Aiming (rotate towards mouse or touch)
    let pointer = this.scene.input.activePointer;
    const pointers = [this.scene.input.pointer1, this.scene.input.pointer2, this.scene.input.pointer3, this.scene.input.mousePointer];
    
    let isShootingPointer = false;
    for (let p of pointers) {
      // Find a pointer that is down, not the joystick, and not on the right-side action button area
      const isRightSideBottom = p.x > this.scene.cameras.main.width - 300 && p.y > this.scene.cameras.main.height - 300;
      if (p.isDown && (!this.joystick.pointer || p.id !== this.joystick.pointer.id) && !isRightSideBottom) {
        pointer = p;
        isShootingPointer = true;
        break;
      }
    }

    if (isShootingPointer) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
      this.setRotation(angle);

      // Shooting
      if (time > this.lastFired && onShoot) {
        onShoot(this.x, this.y, pointer.worldX, pointer.worldY);
        this.lastFired = time + this.fireRate;
        
        // Muzzle flash particle
        const flash = this.scene.add.particles(this.x, this.y, 'player', {
          speed: 100,
          lifespan: 100,
          scale: { start: 0.2, end: 0 },
          quantity: 3,
          tint: 0xffff00,
          angle: { min: Phaser.Math.RadToDeg(angle) - 15, max: Phaser.Math.RadToDeg(angle) + 15 }
        });
        this.scene.time.delayedCall(100, () => flash.destroy());
      }
    }
  }
}
