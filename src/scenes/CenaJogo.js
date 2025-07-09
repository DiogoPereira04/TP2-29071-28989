import Jogador from '../classes/Jogador.js';
import Inimigo from '../classes/Inimigo.js';
import Moeda from '../classes/Moeda.js';

export default class CenaJogo extends Phaser.Scene {
  constructor() {
    super('CenaJogo');
    this.intervaloAumento = 15000;
    this.distanciaSpawn = 600;
    this.probabilidadeInimigo = 0.6;
    this.ultimoXInimigo = 800;
    this.ultimoXPlataforma = 0;

    this.velocidadeCamera = 0.75; 
  }

  preload() {
    this.load.image('bg1', 'src/assets/backgrounds/background1.png');
    this.load.image('bg3', 'src/assets/backgrounds/background3.png');
    this.load.image('bg4', 'src/assets/backgrounds/background4.png');
    this.load.image('coin', 'src/assets/ui/coin.png');

    this.load.spritesheet('player', 'src/assets/player/Base_with_Sword.png', {
      frameWidth: 51,
      frameHeight: 51
    });

    this.load.spritesheet('inimigos', 'src/assets/enemy/Enemy.png', {
      frameWidth: 35,
      frameHeight: 35
    });
  }

  create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.bgKeys = ['bg1', 'bg3', 'bg4'];
    this.larguraTela = largura;
    this.backgrounds = [];

    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(i * largura, 0, this.bgKeys[i % this.bgKeys.length])
        .setOrigin(0)
        .setScrollFactor(1)
        .setDepth(-10);

      bg.displayWidth = largura;
      bg.displayHeight = altura;
      this.backgrounds.push(bg);
    }

    // Animações
    this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }), frameRate: 6, repeat: 0 });
    this.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1, repeat: -1 });
    this.anims.create({ key: 'attack', frames: this.anims.generateFrameNumbers('player', { start: 24, end: 27 }), frameRate: 10, repeat: 0 });

    // Chão
    this.plataformas = this.physics.add.staticGroup();
    this.larguraChao = largura * 3;
    for (let x = 0; x < largura * 5; x += this.larguraChao) {
      this.plataformas.create(x + this.larguraChao / 2, altura - 10)
        .setDisplaySize(this.larguraChao, 20)
        .setVisible(false)
        .refreshBody();
    }

    // Jogador
    this.jogador = new Jogador(this, 100, altura - 100);
    this.jogador.onMorte = () => this.scene.restart();

    // UI
    this.textoVidas = this.add.text(16, 16, `Vidas: ${this.jogador.vidas}`, { fontSize: '20px', fill: '#ffffff' }).setScrollFactor(0);
    this.moedasRecolhidas = 0;
    this.textoMoedas = this.add.text(this.scale.width - 150, 16, 'Moedas: 0', { fontSize: '20px', fill: '#ffff00' }).setScrollFactor(0).setOrigin(0, 0);
    this.pontuacao = 0;
    this.textoPontuacao = this.add.text(this.scale.width / 2, 16, 'Pontos: 0', { fontSize: '20px', fill: '#00ffff' }).setScrollFactor(0).setOrigin(0.5, 0);

    // Grupos
    this.hitboxes = this.physics.add.group();
    this.inimigos = this.physics.add.group();
    this.moedas = this.add.group();
    this.plataformasVisuais = [];

    // Colisões
    this.physics.add.collider(this.jogador, this.plataformas);
    this.physics.add.collider(this.inimigos, this.plataformas);

    this.physics.add.overlap(this.jogador, this.inimigos, (jogador, inimigo) => {
      if (jogador.podeDarDano()) {
        inimigo.destroy();
        this.pontuacao += 10;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
      } else {
        jogador.perderVida();
        this.textoVidas.setText(`Vidas: ${jogador.vidas}`);
      }
    }, null, this);

    this.physics.add.overlap(this.hitboxes, this.inimigos, (hitbox, inimigo) => {
      inimigo.destroy();
      hitbox.destroy();
      this.pontuacao += 10;
      this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
    });

    this.physics.add.overlap(this.jogador, this.moedas, (jogador, moeda) => {
      moeda.destroy();
      this.moedasRecolhidas++;
      this.textoMoedas.setText(`Moedas: ${this.moedasRecolhidas}`);
    });

    // Câmera fixa
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, altura);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, altura);

    // Aumento de velocidade
    this.time.addEvent({
      delay: this.intervaloAumento,
      loop: true,
      callback: () => {
        this.jogador.velocidade += 42;
        this.velocidadeCamera += 0.35;
        console.log('Velocidade da câmara agora é:', this.velocidadeCamera);
      }
    });

    // Tempo vivo = pontos
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.pontuacao += 1;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
      }
    });

    // Spawn infinito de inimigos
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const cameraX = this.cameras.main.scrollX;
        const limiteX = cameraX + this.scale.width * 2;

        while (this.ultimoXInimigo < limiteX) {
          if (Math.random() < this.probabilidadeInimigo) {
            const y = altura - 100;
            const inimigo = new Inimigo(this, this.ultimoXInimigo, y);
            this.inimigos.add(inimigo);
          }
          this.ultimoXInimigo += this.distanciaSpawn;
        }
      }
    });
  }

  update() {
    this.jogador.update();
    this.inimigos.children.iterate(i => i?.update());

    // Câmera anda sozinha
    this.cameras.main.scrollX += this.velocidadeCamera;

    const cameraX = this.cameras.main.scrollX;
    const largura = this.larguraTela;
    const limiteX = cameraX + this.scale.width * 2;

    // Fundo infinito
    this.backgrounds.forEach(bg => {
      if (bg.x + largura < cameraX) {
        bg.x += largura * this.backgrounds.length;
        const nextIndex = this.bgKeys.indexOf(bg.texture.key);
        const newKey = this.bgKeys[(nextIndex + 1) % this.bgKeys.length];
        bg.setTexture(newKey);
      }
    });

    // Gerar plataformas
    while (this.ultimoXPlataforma < limiteX) {
      const x = this.ultimoXPlataforma + Phaser.Math.Between(250, 350);
      const y = Phaser.Math.Between(this.scale.height * 0.6, this.scale.height * 0.8);

      const plataforma = this.add.rectangle(x, y, 150, 20, 0x5b3a29);
      this.physics.add.existing(plataforma, true);
      this.plataformasVisuais.push(plataforma);
      this.physics.add.collider(this.jogador, plataforma);
      this.physics.add.collider(this.inimigos, plataforma);

      if (Math.random() < 0.3) {
        const inimigo = new Inimigo(this, x, y - 25);
        this.inimigos.add(inimigo);
      } else if (Math.random() < 0.5) {
        const moeda = new Moeda(this, x, y - 30);
        this.moedas.add(moeda);
      }

      this.ultimoXPlataforma = x;
    }

    // Limpeza
    const limiteRemocao = cameraX - 1000;
    this.plataformasVisuais = this.plataformasVisuais.filter(p => {
      if (p.x < limiteRemocao) {
        p.destroy();
        return false;
      }
      return true;
    });

    this.moedas.getChildren().forEach(m => {
      if (m.x < limiteRemocao) m.destroy();
    });

    this.inimigos.getChildren().forEach(i => {
      if (i.x < limiteRemocao) i.destroy();
    });

    if (this.jogador.x < this.cameras.main.scrollX - 20) {
      this.jogador.vidas = 0;
      this.jogador.onMorte();
    }
  }
}