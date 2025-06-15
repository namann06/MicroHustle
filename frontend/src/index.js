import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import MainRouter from './pages/Router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
);
