import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './ErrorBoundary';
import PublicDishCard from './PublicDishCard.tsx';
import PublicMenu from './PublicMenu.tsx';


window.addEventListener('error', (event) => {
  alert('Global error: ' + event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  alert('Unhandled promise rejection: ' + event.reason);
});

// Routes publiques, sans connexion Google — interceptées ici, avant AuthProvider, pour ne jamais
// passer par l'écran de connexion : le reste de l'app (tout le contenu sous AuthProvider) reste
// entièrement verrouillé comme avant.
// - /plat/:slug — fiche ingrédients d'un plat, partagée depuis le site WordPress.
// - /carte — menu complet en direct (voir PublicMenu.tsx), intégré (lien/iframe) depuis la page
//   /menu/ du site WordPress (construite avec Elementor : on évite d'y pousser du contenu qui
//   casserait sa mise en page, on affiche plutôt le menu ERP en direct, toujours à jour).
const publicDishMatch = window.location.pathname.match(/^\/plat\/([^/]+)\/?$/);
const isPublicMenu = /^\/carte\/?$/.test(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    {publicDishMatch ? (
      <PublicDishCard slug={decodeURIComponent(publicDishMatch[1])} />
    ) : isPublicMenu ? (
      <PublicMenu />
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
