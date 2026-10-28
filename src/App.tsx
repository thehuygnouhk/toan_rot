import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { ColoringHomePage } from './features/coloring/ColoringHomePage';
import { ColoringPage } from './features/coloring/ColoringPage';
import { FashionShowPage } from './features/fashion/FashionShowPage';
import { HomePage } from './features/home/HomePage';
import { MiniGamesPage } from './features/minigames/MiniGamesPage';
import { ReviewMapPage } from './features/onthi/ReviewMapPage';
import { StationPage } from './features/onthi/StationPage';
import { PreviewPage } from './features/parent/PreviewPage';
import { ProgressPage } from './features/parent/ProgressPage';
import { WardrobePage } from './features/wardrobe/WardrobePage';
import { useProfile } from './engine/progress/store';
import { Layout } from './ui/Layout';

// Trang chơi mini-game kéo theo Phaser (~350 KB nén) nên chỉ tải khi bé vào chơi.
const MiniGamePlayPage = lazy(() => import('./features/minigames/MiniGamePlayPage'));

/** Các trang cần hồ sơ của bé; chưa có thì về trang chào. */
function NeedsProfile({ children }: { children: React.ReactNode }) {
  const profile = useProfile();
  if (profile === null) return null;
  return profile ? children : <Navigate to="/" replace />;
}

// HashRouter để chạy được ở mọi nơi (GitHub Pages, file tĩnh) mà không cần cấu hình máy chủ.
export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/on-thi" element={<NeedsProfile><ReviewMapPage /></NeedsProfile>} />
          <Route path="/on-thi/:stationId" element={<NeedsProfile><StationPage /></NeedsProfile>} />
          <Route path="/to-mau" element={<NeedsProfile><ColoringHomePage /></NeedsProfile>} />
          <Route path="/to-mau/:pictureId" element={<NeedsProfile><ColoringPage /></NeedsProfile>} />
          <Route path="/tu-do" element={<NeedsProfile><WardrobePage /></NeedsProfile>} />
          <Route path="/san-dien" element={<NeedsProfile><FashionShowPage /></NeedsProfile>} />
          <Route path="/tro-choi" element={<NeedsProfile><MiniGamesPage /></NeedsProfile>} />
          <Route
            path="/tro-choi/:gameId"
            element={
              <NeedsProfile>
                <Suspense fallback={<p className="text-center text-2xl font-bold py-10">🎮 Đang tải trò chơi…</p>}>
                  <MiniGamePlayPage />
                </Suspense>
              </NeedsProfile>
            }
          />
          <Route path="/tien-do" element={<ProgressPage />} />
          <Route path="/xem-truoc" element={<PreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
