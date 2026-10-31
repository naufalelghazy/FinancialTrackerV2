import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // A blank page is the worst failure mode: the build has referenced an id that
  // does not exist in `index.html`, and nothing else will ever report it.
  throw new Error('Elemen #root tidak ditemukan — index.html rusak.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
