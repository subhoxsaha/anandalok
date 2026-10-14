// Suppress cross-origin frame $$typeof security errors common in iframe preview environments
if (typeof window !== 'undefined') {
  // Global error handler to catch and suppress non-fatal iframe or scheduler errors
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (
      msg.includes('$$typeof') ||
      msg.includes('Blocked a frame with origin') ||
      msg.includes('cross-origin frame') ||
      msg.includes('named property') ||
      msg.includes('SecurityError') ||
      msg.includes('Should not already be working')
    ) {
      return true; // Suppress the error
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  const handleSecurityError = (event: ErrorEvent) => {
    const msg = event.message || (event.error && event.error.message) || '';
    if (
      msg.includes('$$typeof') ||
      msg.includes('Blocked a frame with origin') ||
      msg.includes('cross-origin frame') ||
      msg.includes('named property') ||
      msg.includes('SecurityError') ||
      msg.includes('Should not already be working')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = reason ? String(reason.message || reason) : '';
    if (
      msg.includes('$$typeof') ||
      msg.includes('Blocked a frame with origin') ||
      msg.includes('cross-origin frame') ||
      msg.includes('named property') ||
      msg.includes('SecurityError') ||
      msg.includes('Should not already be working')
    ) {
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
