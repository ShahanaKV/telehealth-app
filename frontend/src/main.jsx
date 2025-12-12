import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import { StreamProvider } from './components/StreamContext';
import './index.css';  // ← Make sure this line exists

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StreamProvider>
      <App />
    </StreamProvider>
  </StrictMode>
);