import Jogador from '../classes/Jogador.js';
import Inimigo from '../classes/Inimigo.js';
import Moeda from '../classes/Moeda.js';

export default class CenaJogo extends Phaser.Scene {
  constructor() {
    super('CenaJogo');
  }

  preload() {
    this.load.image('bg1', 'src/assets/backgrounds/background1.png');
    this.load.image('bg3', 'src/assets/backgrounds/background3.png');
    this.load.image('bg4', 'src/assets/backgrounds/background4.png');
    this.load.image('coin', 'src/assets/ui/coin.png');
    this.load.image('sword', 'src/assets/projectiles/sword.png');

    this.load.spritesheet('player', 'src/assets/player/Base_with_Sword.png', {
      frameWidth: 51,
      frameHeight: 51
    });

    this.load.spritesheet('inimigos', 'src/assets/enemy/Enemy.png', {
      frameWidth: 35,
      frameHeight: 35
    });

    this.load.audio('bgm', 'src/assets/audio/bgm.mp3');
    this.load.audio('coinSound', 'src/assets/audio/coin.wav');
    this.load.audio('hitSound', 'src/assets/audio/hit.wav');
  }

  create() {
    this.intervaloAumento = 15000;
    this.distanciaSpawn = 600;
    this.probabilidadeInimigo = 0.6;
    this.ultimoXInimigo = 800;
    this.ultimoXPlataforma = 0;
    this.velocidadeCamera = 0.75;
    this.podeAtirarEspada = true;
    this.cooldownTotal = 3000;
    this.cooldownAtual = 0;
    this.jogoPausado = false;

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

    this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }), frameRate: 6, repeat: 0 });
    this.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1, repeat: -1 });
    this.anims.create({ key: 'attack', frames: this.anims.generateFrameNumbers('player', { start: 24, end: 27 }), frameRate: 10, repeat: 0 });

    this.somMoeda = this.sound.add('coinSound');
    this.somDano = this.sound.add('hitSound');
    this.somMusica = this.sound.add('bgm', { loop: true, volume: 0.4 });
    this.somMusica.play();

    this.plataformas = this.physics.add.staticGroup();
    this.larguraChao = largura * 3;
    for (let x = 0; x < largura * 5; x += this.larguraChao) {
      this.plataformas.create(x + this.larguraChao / 2, altura - 10)
        .setDisplaySize(this.larguraChao, 20)
        .setVisible(false)
        .refreshBody();
    }

    const posicaoInicialX = this.cameras.main.scrollX + this.scale.width / 2;
    this.jogador = new Jogador(this, posicaoInicialX, altura - 100);
    this.jogador.vidas = 3;
    this.jogador.onMorte = () => {
      this.somMusica.stop();
      this.scene.start('CenaFim', {
        moedas: this.moedasRecolhidas,
        pontuacao: this.pontuacao
      });
    };

    this.textoVidas = this.add.text(16, 16, `Vidas: ${this.jogador.vidas}`, { fontSize: '20px', fill: '#ffffff' }).setScrollFactor(0);
    this.moedasRecolhidas = 0;
    this.textoMoedas = this.add.text(this.scale.width - 150, 16, 'Moedas: 0', { fontSize: '20px', fill: '#ffff00' }).setScrollFactor(0).setOrigin(0, 0);
    this.pontuacao = 0;
    this.textoPontuacao = this.add.text(this.scale.width / 2, 16, 'Pontos: 0', { fontSize: '20px', fill: '#00ffff' }).setScrollFactor(0).setOrigin(0.5, 0);

    this.cooldownTexto = this.add.text(this.scale.width - 220, this.scale.height - 60, 'Cooldown: PRONTO', {
      fontSize: '22px',
      fill: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
      backgroundColor: '#222222'
    }).setScrollFactor(0).setPadding(6);

    this.hitboxes = this.physics.add.group();
    this.espadas = this.physics.add.group();
    this.inimigos = this.physics.add.group();
    this.moedas = this.add.group();
    this.plataformasVisuais = [];

    this.physics.add.collider(this.jogador, this.plataformas);
    this.physics.add.collider(this.inimigos, this.plataformas);

    this.physics.add.overlap(this.jogador, this.inimigos, (jogador, inimigo) => {
      if (jogador.podeDarDano()) {
        inimigo.destroy();
        this.pontuacao += 10;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
      } else {
        jogador.perderVida();
        this.textoVidas.setText(`Vidas: ${this.jogador.vidas}`);
        if (jogador.vidas <= 0) jogador.onMorte();
      }
    });

    this.physics.add.overlap(this.hitboxes, this.inimigos, (hitbox, inimigo) => {
      inimigo.destroy();
      hitbox.destroy();
      this.pontuacao += 10;
      this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
    });

    this.physics.add.overlap(this.espadas, this.inimigos, (espada, inimigo) => {
      espada.destroy();
      inimigo.destroy();
      this.pontuacao += 10;
      this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
      this.somDano.play();
    });

    this.physics.add.overlap(this.jogador, this.moedas, (jogador, moeda) => {
      moeda.destroy();
      this.moedasRecolhidas++;
      this.textoMoedas.setText(`Moedas: ${this.moedasRecolhidas}`);
      this.somMoeda.play();
    });

    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, altura);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, altura);

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.podeAtirarEspada) {
        this.lancarEspada();
        this.podeAtirarEspada = false;
        this.cooldownAtual = 0;
        this.time.delayedCall(this.cooldownTotal, () => {
          this.podeAtirarEspada = true;
        });
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.jogoPausado = !this.jogoPausado;
      this.physics.world.isPaused = this.jogoPausado;

      if (this.eventoPontuacao) {
        this.eventoPontuacao.paused = this.jogoPausado;
      }

      if (this.jogoPausado) {
        this.overlayPausa = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
          .setOrigin(0)
          .setScrollFactor(0);

        this.textoPausa = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'PAUSADO', {
          fontSize: '48px',
          fill: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0);

        this.botaoContinuar = this.add.text(this.scale.width / 2, this.scale.height / 2, '▶ Continuar', {
          fontSize: '32px',
          fill: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0);

        this.botaoMenu = this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, '↩ Menu Principal', {
          fontSize: '28px',
          fill: '#ffff00',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0);

        const somAtivo = this.somMusica.volume > 0;
        this.botaoSom = this.add.text(this.scale.width / 2, this.scale.height / 2 + 120, somAtivo ? '🔊 Som: Ligado' : '🔇 Som: Desligado', {
          fontSize: '24px',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0);

        this.botaoSom.on('pointerdown', () => {
          if (this.somMusica.volume > 0) {
            this.somMusica.setVolume(0);
            this.botaoSom.setText('🔇 Som: Desligado');
          } else {
            this.somMusica.setVolume(0.4);
            this.botaoSom.setText('🔊 Som: Ligado');
          }
        });

        this.botaoContinuar.on('pointerdown', () => {
          this.retirarPausa();
        });

        this.botaoMenu.on('pointerdown', () => {
          this.somMusica.stop();
          this.scene.start('CenaMenu');
        });
      } else {
        this.retirarPausa();
      }
    });
    
    this.time.addEvent({
      delay: this.intervaloAumento,
      loop: true,
      callback: () => {
        this.jogador.velocidade += 42;
        this.velocidadeCamera += 0.35;
      }
    });

    this.eventoPontuacao = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.pontuacao += 1;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
      }
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const cameraX = this.cameras.main.scrollX;
        const limiteX = cameraX + this.scale.width * 2;

        while (this.ultimoXInimigo < limiteX) {
          const chance = Math.random();
          if (chance < this.probabilidadeInimigo) {
            const y = altura - 100;
            const inimigo = new Inimigo(this, this.ultimoXInimigo, y);
            this.inimigos.add(inimigo);
          } else if (chance < this.probabilidadeInimigo + 0.18) {
            const y = altura - 100;
            const moeda = new Moeda(this, this.ultimoXInimigo, y);
            this.moedas.add(moeda);
          }
          this.ultimoXInimigo += this.distanciaSpawn;
        }
      }
    });
  }

  update(time, delta) {
    if (this.jogoPausado) return;

    this.jogador.update();
    this.inimigos.children.iterate(i => i?.update());

    this.cameras.main.scrollX += this.velocidadeCamera;

    const cameraX = this.cameras.main.scrollX;
    const largura = this.larguraTela;
    const limiteX = cameraX + this.scale.width * 2;

    this.backgrounds.forEach(bg => {
      if (bg.x + largura < cameraX) {
        bg.x += largura * this.backgrounds.length;
        const nextIndex = this.bgKeys.indexOf(bg.texture.key);
        const newKey = this.bgKeys[(nextIndex + 1) % this.bgKeys.length];
        bg.setTexture(newKey);
      }
    });

    while (this.ultimoXPlataforma < limiteX) {
      const x = this.ultimoXPlataforma + Phaser.Math.Between(250, 350);
      const y = Phaser.Math.Between(this.scale.height * 0.7, this.scale.height * 0.85);

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

    this.espadas.getChildren().forEach(e => {
      if (e.x > cameraX + this.scale.width + 100) {
        e.destroy();
      }
      if (e.update) e.update();
    });

    if (!this.jogoPausado && !this.podeAtirarEspada) {
      this.cooldownAtual += delta;
      const progresso = Phaser.Math.Clamp(this.cooldownAtual / this.cooldownTotal, 0, 1);
      const segundosRestantes = Math.ceil((this.cooldownTotal - this.cooldownAtual) / 1000);
      this.cooldownTexto.setText(`Cooldown: ${segundosRestantes}s`);
    } else if (this.podeAtirarEspada) {
      this.cooldownTexto.setText(`Cooldown: PRONTO`);
    }

    if (this.jogador.x < this.cameras.main.scrollX - 20) {
      this.jogador.vidas = 0;
      this.jogador.onMorte();
    }
  }

  lancarEspada() {
    const espada = this.espadas.create(this.jogador.x + 30, this.jogador.y, 'sword');
    espada.setVelocityX(500);
    espada.body.allowGravity = false;
    espada.setDepth(10);
    espada.displayWidth = 28;
    espada.displayHeight = 12;
    espada.update = function () {
      this.rotation += 0.2;
    };
  }

  retirarPausa() {
    this.jogoPausado = false;
    this.physics.world.isPaused = false;
    if (this.eventoPontuacao) this.eventoPontuacao.paused = false;
    this.overlayPausa?.destroy();
    this.textoPausa?.destroy();
    this.botaoContinuar?.destroy();
    this.botaoMenu?.destroy();
    this.botaoSom?.destroy();
  }
}
