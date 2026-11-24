import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import { isNativePlatform } from './lib/mobile';

if (!isNativePlatform() && import.meta.env.MODE !== 'portable') {
  registerSW({ immediate: true });
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Kök DOM öğesi (#root) bulunamadı.');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
