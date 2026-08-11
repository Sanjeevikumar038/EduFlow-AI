import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || (error.response.data && error.response.data.error === "TOKEN_EXPIRED"))) {
      console.warn("Session expired or unauthorized. Clearing localStorage and redirecting to login...");
      localStorage.clear();
      if (window.location.pathname !== "/" && window.location.pathname !== "/portal-login") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
