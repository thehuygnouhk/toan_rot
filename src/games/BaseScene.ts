import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { EV } from './protocol';

export const INK = '#4a3b5c';
export const PASTELS = [0xff7eb6, 0xb388ff, 0x7fd6c2, 0xffad5a, 0x9ad0ff, 0xffd84d];
const FONT = '"Baloo 2", Nunito, sans-serif';

/** Kiểu chữ tiếng Việt có chừa khoảng trên đầu để dấu (ở, ữ…) không bị cắt. */
export function textStyle(size: number, color = INK): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT, fontSize: `${size}px`, fontStyle: '800', color, align: 'center', padding: { top: Math.round(size * 0.25), bottom: 4 } };
}

/**
 * Scene cơ sở: tạo texture hạt lấp lánh, gắn/gỡ sự kiện EventBus theo vòng đời scene,
 * nghe lệnh tạm dừng và báo "sẵn sàng" cho React.
 */
export abstract class BaseScene extends Phaser.Scene {
  private handlers: [string, (...args: never[]) => void][] = [];
  protected sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private toastText?: Phaser.GameObjects.Text;

  /** Gắn sự kiện EventBus, tự gỡ khi scene tắt. */
  protected listen<T>(event: string, fn: (payload: T) => void) {
    EventBus.on(event, fn, this);
    this.handlers.push([event, fn as (...args: never[]) => void]);
  }

  protected setupCommon() {
    if (!this.textures.exists('spark')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture('spark', 16, 16);
      g.destroy();
    }
    this.sparks = this.add.particles(0, 0, 'spark', {
      speed: { min: 150, max: 420 },
      lifespan: 700,
      scale: { start: 1.1, end: 0 },
      tint: PASTELS,
      emitting: false,
    });
    this.sparks.setDepth(100);
    this.listen<boolean>(EV.pause, (paused) => (paused ? this.scene.pause() : this.scene.resume()));
    const cleanup = () => {
      for (const [event, fn] of this.handlers) EventBus.off(event, fn, this);
      this.handlers = [];
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  protected burst(x: number, y: number, count = 28) {
    this.sparks.explode(count, x, y);
  }

  /** Lời nhắn ngắn giữa màn hình, tự mờ dần. */
  protected toast(message: string, y = 400) {
    this.toastText?.destroy();
    const t = this.add.text(640, y, message, textStyle(52)).setOrigin(0.5).setDepth(90).setStroke('#ffffff', 10);
    this.toastText = t;
    this.tweens.add({ targets: t, alpha: { from: 1, to: 0 }, y: y - 40, delay: 900, duration: 500, onComplete: () => t.destroy() });
  }

  /** Báo React đã sẵn sàng — gọi ở cuối create(). */
  protected ready() {
    EventBus.emit(EV.ready);
  }
}
