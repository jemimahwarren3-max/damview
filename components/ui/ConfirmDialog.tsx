'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { AlertTriangle, CheckCircle, X, KeyRound } from 'lucide-react'

type ConfirmOptions = {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
}

type PromptOptions = {
    title: string
    message: string
    placeholder?: string
    confirmText?: string
    cancelText?: string
    required?: boolean
}

type ConfirmContextType = {
    confirm: (options: ConfirmOptions) => Promise<boolean>
    prompt: (options: PromptOptions) => Promise<string | null>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
    const ctx = useContext(ConfirmContext)
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
    return { confirm: ctx.confirm, prompt: ctx.prompt }
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean
        options: ConfirmOptions
        resolve: ((value: boolean) => void) | null
    }>({ isOpen: false, options: { title: '', message: '' }, resolve: null })

    const [promptState, setPromptState] = useState<{
        isOpen: boolean
        options: PromptOptions
        value: string
        resolve: ((value: string | null) => void) | null
    }>({ isOpen: false, options: { title: '', message: '' }, value: '', resolve: null })

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({ isOpen: true, options, resolve })
        })
    }, [])

    const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
        return new Promise((resolve) => {
            setPromptState({ isOpen: true, options, value: '', resolve })
        })
    }, [])

    const handleConfirm = () => {
        confirmState.resolve?.(true)
        setConfirmState(prev => ({ ...prev, isOpen: false }))
    }

    const handleConfirmCancel = () => {
        confirmState.resolve?.(false)
        setConfirmState(prev => ({ ...prev, isOpen: false }))
    }

    const handlePromptConfirm = () => {
        promptState.resolve?.(promptState.value)
        setPromptState(prev => ({ ...prev, isOpen: false }))
    }

    const handlePromptCancel = () => {
        promptState.resolve?.(null)
        setPromptState(prev => ({ ...prev, isOpen: false }))
    }

    const variantConfig = {
        danger: {
            icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
            iconBg: 'bg-rose-100',
            confirmBg: 'bg-rose-600 border border-rose-500 hover:bg-rose-700',
            confirmShadow: 'shadow-rose-600/30',
        },
        warning: {
            icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
            iconBg: 'bg-amber-100',
            confirmBg: 'bg-amber-600 border border-amber-500 hover:bg-amber-700',
            confirmShadow: 'shadow-amber-600/30',
        },
        info: {
            icon: <CheckCircle className="h-6 w-6 text-neutral-500" />,
            iconBg: 'bg-neutral-100',
            confirmBg: 'bg-neutral-900 border border-neutral-900 hover:bg-neutral-800',
            confirmShadow: 'shadow-neutral-900/20',
        },
    }

    const config = variantConfig[confirmState.options.variant || 'danger']

    return (
        <ConfirmContext.Provider value={{ confirm, prompt }}>
            {children}

            {confirmState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleConfirmCancel}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-sm max-w-sm w-full p-6 animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'fade-in 0.2s ease-out, slide-up 0.2s ease-out' }}>

                        {/* Close */}
                        <button onClick={handleConfirmCancel}
                            className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
                            <X className="h-4 w-4" />
                        </button>

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center mb-4`}>
                            {config.icon}
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">{confirmState.options.title}</h3>
                        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{confirmState.options.message}</p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button onClick={handleConfirmCancel}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors">
                                {confirmState.options.cancelText || 'Cancel'}
                            </button>
                            <button onClick={handleConfirm}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white ${config.confirmBg} shadow-sm ${config.confirmShadow} transition-all`}>
                                {confirmState.options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {promptState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handlePromptCancel}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-sm max-w-sm w-full p-6 animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'fade-in 0.2s ease-out, slide-up 0.2s ease-out' }}>

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4`}>
                            <KeyRound className="h-6 w-6 text-neutral-500" />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">{promptState.options.title}</h3>
                        <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{promptState.options.message}</p>

                        <div className="mb-6">
                            <input
                                type="text"
                                autoFocus
                                value={promptState.value}
                                onChange={e => setPromptState(prev => ({ ...prev, value: e.target.value }))}
                                placeholder={promptState.options.placeholder}
                                onKeyDown={e => { if (e.key === 'Enter') handlePromptConfirm() }}
                                className="premium-input"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button onClick={handlePromptCancel}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors">
                                {promptState.options.cancelText || 'Cancel'}
                            </button>
                            <button onClick={handlePromptConfirm}
                                disabled={promptState.options.required && !promptState.value.trim()}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 shadow-sm transition-all disabled:opacity-50`}>
                                {promptState.options.confirmText || 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    )
}

