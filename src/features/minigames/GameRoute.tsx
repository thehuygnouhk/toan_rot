import { lazy, Suspense, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BangVe } from './BangVe';
import { GAME_BY_ID, type GameId } from './catalog';
import { ChiaTungBuoc } from './ChiaTungBuoc';

// Trò Phaser kéo theo thư viện Phaser (~350 KB nén) nên chỉ tải khi bé vào chơi.
const MiniGamePlayPage = lazy(() => import('./MiniGamePlayPage'));

/** Mở đúng trò theo đường dẫn /tro-choi/:gameId. */
export function GameRoute() {
  const { gameId = '' } = useParams();
  const [round, setRound] = useState(0);
  const game = GAME_BY_ID.get(gameId as GameId);
  const again = () => setRound((r) => r + 1);
  if (!game) {
    return (
      <p className="text-center text-2xl">
        Không tìm thấy trò chơi. <Link to="/tro-choi" className="link">Về khu trò chơi</Link>
      </p>
    );
  }
  if (game.id === 'chia-tung-buoc') return <ChiaTungBuoc key={round} onAgain={again} />;
  if (game.id === 'bang-ve') return <BangVe key={round} onAgain={again} />;
  return (
    <Suspense fallback={<p className="text-center text-2xl font-bold py-10">🎮 Đang tải trò chơi…</p>}>
      <MiniGamePlayPage />
    </Suspense>
  );
}
