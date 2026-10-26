import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Chỉ nạp bộ chữ Latin + tiếng Việt cho nhẹ
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/vietnamese-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/baloo-2/vietnamese-800.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/vietnamese-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/vietnamese-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/vietnamese-800.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
