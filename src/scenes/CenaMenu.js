export default class CenaMenu extends Phaser.Scene {
  constructor() {
    super('CenaMenu');
  }

  preload() {
    this.load.image('bg1', 'src/assets/backgrounds/background1.png');
  }

  create() {
    this.add.image(0, 0, 'bg1').setOrigin(0);
  }
}
