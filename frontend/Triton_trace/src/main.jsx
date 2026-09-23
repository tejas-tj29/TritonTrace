import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { IncidentProvider } from "./context/IncidentContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* AuthProvider goes inside BrowserRouter if it needs to use navigation/redirects */}
        <AuthProvider>
          <IncidentProvider>
            <App />
          </IncidentProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
