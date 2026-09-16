import Phaser, { Scene } from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class ChuaLang3Scene extends Scene {
  private player!: Player;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private uxos!: Phaser.Physics.Arcade.StaticGroup;
  private winZone!: Phaser.GameObjects.Rectangle;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  
  private visionMask!: Phaser.Display.Masks.GeometryMask;
  private visionGraphics!: Phaser.GameObjects.Graphics;
  private darkOverlay!: Phaser.GameObjects.Rectangle;
  private fogEnabled: boolean = false;
  private timeLeft: number = 60000; // 60 seconds

  constructor() {
    super('ChuaLang3');
  }

  create() {
    this.add.rectangle(512, 384, 1024, 768, 0x664422); // Mud bg

    this.walls = this.physics.add.staticGroup();
    this.uxos = this.physics.add.staticGroup();

    // Enemies
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

    // Generate basic maze
    for (let x = 100; x < 900; x += 100) {
      for (let y = 100; y < 700; y += 100) {
        if (Math.random() > 0.6) {
          (this.walls.create(x, y, 'wall') as Phaser.Physics.Arcade.Sprite).setDisplaySize(64, 64).refreshBody();
        } else if (Math.random() > 0.8) {
          const uxo = this.uxos.create(x, y, 'crate') as Phaser.Physics.Arcade.Sprite; // Use crate sprite for now
          uxo.setDisplaySize(24, 24).refreshBody();
          uxo.setTint(0xff0000); // Red UXO
        } else if (Math.random() > 0.85) {
          this.enemies.add(new Enemy(this, x, y));
        }
      }
    }

    // Bullets
    this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Bullet collisions
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => {
      (e as unknown as Enemy).takeDamage(50);
      (b as Bullet).die();
    });
    this.physics.add.collider(this.playerBullets, this.walls, (b) => (b as Bullet).die());
    this.physics.add.collider(this.enemyBullets, this.walls, (b) => (b as Bullet).die());
    
    this.physics.add.overlap(this.enemyBullets, this.player, (b, p) => {
      (p as unknown as Player).takeDamage(10);
      (b as Bullet).die();
    });

    // Player
    this.player = new Player(this, 50, 50);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.uxos, () => this.gameOver('Bạn đã giẫm phải bom mìn chưa nổ (UXO)!'), undefined, this);

    // Win Zone
    this.winZone = this.add.rectangle(950, 700, 100, 100, 0x00ff00, 0.5);
    this.physics.add.existing(this.winZone, true);
    this.physics.add.overlap(this.player, this.winZone, this.triggerWin, undefined, this);

    // Fog of War
    this.darkOverlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 1);
    this.visionGraphics = this.add.graphics();
    this.visionMask = this.visionGraphics.createGeometryMask();
    this.darkOverlay.setMask(this.visionMask);
    (this.visionMask as any).invertAlpha = true;
    
    // Initial Reveal (5 seconds)
    this.darkOverlay.setAlpha(0);
    
    useHanoiStore.getState().setDialogue({
      speaker: 'Mai',
      text: 'Hãy ghi nhớ con đường! Sương mù sẽ ập đến ngay. Đi tới sở chỉ huy (dưới cùng bên phải) trước khi có cuộc tấn công bằng súng cối sau 60 giây. Hãy coi chừng bom mìn (UXO) màu đỏ!'
    });

    this.time.delayedCall(5000, () => {
      this.fogEnabled = true;
      this.darkOverlay.setAlpha(1);
    });
  }

  update(time: number, delta: number) {
    if (this.player.health <= 0) {
      this.gameOver('Bạn đã hy sinh!');
      return;
    }

    this.player.update(false, time, (x, y, tx, ty) => {
      const bullet = this.playerBullets.get(x, y) as Bullet;
      if (bullet) bullet.fire(x, y, tx, ty, 600);
    });

    // Enemy updates
    this.enemies.getChildren().forEach(child => {
      const enemy = child as Enemy;
      enemy.update(time, delta, this.player.x, this.player.y, (x, y, tx, ty) => {
        const bullet = this.enemyBullets.get(x, y) as Bullet;
        if (bullet) bullet.fire(x, y, tx, ty, 300);
      }, true);
    });

    if (this.fogEnabled) {
      this.timeLeft -= delta;
      if (this.timeLeft <= 0) {
        this.gameOver('Hết thời gian! Cuộc tấn công bằng súng cối đã phá hủy khu vực.');
        return;
      }

      this.visionGraphics.clear();
      this.visionGraphics.fillStyle(0xffffff, 1);
      this.visionGraphics.fillCircle(this.player.x, this.player.y, 100);
    }
  }

  gameOver(reason: string) {
    this.scene.pause();
    useHanoiStore.getState().endGame(false);
    useHanoiStore.getState().setDialogue({ speaker: 'System', text: reason });
  }

  triggerWin() {
    this.scene.pause();
    useHanoiStore.getState().endGame(true);
    useHanoiStore.getState().setTrivia({
      question: 'Khu vực ngoại thành như Chùa Láng và sông Tô Lịch đóng vai trò chiến lược nào trong trận chiến 60 ngày đêm?',
      options: [
        'Nơi đây là bộ chỉ huy tối cao của Pháp.',
        'Chúng đóng vai trò là tuyến đường tiếp tế quan trọng và vành đai phòng thủ bảo vệ khu vực nội thành.',
        'Chúng bị bỏ hoang hoàn toàn vào ngày đầu tiên của trận chiến.'
      ],
      correctIndex: 1
    });
  }
}
