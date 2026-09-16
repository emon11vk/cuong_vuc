import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class Level2Scene extends Scene {
  private player!: Player;
  private crates!: Phaser.Physics.Arcade.StaticGroup;
  private guards!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  
  private visionMask!: Phaser.Display.Masks.GeometryMask;
  private visionGraphics!: Phaser.GameObjects.Graphics;
  private darkOverlay!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Level2');
  }

  create() {
    // Basic Environment
    this.add.rectangle(512, 384, 1024, 768, 0x111111);

    // Player
    this.player = new Player(this, 100, 700);

    // Crates to collect
    this.crates = this.physics.add.staticGroup();
    (this.crates.create(300, 200, 'crate') as Phaser.Physics.Arcade.Sprite).setDisplaySize(24, 24).refreshBody();
    (this.crates.create(800, 100, 'crate') as Phaser.Physics.Arcade.Sprite).setDisplaySize(24, 24).refreshBody();
    (this.crates.create(700, 600, 'crate') as Phaser.Physics.Arcade.Sprite).setDisplaySize(24, 24).refreshBody();

    // Guards
    this.guards = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    const guard = new Enemy(this, 512, 384);
    this.guards.add(guard);

    // Bullets
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    
    // Lighting / Mask
    this.darkOverlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.95);
    
    this.visionGraphics = this.add.graphics();
    this.visionGraphics.fillStyle(0xffffff, 1);
    this.visionGraphics.fillCircle(0, 0, 100);
    
    // Mask logic
    this.visionMask = this.visionGraphics.createGeometryMask();
    this.darkOverlay.setMask(this.visionMask);
    this.visionMask.setInvertAlpha(true); // Hole punch

    // Collisions
    this.physics.add.overlap(this.player, this.crates, this.collectCrate, undefined, this);
    
    // Bullet collisions
    this.physics.add.collider(this.playerBullets, this.crates, (b) => (b as Bullet).die());
    this.physics.add.collider(this.enemyBullets, this.crates, (b) => (b as Bullet).die());
    
    this.physics.add.overlap(this.playerBullets, this.guards, (b, e) => {
      (e as unknown as Enemy).takeDamage(50);
      (b as Bullet).die();
    });
    
    this.physics.add.overlap(this.enemyBullets, this.player, (b, p) => {
      (p as unknown as Player).takeDamage(10);
      (b as Bullet).die();
    });

    // Input
    if (this.input.keyboard) {
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // Narrative Hook
    setTimeout(() => {
      useHanoiStore.getState().setDialogue({
        speaker: 'Mai',
        text: 'Pháo đài Láng đang bị canh gác. Giữ phím SHIFT (hoặc nút HÀNH ĐỘNG trên điện thoại) để đi rón rén và thu thập 3 thùng thuốc nổ. Hoặc bạn có thể bắn hạ chúng!'
      });
    }, 1000);
  }

  update(time: number, delta: number) {
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }

    const isStealth = this.shiftKey.isDown || this.player.actionButtonDown;
    this.player.update(isStealth, time, (x, y, tx, ty) => {
      const bullet = this.playerBullets.get(x, y) as Bullet;
      if (bullet) bullet.fire(x, y, tx, ty, 600);
    });

    // Update vision mask position (follow player)
    this.visionGraphics.clear();
    this.visionGraphics.fillStyle(0xffffff, 1);
    // Player vision radius
    this.visionGraphics.fillCircle(this.player.x, this.player.y, isStealth ? 80 : 150);
    
    // Enemy updates
    this.guards.getChildren().forEach((guardObj) => {
      const guard = guardObj as Enemy;
      this.visionGraphics.fillCircle(guard.x, guard.y, 100);
      
      const isMoving = this.player.body?.velocity.x !== 0 || this.player.body?.velocity.y !== 0;
      const canDetect = !isStealth && isMoving;
      
      guard.update(time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 300);
      }, canDetect);
    });

    // (GeometryMask updates automatically when graphics updates)
  }

  collectCrate(_player: any, crate: any) {
    crate.destroy();
    useHanoiStore.getState().addCrate();
    
    if (useHanoiStore.getState().cratesCollected >= 3) {
      this.triggerWin();
    }
  }

  gameOver() {
    this.scene.pause();
    useHanoiStore.getState().endGame(false);
    useHanoiStore.getState().setDialogue({
      speaker: 'Hệ thống',
      text: 'Bạn đã bị phát hiện! Nhớ giữ phím SHIFT để di chuyển trong im lặng.'
    });
  }

  triggerWin() {
    this.scene.pause();
    useHanoiStore.getState().endGame(true);
    useHanoiStore.getState().setTrivia({
      question: 'Vũ khí mang tính biểu tượng nào, do một chiến sĩ thao tác, đã được Việt Minh sử dụng để phá hủy xe tăng Pháp với cái giá là tính mạng của người sử dụng?',
      options: [
        'Bom ba càng',
        'Bazooka',
        'Bom xăng (Molotov Cocktail)'
      ],
      correctIndex: 0
    });
  }
}
