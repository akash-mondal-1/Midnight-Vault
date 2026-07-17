import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';
import { ClientProviders } from './components/ClientProviders';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProviders>
      <App />
    </ClientProviders>
  </React.StrictMode>
);
