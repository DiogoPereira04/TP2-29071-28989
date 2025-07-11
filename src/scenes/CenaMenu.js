export default class CenaMenu extends Phaser.Scene {
  constructor() {
    super('CenaMenu');
  }

  preload() {
    this.load.image('bg1', 'src/assets/backgrounds/background1.png');
    this.load.image('bg3', 'src/assets/backgrounds/background3.png');
    this.load.image('bg4', 'src/assets/backgrounds/background4.png');
  }

  create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    const highscore = localStorage.getItem('highscore') || 0;

    this.bgKeys = ['bg1', 'bg3', 'bg4'];
    this.backgrounds = [];

    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(i * largura, 0, this.bgKeys[i % this.bgKeys.length])
        .setOrigin(0)
        .setScrollFactor(0)
        .setDisplaySize(largura, altura)
        .setDepth(-10);
      this.backgrounds.push(bg);
    }

    this.scrollSpeed = 0.3;

    this.add.text(largura / 2, altura / 4, '🏃 GOLD RUNNER 🪙', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const botao = this.add.text(largura / 2, altura / 2, '▶ JOGAR', {
      fontSize: '36px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 40, y: 20 },
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    botao.on('pointerover', () => {
      botao.setStyle({ fill: '#ffffff' });
    });

    botao.on('pointerout', () => {
      botao.setStyle({ fill: '#ffff00' });
    });

    botao.on('pointerdown', () => {
      this.scene.start('CenaJogo');
    });

    this.add.text(largura / 2, altura / 2 + 100, `🏆 Melhor Pontuação: ${highscore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  update() {
    for (let bg of this.backgrounds) {
      bg.x -= this.scrollSpeed;
      if (bg.x + this.scale.width < 0) {
        const ultimoBG = this.backgrounds.reduce((prev, current) => prev.x > current.x ? prev : current);
        bg.x = ultimoBG.x + this.scale.width;
        const currentIndex = this.bgKeys.indexOf(bg.texture.key);
        const nextKey = this.bgKeys[(currentIndex + 1) % this.bgKeys.length];
        bg.setTexture(nextKey);
      }
    }
  }
}
