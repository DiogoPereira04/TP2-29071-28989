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

    this.bgKeys = ['bg1', 'bg3', 'bg4'];
    this.backgrounds = [];

    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(i * largura, 0, this.bgKeys[i % this.bgKeys.length])
        .setOrigin(0)
        .setDepth(-10)
        .setScrollFactor(0);
      bg.displayWidth = largura;
      bg.displayHeight = altura;
      this.backgrounds.push(bg);
    }

    this.bgVelocidade = 0.5;

    this.add.text(largura / 2, 100, '💀 GAME OVER 💀', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 200, `🪙 Moedas Recolhidas: ${this.moedas}`, {
      fontSize: '28px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 250, `⭐ Pontuação Final: ${this.pontuacao}`, {
      fontSize: '28px',
      fill: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0);

    // Guardar e mostrar highscore
    const pontuacaoAnterior = localStorage.getItem('highscore') || 0;
    this.highscore = Math.max(this.pontuacao, pontuacaoAnterior);
    localStorage.setItem('highscore', this.highscore);

    this.add.text(largura / 2, 290, `🏆 Melhor Pontuação: ${this.highscore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(largura / 2, 320, 'Pressiona ESPAÇO ou clica no botão abaixo', {
      fontSize: '20px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0);

    // Botão voltar ao menu
    const botaoMenu = this.add.text(largura / 2, 400, '↩ VOLTAR AO MENU', {
      fontSize: '28px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    botaoMenu.on('pointerover', () => {
      botaoMenu.setStyle({ fill: '#ffffff' });
    });

    botaoMenu.on('pointerout', () => {
      botaoMenu.setStyle({ fill: '#ffff00' });
    });

    botaoMenu.on('pointerdown', () => {
      this.scene.start('CenaMenu');
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('CenaMenu');
    });
  }

  update() {
    const largura = this.scale.width;
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
