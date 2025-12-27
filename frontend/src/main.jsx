import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        <Toaster 
            position="top-right"
            theme="dark"
            toastOptions={{
                style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgb(243, 244, 246)',
                    backdropFilter: 'blur(12px)',
                },
            }}
        />
    </React.StrictMode>,
)
