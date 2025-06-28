import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './index.css';
import Router from './pages/Router';
import './i18n';
import { BrowserRouter } from 'react-router-dom'; // ✅ This is the missing line
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Router />
  </BrowserRouter>
);

serviceWorkerRegistration.unregister();
