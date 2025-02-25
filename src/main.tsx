import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { WalletProvider } from './hooks/useWallet';
import { ThemeProvider } from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>
);