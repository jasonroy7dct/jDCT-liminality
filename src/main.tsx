import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Note: StrictMode is intentionally off — it double-mounts effects in dev and causes
// Plaid Link to load link-initialize.js twice (unsupported by Plaid).
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
