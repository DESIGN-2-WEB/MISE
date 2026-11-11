import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { preloadRoute } from './routes';
import './styles/index.css';

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
