'use client'

import { useEffect, useRef, useCallback } from 'react'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in ms
const ACTIVITY_RESET_THROTTLE_MS = 15 * 1000

export default function AutoLogout() {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const lastResetAtRef = useRef(0)

    const handleLogout = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/logout?reason=inactivity'
        }
    }, [])

    const resetTimer = useCallback(() => {
        const now = Date.now()
        if (now - lastResetAtRef.current < ACTIVITY_RESET_THROTTLE_MS) return
        lastResetAtRef.current = now

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT)
    }, [handleLogout])

    useEffect(() => {
        const events = ['pointerdown', 'keydown', 'touchstart', 'visibilitychange', 'mousemove', 'scroll', 'click', 'wheel']


        const handler = () => {
            if (document.visibilityState === 'hidden') return
            resetTimer()
        }

        events.forEach(event => document.addEventListener(event, handler, { passive: true }))

        // Start the initial timer
        resetTimer()

        return () => {
            events.forEach(event => document.removeEventListener(event, handler))
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [resetTimer])

    return null // Invisible component
}
