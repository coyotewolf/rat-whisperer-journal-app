import React from 'react'; // Import React
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'; // Import i18next configuration

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback="Loading...">
    <App />
  </React.Suspense>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch(err => console.error('SW registration failed', err));
  });
}
