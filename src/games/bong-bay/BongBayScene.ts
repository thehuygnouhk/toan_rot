import Phaser from 'phaser';
import { BaseScene, PASTELS, textStyle } from '../BaseScene';
import { EventBus } from '../EventBus';
import { GAME_HEIGHT } from '../PhaserGame';
import { EV, type FeedbackMsg, type QuestionMsg } from '../protocol';

/** Bóng bay lên chậm (px/giây); mỗi đợt có đủ 4 lựa chọn. */
const RISE_SPEED = 80;
const WAVE_MS = 3200;
const LANES = [210, 500, 790, 1080];

interface Balloon {
  box: Phaser.GameObjects.Container;
  value: number;
  speed: number;
  baseX: number;
  phase: number;
  off: boolean;
}

/** Bắn bóng bay: chạm vỡ quả bóng có kết quả đúng. Chạm nhầm thì bóng mờ đi, bé chọn quả khác. */
export class BongBayScene extends BaseScene {
  static readonly KEY = 'BongBay';
  private banner!: Phaser.GameObjects.Text;
  private balloons: Balloon[] = [];
  private choices: number[] = [];
  private playing = false;
  private tapped?: Balloon;

  constructor() {
    super(BongBayScene.KEY);
  }

  create() {
    this.setupCommon();
    this.balloons = [];
    this.playing = false;
    this.add.text(70, 470, '🌳', { fontSize: '130px' }).setAlpha(0.85);
    this.add.text(1100, 500, '🌷', { fontSize: '90px' }).setAlpha(0.85);

    const panel = this.add.graphics().setDepth(30);
    panel.fillStyle(0xffffff, 0.95).fillRoundedRect(330, 16, 620, 110, 44);
    panel.lineStyle(6, 0xb388ff).strokeRoundedRect(330, 16, 620, 110, 44);
    this.banner = this.add.text(640, 70, '', textStyle(68)).setOrigin(0.5).setDepth(31);

    this.time.addEvent({ delay: WAVE_MS, loop: true, callback: () => this.wave() });

    this.listen<QuestionMsg>(EV.question, (q) => {
      this.banner.setText(q.prompt);
      this.choices = q.choices;
      this.playing = true;
      this.wave();
    });
    this.listen<FeedbackMsg>(EV.feedback, (f) => {
      const b = this.tapped;
      this.toast(f.message, 330);
      if (!b) return;
      if (f.correct) {
        this.playing = false;
        this.burst(b.box.x, b.box.y, 40);
        this.balloons = this.balloons.filter((x) => x !== b);
        this.tweens.add({ targets: b.box, scale: 1.5, alpha: 0, duration: 180, onComplete: () => b.box.destroy() });
        // Các quả còn lại bay vút lên trời
        for (const o of this.balloons) o.speed = 600;
      } else {
        b.off = true;
        b.box.setAlpha(0.4);
        this.tweens.add({ targets: b.box, angle: { from: -10, to: 10 }, yoyo: true, repeat: 2, duration: 70, onComplete: () => b.box.setAngle(0) });
      }
    });
    this.listen(EV.end, () => {
      this.playing = false;
      for (const o of this.balloons) o.speed = 600;
      this.banner.setText('Hoàn thành! 🎉');
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 180, () => this.burst(Phaser.Math.Between(200, 1080), Phaser.Math.Between(200, 500), 30));
    });
    this.ready();
  }

  /** Một đợt 4 quả bóng mang đủ 4 lựa chọn, mỗi quả một làn. */
  private wave() {
    if (!this.playing || this.balloons.filter((b) => !b.off).length > 4) return;
    const values = Phaser.Utils.Array.Shuffle([...this.choices]);
    const lanes = Phaser.Utils.Array.Shuffle([...LANES]);
    values.forEach((value, i) => this.spawn(value, lanes[i] + Phaser.Math.Between(-40, 40), GAME_HEIGHT + 120 + i * 70));
  }

  private spawn(value: number, x: number, y: number) {
    const color = Phaser.Utils.Array.GetRandom(PASTELS);
    const g = this.add.graphics();
    g.lineStyle(3, 0x4a3b5c).lineBetween(0, 88, 6, 170);
    g.fillStyle(color).lineStyle(5, 0x4a3b5c);
    g.fillEllipse(0, 0, 150, 176).strokeEllipse(0, 0, 150, 176);
    g.fillTriangle(-12, 96, 12, 96, 0, 84).strokeTriangle(-12, 96, 12, 96, 0, 84);
    g.fillStyle(0xffffff, 0.45).fillEllipse(-34, -42, 30, 46);
    const label = this.add.text(0, 2, String(value), textStyle(value >= 100 ? 44 : 58, '#ffffff')).setOrigin(0.5).setStroke('#4a3b5c', 8);
    const box = this.add.container(x, y, [g, label]).setDepth(10).setSize(160, 190);
    const balloon: Balloon = { box, value, speed: RISE_SPEED + Phaser.Math.Between(0, 25), baseX: x, phase: Math.random() * Math.PI * 2, off: false };
    box.setInteractive({ useHandCursor: true });
    box.on('pointerdown', () => {
      if (!this.playing || balloon.off) return;
      this.tapped = balloon;
      EventBus.emit(EV.answer, { value });
    });
    this.balloons.push(balloon);
  }

  update(time: number, delta: number) {
    for (const b of [...this.balloons]) {
      b.box.y -= (b.speed * delta) / 1000;
      b.box.x = b.baseX + Math.sin(time / 600 + b.phase) * 18;
      if (b.box.y < -140) {
        this.balloons = this.balloons.filter((x) => x !== b);
        b.box.destroy();
      }
    }
  }
}
