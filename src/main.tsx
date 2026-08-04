import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './ErrorBoundary';


window.addEventListener('error', (event) => {
  alert('Global error: ' + event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  alert('Unhandled promise rejection: ' + event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
