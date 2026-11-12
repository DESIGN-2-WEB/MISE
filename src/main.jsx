import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { preloadRoute } from './routes';
import { setUpPwa } from './utils/pwa';
import './styles/index.css';

// Listen for the browser's install prompt straight away: it can fire before the page has hydrated.
setUpPwa();

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Load the current page's code first, so prerendered HTML hydrates without a loading flash.
preloadRoute(window.location.pathname)
  .catch(() => {})
  .then(() => {
    if (container.firstElementChild) hydrateRoot(container, app);
    else createRoot(container).render(app);
  });
