// Suppress cross-origin frame $$typeof security errors and non-fatal iframe/websocket errors in preview environments
if (typeof window !== 'undefined') {
  const isIgnorableError = (msg: string) => {
    return (
      msg.includes('$$typeof') ||
      msg.includes('Blocked a frame with origin') ||
      msg.includes('cross-origin frame') ||
      msg.includes('named property') ||
      msg.includes('SecurityError') ||
      msg.includes('Should not already be working') ||
      msg.includes('WebSocket') ||
      msg.includes('JSON.parse: unexpected character') ||
      msg.includes('is not valid JSON') ||
      msg.includes('createWebSocketModuleRunnerTransport')
    );
  };

  // Global error handler to catch and suppress non-fatal iframe or scheduler errors
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || (error && error.message) || '');
    if (isIgnorableError(msg)) {
      return true; // Suppress the error
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  const handleSecurityError = (event: ErrorEvent) => {
    const msg = event.message || (event.error && event.error.message) || '';
    if (isIgnorableError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = reason ? String(reason.message || reason) : '';
    if (isIgnorableError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  window.addEventListener('error', handleSecurityError, true);
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
