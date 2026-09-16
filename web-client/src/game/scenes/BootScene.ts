import { Scene } from 'phaser';

export class BootScene extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load generated image assets
    this.load.image('player', '/assets/player.png');
    this.load.image('enemy', '/assets/enemy.png');
    this.load.image('npc', '/assets/npc.png');
    
    // Generate placeholder assets dynamically for non-character objects
    const graphics = this.make.graphics();
    
    // Wall placeholder (gray square)
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('wall', 32, 32);
    graphics.clear();

    // Crate placeholder (yellow square)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 24, 24);
    graphics.generateTexture('crate', 24, 24);
    graphics.clear();
  }

  create() {
    // Determine which minigame to launch based on registry data passed from React
    const targetMinigame = this.registry.get('targetMinigame') || 'level1';
    
    // Map registry ID to scene key
    const sceneMap: Record<string, string> = {
      'level1': 'Level1',
      'level2': 'Level2',
      'level3': 'Level3',
      'chua_lang1': 'ChuaLang1',
      'chua_lang2': 'ChuaLang2',
      'chua_lang3': 'ChuaLang3',
    };
    
    const targetScene = sceneMap[targetMinigame] || 'Level1';
    this.scene.start(targetScene);
  }
}
