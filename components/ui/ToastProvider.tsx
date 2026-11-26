'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3500,
                style: {
                    background: '#262626',
                    color: '#f5f5f5',
                    borderRadius: '1rem',
                    padding: '14px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                    iconTheme: { primary: '#10b981', secondary: '#ecfdf5' },
                    style: { background: '#064e3b', borderColor: 'rgba(16,185,129,0.3)' },
                },
                error: {
                    iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
                    style: { background: '#450a0a', borderColor: 'rgba(239,68,68,0.3)' },
                    duration: 5000,
                },
            }}
        />
    )
}
