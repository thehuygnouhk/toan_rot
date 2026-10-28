import Phaser from 'phaser';
import type { CardFace } from '../../engine/questions/games';
import { BaseScene, textStyle } from '../BaseScene';
import { EventBus } from '../EventBus';
import { EV, type DeckMsg } from '../protocol';

const COLS = 4;
const W = 240;
const H = 160;
const GAP = 26;

interface Card {
  id: number;
  box: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Container;
  front: Phaser.GameObjects.Container;
  frontPanel: Phaser.GameObjects.Graphics;
  open: boolean;
  done: boolean;
}

/** Lật thẻ ghép đôi: lật 2 thẻ, React cho biết có phải một cặp không. */
export class LatTheScene extends BaseScene {
  static readonly KEY = 'LatThe';
  private banner!: Phaser.GameObjects.Text;
  private cards: Card[] = [];
  private first?: Card;
  private busy = false;

  constructor() {
    super(LatTheScene.KEY);
  }

  create() {
    this.setupCommon();
    this.cards = [];
    this.first = undefined;
    this.busy = false;
    this.banner = this.add.text(640, 52, '', textStyle(48)).setOrigin(0.5);
    this.listen<DeckMsg>(EV.deck, (deck) => this.deal(deck));
    this.listen<{ a: number; b: number; match: boolean }>(EV.pairResult, (r) => this.onResult(r));
    this.listen(EV.end, () => {
      this.banner.setText('Ghép xong hết rồi! 🎉');
      for (let i = 0; i < 6; i++) this.time.delayedCall(i * 160, () => this.burst(Phaser.Math.Between(200, 1080), Phaser.Math.Between(180, 600), 30));
    });
    this.ready();
  }

  private deal({ title, cards }: DeckMsg) {
    this.banner.setText(title);
    const rows = Math.ceil(cards.length / COLS);
    const x0 = 640 - ((COLS - 1) * (W + GAP)) / 2;
    const y0 = 120 + H / 2 + (600 - rows * H - (rows - 1) * GAP) / 2;
    cards.forEach(({ id, face }, i) => {
      const x = x0 + (i % COLS) * (W + GAP);
      const y = y0 + Math.floor(i / COLS) * (H + GAP);
      const back = this.add.container(0, 0, [this.panel(0xffb3d1, 0xff7eb6), this.add.text(0, 4, '🐰', { fontSize: '64px', padding: { top: 10 } }).setOrigin(0.5)]);
      const frontPanel = this.panel(0xffffff, 0xb388ff);
      const front = this.add.container(0, 0, [frontPanel, this.faceArt(face)]).setVisible(false);
      const box = this.add.container(x, y, [back, front]).setSize(W, H);
      const card: Card = { id, box, back, front, frontPanel, open: false, done: false };
      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.tap(card));
      box.setScale(0);
      this.tweens.add({ targets: box, scale: 1, delay: i * 40, duration: 220, ease: 'Back.easeOut' });
      this.cards.push(card);
    });
  }

  private panel(fill: number, stroke: number, g = this.add.graphics()) {
    return g.clear().fillStyle(fill).fillRoundedRect(-W / 2, -H / 2, W, H, 26).lineStyle(6, stroke).strokeRoundedRect(-W / 2, -H / 2, W, H, 26);
  }

  private faceArt(face: CardFace): Phaser.GameObjects.GameObject {
    if ('text' in face) return this.add.text(0, 4, face.text, textStyle(face.text.length > 8 ? 34 : 50)).setOrigin(0.5);
    // Mặt đồng hồ nhỏ: vạch giờ, số 12 – 3 – 6 – 9, kim ngắn chỉ giờ, kim dài chỉ phút
    const { hour, minute } = face.clock;
    const r = 66;
    const g = this.add.graphics();
    g.fillStyle(0xfff0f7).fillCircle(0, 0, r).lineStyle(5, 0x4a3b5c).strokeCircle(0, 0, r);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      g.lineStyle(3, 0x4a3b5c).lineBetween(Math.sin(a) * (r - 10), -Math.cos(a) * (r - 10), Math.sin(a) * (r - 3), -Math.cos(a) * (r - 3));
    }
    const hand = (angle: number, len: number, width: number) => g.lineStyle(width, 0x4a3b5c).lineBetween(0, 0, Math.sin(angle) * len, -Math.cos(angle) * len);
    hand((((hour % 12) + minute / 60) * Math.PI) / 6, 30, 8);
    hand((minute * Math.PI) / 30, 48, 5);
    g.fillStyle(0xff7eb6).fillCircle(0, 0, 6);
    const nums = [
      ['12', 0, -r + 24],
      ['3', r - 22, 2],
      ['6', 0, r - 20],
      ['9', -r + 22, 2],
    ].map(([t, x, y]) => this.add.text(x as number, y as number, t as string, textStyle(18)).setOrigin(0.5));
    return this.add.container(0, 0, [g, ...nums]);
  }

  private flip(card: Card, open: boolean) {
    card.open = open;
    this.tweens.add({
      targets: card.box,
      scaleX: 0,
      duration: 110,
      yoyo: true,
      onYoyo: () => {
        card.front.setVisible(open);
        card.back.setVisible(!open);
      },
    });
  }

  private tap(card: Card) {
    if (this.busy || card.open || card.done) return;
    this.flip(card, true);
    if (!this.first) {
      this.first = card;
      return;
    }
    this.busy = true;
    const a = this.first;
    this.first = undefined;
    // Chờ thẻ thứ hai lật xong rồi mới hỏi React
    this.time.delayedCall(260, () => EventBus.emit(EV.pick, { a: a.id, b: card.id }));
  }

  private onResult({ a, b, match }: { a: number; b: number; match: boolean }) {
    const pair = this.cards.filter((c) => c.id === a || c.id === b);
    if (match) {
      for (const c of pair) {
        c.done = true;
        this.panel(0xeafff8, 0x22a06b, c.frontPanel);
        c.front.add(this.add.text(W / 2 - 24, -H / 2 + 22, '✔', textStyle(30, '#22a06b')).setOrigin(0.5));
        this.burst(c.box.x, c.box.y, 22);
        this.tweens.add({ targets: c.box, scale: 1.08, yoyo: true, duration: 140 });
      }
      this.busy = false;
      return;
    }
    this.time.delayedCall(800, () => {
      for (const c of pair) this.flip(c, false);
      this.busy = false;
    });
  }
}
