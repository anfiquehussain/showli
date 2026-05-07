import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import './styles/index.css';
import App from './App';
import { store } from './store';

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster position="top-center" richColors />
    </Provider>
  </StrictMode>,
);
