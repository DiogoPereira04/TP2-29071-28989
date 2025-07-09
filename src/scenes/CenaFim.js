export default class CenaFim extends Phaser.Scene {
  constructor() {
    super('CenaFim');
  }

  init(data) {
    this.moedas = data.moedas || 0;
    this.pontuacao = data.pontuacao || 0;
  }

  preload() {
    this.load.image('bg1', 'src/assets/backgrounds/background1.png');
    this.load.image('bg3', 'src/assets/backgrounds/background3.png');
    this.load.image('bg4', 'src/assets/backgrounds/background4.png');
  }

  create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    // Fundo infinito animado
    this.bgKeys = ['bg1', 'bg3', 'bg4'];
    this.backgrounds = [];

    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(i * largura, 0, this.bgKeys[i % this.bgKeys.length])
        .setOrigin(0)
        .setDepth(-10)
        .setScrollFactor(0); // <- fixo à câmara

      bg.displayWidth = largura;
      bg.displayHeight = altura;
      this.backgrounds.push(bg);
    }

    this.bgVelocidade = 0.5;

    // Texto central fixo
    this.add.text(largura / 2, 100, 'Game Over', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 200, `Moedas Recolhidas: ${this.moedas}`, {
      fontSize: '28px',
      fill: '#ffff00'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 250, `Pontuação Final: ${this.pontuacao}`, {
      fontSize: '28px',
      fill: '#00ffff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 350, 'Pressiona qualquer tecla para voltar ao menu', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Input
    this.input.keyboard.once('keydown', () => {
      this.scene.start('CenaMenu');
    });
  }

  update() {
    const largura = this.scale.width;

    // Fundo infinito animado
    this.backgrounds.forEach(bg => {
      bg.x -= this.bgVelocidade;
      if (bg.x + largura < 0) {
        bg.x += largura * this.backgrounds.length;
        const nextIndex = this.bgKeys.indexOf(bg.texture.key);
        const newKey = this.bgKeys[(nextIndex + 1) % this.bgKeys.length];
        bg.setTexture(newKey);
      }
    });
  }
}
