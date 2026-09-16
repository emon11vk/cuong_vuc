import './phaserGlobal';
import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { BootScene } from './scenes/BootScene';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { ChuaLang1Scene } from './scenes/ChuaLang1Scene';
import { ChuaLang2Scene } from './scenes/ChuaLang2Scene';
import { ChuaLang3Scene } from './scenes/ChuaLang3Scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  plugins: {
    global: [{
      key: 'rexVirtualJoystick',
      plugin: VirtualJoystickPlugin,
      start: true
    }]
  },
  scene: [
    BootScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    ChuaLang1Scene,
    ChuaLang2Scene,
    ChuaLang3Scene
  ]
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
