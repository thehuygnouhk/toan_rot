import Phaser from 'phaser';
import { BaseScene, textStyle } from '../BaseScene';
import { EventBus } from '../EventBus';
import { EV, type BakeryMsg, type FeedbackMsg } from '../protocol';

const BOX_W = 250;
const BOX_H = 230;
const BOX_Y = 530;
const SLOT = 64;

interface Box {
  x: number;
  label: Phaser.GameObjects.Text;
  frame: Phaser.GameObjects.Graphics;
}

interface Cake {
  obj: Phaser.GameObjects.Text;
  homeX: number;
  homeY: number;
  box: number;
}

/** Tiệm bánh: kéo bánh trên bàn vào các hộp sao cho mỗi hộp bằng nhau, rồi bấm Xong. React chấm. */
export class TiemBanhScene extends BaseScene {
  static readonly KEY = 'TiemBanh';
  private banner!: Phaser.GameObjects.Text;
  private boxes: Box[] = [];
  private cakes: Cake[] = [];
  private round: Phaser.GameObjects.GameObject[] = [];
  private locked = true;

  constructor() {
    super(TiemBanhScene.KEY);
  }

  create() {
    this.setupCommon();
    this.boxes = [];
    this.cakes = [];
    this.round = [];
    this.locked = true;
    this.banner = this.add.text(560, 50, '', textStyle(46)).setOrigin(0.5);
    this.add.graphics().fillStyle(0xf3d29b).fillRoundedRect(150, 120, 820, 200, 30).lineStyle(5, 0x9a6b3c).strokeRoundedRect(150, 120, 820, 200, 30);

    const done = this.add.container(1140, 220).setSize(220, 110);
    done.add([
      this.add.graphics().fillStyle(0x7fd6c2).fillRoundedRect(-110, -55, 220, 110, 40).lineStyle(6, 0x4a3b5c).strokeRoundedRect(-110, -55, 220, 110, 40),
      this.add.text(0, 4, 'Xong ✓', textStyle(46)).setOrigin(0.5),
    ]);
    done.setInteractive({ useHandCursor: true });
    done.on('pointerdown', () => {
      if (this.locked) return;
      this.tweens.add({ targets: done, scale: 0.92, yoyo: true, duration: 90 });
      EventBus.emit(EV.submit, { counts: this.boxes.map((_, i) => this.cakes.filter((c) => c.box === i).length) });
    });

    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text, x: number, y: number) => obj.setPosition(x, y));
    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text) => obj.setDepth(50).setScale(1.2));
    this.input.on('dragend', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text) => this.drop(obj));

    this.listen<BakeryMsg>(EV.bakery, (r) => this.setup(r));
    this.listen<FeedbackMsg>(EV.feedback, (f) => {
      this.toast(f.message, 366);
      if (f.correct) {
        this.locked = true;
        for (const b of this.boxes) this.burst(b.x, BOX_Y, 24);
      }
    });
    this.listen(EV.end, () => {
      this.locked = true;
      this.banner.setText('Tiệm bánh đóng cửa rồi! 🎉');
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 180, () => this.burst(Phaser.Math.Between(200, 1080), Phaser.Math.Between(200, 500), 30));
    });
    this.ready();
  }

  private setup({ prompt, total, boxes }: BakeryMsg) {
    for (const o of this.round) o.destroy();
    for (const c of this.cakes) c.obj.destroy();
    this.round = [];
    this.cakes = [];
    this.boxes = [];
    this.banner.setText(prompt);
    const step = BOX_W + 30;
    const x0 = 640 - ((boxes - 1) * step) / 2;
    for (let i = 0; i < boxes; i++) {
      const x = x0 + i * step;
      const frame = this.add.graphics();
      this.paintBox(frame, x, false);
      const label = this.add.text(x, BOX_Y + BOX_H / 2 + 26, '0 chiếc', textStyle(30)).setOrigin(0.5);
      this.round.push(frame, label);
      this.boxes.push({ x, label, frame });
    }
    // Bánh xếp trên bàn, tối đa 10 chiếc một hàng
    const perRow = Math.min(10, total);
    for (let i = 0; i < total; i++) {
      const homeX = 560 - ((perRow - 1) * 76) / 2 + (i % perRow) * 76;
      const homeY = 175 + Math.floor(i / perRow) * 90;
      const obj = this.add.text(homeX, homeY, '🧁', { fontSize: '62px', padding: { top: 10 } }).setOrigin(0.5).setDepth(10);
      obj.setInteractive({ draggable: true, useHandCursor: true });
      this.cakes.push({ obj, homeX, homeY, box: -1 });
    }
    this.locked = false;
  }

  private paintBox(g: Phaser.GameObjects.Graphics, x: number, hot: boolean) {
    g.clear();
    g.fillStyle(hot ? 0xffc2dc : 0xffe9f3).fillRoundedRect(x - BOX_W / 2, BOX_Y - BOX_H / 2, BOX_W, BOX_H, 28);
    g.lineStyle(6, 0xf0569a).strokeRoundedRect(x - BOX_W / 2, BOX_Y - BOX_H / 2, BOX_W, BOX_H, 28);
  }

  private drop(obj: Phaser.GameObjects.Text) {
    const cake = this.cakes.find((c) => c.obj === obj);
    if (!cake) return;
    obj.setScale(1).setDepth(10);
    const target = this.boxes.findIndex((b) => Math.abs(obj.x - b.x) < BOX_W / 2 && Math.abs(obj.y - BOX_Y) < BOX_H / 2 + 20);
    cake.box = this.locked ? cake.box : target;
    this.layout();
  }

  /** Xếp lại bánh: bánh trong hộp vào các ô, bánh còn lại về chỗ trên bàn. */
  private layout() {
    this.boxes.forEach((b, i) => {
      const inside = this.cakes.filter((c) => c.box === i);
      const rows = Math.min(3, Math.ceil(inside.length / 3));
      inside.forEach((c, k) => {
        const col = k % 3;
        const row = Math.floor(k / 3) % 3;
        this.tweens.add({ targets: c.obj, x: b.x + (col - 1) * SLOT, y: BOX_Y + (row - (rows - 1) / 2) * SLOT, duration: 140 });
      });
      b.label.setText(`${inside.length} chiếc`);
      this.paintBox(b.frame, b.x, inside.length > 0);
    });
    for (const c of this.cakes.filter((x) => x.box === -1)) this.tweens.add({ targets: c.obj, x: c.homeX, y: c.homeY, duration: 160 });
  }
}
