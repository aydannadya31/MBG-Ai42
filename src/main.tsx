import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and silence benign Vite WebSocket / HMR connection errors in sandboxed environment
if (typeof window !== 'undefined') {
  const ignorePatterns = [
    'failed to connect to websocket',
    'WebSocket connection to',
    'WebSocket closed without opened',
    'WebSocket'
  ];

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason);
    if (ignorePatterns.some(p => msg.includes(p))) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (ignorePatterns.some(p => msg.includes(p))) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
