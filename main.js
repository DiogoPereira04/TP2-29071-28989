import CenaMenu from './src/scenes/CenaMenu.js';
import CenaJogo from './src/scenes/CenaJogo.js';
import CenaFim from './src/scenes/CenaFim.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: [CenaMenu, CenaJogo, CenaFim],
   scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);