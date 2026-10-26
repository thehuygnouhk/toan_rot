import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { ColoringHomePage } from './features/coloring/ColoringHomePage';
import { ColoringPage } from './features/coloring/ColoringPage';
import { HomePage } from './features/home/HomePage';
import { ReviewMapPage } from './features/onthi/ReviewMapPage';
import { StationPage } from './features/onthi/StationPage';
import { PreviewPage } from './features/parent/PreviewPage';
import { ProgressPage } from './features/parent/ProgressPage';
import { WardrobePage } from './features/wardrobe/WardrobePage';
import { useProfile } from './engine/progress/store';
import { Layout } from './ui/Layout';

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
          <Route path="/tien-do" element={<ProgressPage />} />
          <Route path="/xem-truoc" element={<PreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
