export default class Inimigo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'inimigos', 1);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setImmovable(true);
    this.body.allowGravity = true;

    this.velocidade = 50;
    this.direcao = 1;
    this.posicaoInicialX = x;
    this.raioDePatrulha = 100;

    this.setVelocityX(this.velocidade * this.direcao);

    this.scene = scene;
  }

  update() {
    const deslocamento = this.x - this.posicaoInicialX;

    if (deslocamento > this.raioDePatrulha) {
      this.direcao = -1;
      this.setVelocityX(this.velocidade * this.direcao);
      this.setFlipX(true);
    } else if (deslocamento < -this.raioDePatrulha) {
      this.direcao = 1;
      this.setVelocityX(this.velocidade * this.direcao);
      this.setFlipX(false);
    }
  }
}
