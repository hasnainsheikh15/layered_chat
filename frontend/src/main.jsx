import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LayerModeProvider } from './context/LayerModeContext.jsx'
import "@fontsource/poppins";
import { ToastProvider } from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
<ToastProvider>
  <AuthProvider>

    <LayerModeProvider>

      <App />

    </LayerModeProvider>

  </AuthProvider>
  </ToastProvider>
)
