import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import './theme/global.css';
import './theme/components.css';
import './theme/presentador.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { esVentanaPresentador } from './modelo';
import Presentador from './presenter/Presentador';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{esVentanaPresentador() ? <Presentador /> : <App />}</StrictMode>,
);
