import Phaser from 'phaser';

// Expose Phaser globally so that plugins (like phaser3-rex-plugins) can find it.
(window as any).Phaser = Phaser;

export default Phaser;
