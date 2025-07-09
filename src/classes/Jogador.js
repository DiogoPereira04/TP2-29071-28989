export default class Jogador extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0);
    this.setCollideWorldBounds(true);

    this.body.setSize(30, 42);
    this.body.setOffset(9, 6);

    this.teclas = scene.input.keyboard.createCursorKeys();
    this.teclaAtaque = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.vidas = 2;
    this.invulneravel = false;

    this.onMorte = () => {};
    
    this.atacando = false;
    this.podeAtacar = true;

    this.velocidade = 160;
  }

  perderVida() {
    if (this.invulneravel) return;

    this.vidas--;
    console.log(`Vidas restantes: ${this.vidas}`);

    if (this.vidas <= 0) {
      this.onMorte();
    } else {
      this.invulneravel = true;
      this.setTint(0xff0000);

      this.scene.time.delayedCall(1000, () => {
        this.clearTint();
        this.invulneravel = false;
      });
    }
  }

  podeDarDano() {
    return this.atacando;
  }

  atacar() {
    if (!this.podeAtacar || this.atacando) return;

    this.atacando = true;
    this.podeAtacar = false;

    this.anims.play('attack', true);

    this.scene.time.delayedCall(400, () => {
      this.atacando = false;
    });

    this.scene.time.delayedCall(800, () => {
      this.podeAtacar = true;
    });
  }

  update() {
    const onGround = this.body.blocked.down;

    if (this.teclaAtaque.isDown) {
      this.atacar();
    }

    if (!this.atacando) {
      if (this.teclas.left.isDown) {
        this.setVelocityX(-this.velocidade);
        this.anims.play('run', true);
        this.setFlipX(true);
      } else if (this.teclas.right.isDown) {
        this.setVelocityX(this.velocidade);
        this.anims.play('run', true);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
        if (onGround) this.anims.play('idle', true);
      }

      if (this.teclas.up.isDown && onGround) {
        this.setVelocityY(-550);
        this.anims.play('jump', true);
      }

      if (!onGround && this.body.velocity.y > 0) {
        this.anims.play('jump', true);
      }
    } else {
      this.setVelocityX(0); 
    }
  }
}
