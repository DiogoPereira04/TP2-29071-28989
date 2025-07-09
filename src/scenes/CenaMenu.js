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

    this.bgKeys = ['bg1', 'bg3', 'bg4'];
    this.backgrounds = [];

    // Cria 3 backgrounds lado a lado
    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(i * largura, 0, this.bgKeys[i % this.bgKeys.length])
        .setOrigin(0)
        .setScrollFactor(0)
        .setDisplaySize(largura, altura)
        .setDepth(-10);
      this.backgrounds.push(bg);
    }

    this.scrollSpeed = 0.3; // Velocidade do background

    // Título do jogo
    this.add.text(largura / 2, altura / 3, 'Corrida Infinita', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Botão "Jogar"
    const botao = this.add.text(largura / 2, altura / 2, 'JOGAR', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on('pointerdown', () => {
      this.scene.start('CenaJogo');
    });
  }

  update() {
    // Movimento contínuo do background
    for (let bg of this.backgrounds) {
      bg.x -= this.scrollSpeed;

      // Se sair completamente da tela, move para o fim da fila
      if (bg.x + this.scale.width < 0) {
        const ultimoBG = this.backgrounds.reduce((prev, current) => prev.x > current.x ? prev : current);
        bg.x = ultimoBG.x + this.scale.width;

        // Troca a textura para o próximo fundo
        const currentIndex = this.bgKeys.indexOf(bg.texture.key);
        const nextKey = this.bgKeys[(currentIndex + 1) % this.bgKeys.length];
        bg.setTexture(nextKey);
      }
    }
  }
}
