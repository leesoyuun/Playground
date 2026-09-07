import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './style.css';
const Router = import.meta.env.MODE === 'pages' ? HashRouter : BrowserRouter;
createRoot(document.getElementById('app')!).render(<React.StrictMode><Router><App /></Router></React.StrictMode>);
