import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext.jsx';

import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* AuthProvider goes inside BrowserRouter if it needs to use navigation/redirects */}
        <AuthProvider> 
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
