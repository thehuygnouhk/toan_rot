import Phaser from 'phaser';
import { BaseScene, PASTELS, textStyle } from '../BaseScene';
import { EventBus } from '../EventBus';
import { GAME_HEIGHT, GAME_WIDTH } from '../PhaserGame';
import { EV, type FeedbackMsg, type QuestionMsg } from '../protocol';

const BASKET_Y = 640;
/** Kẹo rơi chậm (px/giây) để bé kịp đọc số. */
const FALL_SPEED = 115;
const SPAWN_MS = 1150;

interface Candy {
  box: Phaser.GameObjects.Container;
  /** Thân kẹo (xoay nhẹ); số ở trên luôn đứng thẳng cho dễ đọc. */
  body: Phaser.GameObjects.Graphics;
  value: number;
  speed: number;
}

/** Hứng kẹo: kẹo mang số rơi xuống, bé kéo giỏ hứng viên kẹo có kết quả đúng. Không có thua cuộc. */
export class HungKeoScene extends BaseScene {
  static readonly KEY = 'HungKeo';
  private banner!: Phaser.GameObjects.Text;
  private basket!: Phaser.GameObjects.Container;
  private targetX = GAME_WIDTH / 2;
  private candies: Candy[] = [];
  private choices: number[] = [];
  private bag: number[] = [];
  private lastX = 0;
  private playing = false;

  constructor() {
    super(HungKeoScene.KEY);
  }

  create() {
    this.setupCommon();
    this.candies = [];
    this.bag = [];
    this.playing = false;
    this.add.text(90, 150, '☁️', { fontSize: '110px' }).setAlpha(0.7);
    this.add.text(1060, 190, '☁️', { fontSize: '80px' }).setAlpha(0.7);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.95).fillRoundedRect(330, 16, 620, 110, 44);
    panel.lineStyle(6, 0xff7eb6).strokeRoundedRect(330, 16, 620, 110, 44);
    this.banner = this.add.text(640, 70, '', textStyle(68)).setOrigin(0.5);

    const bunny = this.add.text(0, -92, '🐰', { fontSize: '72px', padding: { top: 12 } }).setOrigin(0.5);
    const g = this.add.graphics();
    g.fillStyle(0xffb3d1).lineStyle(6, 0x4a3b5c);
    g.beginPath();
    g.moveTo(-115, -45);
    g.lineTo(115, -45);
    g.lineTo(88, 52);
    g.lineTo(-88, 52);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.lineStyle(5, 0xffffff, 0.85);
    g.lineBetween(-104, -14, 104, -14);
    g.lineBetween(-95, 18, 95, 18);
    this.basket = this.add.container(GAME_WIDTH / 2, BASKET_Y, [bunny, g]).setDepth(20);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (this.targetX = p.x));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.targetX = p.x;
    });
    this.time.addEvent({ delay: SPAWN_MS, loop: true, callback: () => this.spawn() });

    this.listen<QuestionMsg>(EV.question, (q) => {
      this.banner.setText(q.prompt);
      this.choices = q.choices;
      this.bag = [];
      this.playing = true;
      this.spawn();
    });
    this.listen<FeedbackMsg>(EV.feedback, (f) => {
      this.toast(f.message, 330);
      if (f.correct) {
        this.playing = false;
        this.burst(this.basket.x, BASKET_Y - 60, 36);
        this.tweens.add({ targets: this.basket, y: BASKET_Y - 30, yoyo: true, duration: 160 });
        this.clearCandies();
      } else {
        this.tweens.add({ targets: this.basket, angle: { from: -8, to: 8 }, yoyo: true, repeat: 2, duration: 70, onComplete: () => this.basket.setAngle(0) });
      }
    });
    this.listen(EV.end, () => {
      this.playing = false;
      this.clearCandies();
      this.banner.setText('Hoàn thành! 🎉');
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 180, () => this.burst(Phaser.Math.Between(200, 1080), Phaser.Math.Between(200, 500), 30));
    });
    this.ready();
  }

  /** Thả một viên kẹo; mỗi vòng 4 viên đủ cả 4 lựa chọn nên đáp án đúng luôn xuất hiện. */
  private spawn() {
    if (!this.playing || this.candies.length >= 6) return;
    if (this.bag.length === 0) this.bag = Phaser.Utils.Array.Shuffle([...this.choices]);
    const value = this.bag.pop()!;
    let x: number;
    do x = Phaser.Math.Between(130, GAME_WIDTH - 130);
    while (Math.abs(x - this.lastX) < 220);
    this.lastX = x;
    const color = Phaser.Utils.Array.GetRandom(PASTELS);
    const g = this.add.graphics();
    g.fillStyle(color).lineStyle(5, 0x4a3b5c);
    g.fillTriangle(-58, 0, -88, -24, -88, 24).strokeTriangle(-58, 0, -88, -24, -88, 24);
    g.fillTriangle(58, 0, 88, -24, 88, 24).strokeTriangle(58, 0, 88, -24, 88, 24);
    g.fillCircle(0, 0, 60).strokeCircle(0, 0, 60);
    g.fillStyle(0xffffff, 0.45).fillCircle(-20, -22, 14);
    const label = this.add.text(0, 2, String(value), textStyle(value >= 100 ? 40 : 52, '#ffffff')).setOrigin(0.5).setStroke('#4a3b5c', 8);
    const box = this.add.container(x, 160, [g, label]).setDepth(10);
    this.candies.push({ box, body: g, value, speed: FALL_SPEED + Phaser.Math.Between(0, 35) });
  }

  private clearCandies() {
    for (const c of this.candies) this.tweens.add({ targets: c.box, alpha: 0, scale: 0.4, duration: 250, onComplete: () => c.box.destroy() });
    this.candies = [];
  }

  update(_time: number, delta: number) {
    const k = Math.min(1, delta / 70);
    this.basket.x = Phaser.Math.Clamp(this.basket.x + (this.targetX - this.basket.x) * k, 120, GAME_WIDTH - 120);
    for (const c of [...this.candies]) {
      c.box.y += (c.speed * delta) / 1000;
      c.body.angle += delta * 0.03;
      const caught = c.box.y >= BASKET_Y - 80 && c.box.y <= BASKET_Y - 20 && Math.abs(c.box.x - this.basket.x) < 125;
      if (caught && this.playing) {
        this.candies = this.candies.filter((x) => x !== c);
        c.box.destroy();
        EventBus.emit(EV.answer, { value: c.value });
      } else if (c.box.y > GAME_HEIGHT + 80) {
        this.candies = this.candies.filter((x) => x !== c);
        c.box.destroy();
      }
    }
  }
}
