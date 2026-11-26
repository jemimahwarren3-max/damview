'use client'

import { useState } from 'react'
import { createAdminAccount } from '@/lib/actions/createAdmin'
import { Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'

export default function CreateAdminForm({ onCreated }: { onCreated: () => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'manager' | 'cashier' | 'kitchen'>('admin')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        if (password.length < 6) { setMessage('Error: Password must be at least 6 characters.'); setLoading(false); return }
        const { error } = await createAdminAccount(email, password, role)
        if (error) { setMessage(`Error: ${error}`) } else {
            const label = { admin: 'Manager 1', manager: 'Manager 2', cashier: 'Cashier', kitchen: 'Kitchen' }[role]
            setMessage(`${label} added successfully!`)
            setEmail(''); setPassword(''); onCreated()
        }
        setLoading(false)
    }

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
                <div className="bg-neutral-100 p-2 rounded-xl"><UserPlus className="h-4 w-4 text-neutral-900" /></div>
                <h3 className="font-bold text-neutral-800">Create New Staff Account</h3>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end" autoComplete="off">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        autoComplete="off" name="new-admin-email"
                        className="premium-input" placeholder="newadmin@hotel.com" />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Temporary Password</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} required value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password" name="new-admin-password"
                            className="premium-input" style={{ paddingRight: '2.5rem' }} placeholder="Minimum 6 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-36">
                    <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'manager' | 'cashier' | 'kitchen')}
                        className="premium-select">
                        <option value="admin">Manager 1</option>
                        <option value="manager">Manager 2</option>
                        <option value="cashier">Cashier</option>
                        <option value="kitchen">Kitchen</option>
                    </select>
                </div>
                <button type="submit" disabled={loading}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap py-2.5 px-5">
                    <UserPlus className="h-4 w-4" />
                    {loading ? 'Creating...' : 'Add Staff'}
                </button>
            </form>

            {message && (
                <div className={`flex items-center gap-2 text-sm rounded-xl p-3 ${message.startsWith('Error')
                    ? 'text-rose-600 bg-rose-50 border border-rose-200'
                    : 'text-emerald-600 bg-emerald-50 border border-emerald-200'}`}>
                    {message.startsWith('Error') ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <CheckCircle className="h-4 w-4 flex-shrink-0" />}
                    {message}
                </div>
            )}
        </div>
    )
}
