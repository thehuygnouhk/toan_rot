import Phaser from 'phaser';
import { useEffect, useRef } from 'react';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/**
 * Khung chạy một scene Phaser bên trong React. Tạo game khi mount (sau khi font tiếng Việt đã tải),
 * huỷ game khi unmount để bé ra vào nhiều lần không rò bộ nhớ.
 */
export function PhaserGame({ sceneKey, scene }: { sceneKey: string; scene: typeof Phaser.Scene }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: Phaser.Game | undefined;
    let cancelled = false;
    const fonts = Promise.all([document.fonts.load('800 48px "Baloo 2"', 'Ôn tập'), document.fonts.load('700 32px Nunito', 'Ôn tập')]).catch(() => undefined);
    void fonts.then(() => {
      if (cancelled || !ref.current) return;
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: ref.current,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        transparent: true,
        banner: false,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        input: { activePointers: 2 },
      });
      game.scene.add(sceneKey, scene, true);
    });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [sceneKey, scene]);
  // Khung 16:9 vừa cả chiều rộng lẫn chiều cao màn hình (máy tính bảng xoay ngang, laptop thấp) để không phải cuộn khi chơi
  return (
    <div
      ref={ref}
      className="mx-auto aspect-video rounded-3xl overflow-hidden bg-linear-to-b from-info/40 to-base-200 touch-none select-none"
      style={{ width: 'min(100%, calc((100dvh - 16rem) * 16 / 9))' }}
    />
  );
}
