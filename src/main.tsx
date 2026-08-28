import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './ErrorBoundary';
import PublicDishCard from './PublicDishCard.tsx';


window.addEventListener('error', (event) => {
  alert('Global error: ' + event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  alert('Unhandled promise rejection: ' + event.reason);
});

// Route publique, sans connexion Google — /plat/:slug, partagée depuis le site WordPress.
// Interceptée ici, avant AuthProvider, pour ne jamais passer par l'écran de connexion : le
// reste de l'app (tout le contenu sous AuthProvider) reste entièrement verrouillé comme avant.
const publicDishMatch = window.location.pathname.match(/^\/plat\/([^/]+)\/?$/);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    {publicDishMatch ? (
      <PublicDishCard slug={decodeURIComponent(publicDishMatch[1])} />
    ) : (
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    )}
    </ErrorBoundary>
  </StrictMode>,
);
