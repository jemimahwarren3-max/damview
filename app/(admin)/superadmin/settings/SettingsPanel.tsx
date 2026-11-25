'use client'

import { useState } from 'react'
import { updateSystemSetting } from '@/lib/actions/settings'
import { Coffee, Clock, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type BreakfastConfig = {
    enabled: boolean
    start_time: string
    end_time: string
}

export default function SettingsPanel({ breakfastConfig }: { breakfastConfig: BreakfastConfig }) {
    const [config, setConfig] = useState<BreakfastConfig>(breakfastConfig)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        const { error } = await updateSystemSetting('breakfast_control', config)
        if (error) {
            toast.error('Failed to save: ' + error)
        } else {
            toast.success('Breakfast settings saved!')
        }
        setSaving(false)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakfast Control */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200/50 bg-neutral-50 flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-xl">
                        <Coffee className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-800">Breakfast Availability</h3>
                        <p className="text-xs text-neutral-500">Enable or disable breakfast ordering and set time slots.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Breakfast Ordering</p>
                            <p className="text-xs text-neutral-500 mt-0.5">When disabled, breakfast items won't appear on the menu.</p>
                        </div>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${config.enabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                        >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ${config.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Time Slots */}
                    {config.enabled && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                <Clock className="h-3.5 w-3.5" />
                                Time Slot Configuration
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={config.start_time}
                                        onChange={(e) => setConfig(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="premium-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={config.end_time}
                                        onChange={(e) => setConfig(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="premium-input"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-neutral-400 italic">
                                Breakfast items will only be orderable between {config.start_time} and {config.end_time}.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-neutral-900 hover:bg-black transition-all shadow-sm disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Breakfast Settings'}
                    </button>
                </div>
            </div>

            {/* Security Info Card */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200/50 bg-neutral-50 flex items-center gap-3">
                    <div className="bg-neutral-100 p-2 rounded-xl">
                        <Shield className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-800">Security Settings</h3>
                        <p className="text-xs text-neutral-500">Active security measures.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Auto Logout</p>
                            <p className="text-xs text-neutral-500">Users are logged out after 10 minutes of inactivity.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Role-Based Access</p>
                            <p className="text-xs text-neutral-500">4-role system: Admin, Manager 1, Manager 2, Kitchen.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Data Retention</p>
                            <p className="text-xs text-neutral-500">All data stored for 1 year, auto-cleanup daily at 2 AM.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Audit Trail</p>
                            <p className="text-xs text-neutral-500">Room shifts, bill modifications, and stock edits are logged.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Active</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
