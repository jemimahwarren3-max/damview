'use client'

import { useState, useTransition } from 'react'
import { Database } from '@/types/database.types'
import { updateRoomStatus, updateRoomDetails } from '@/lib/actions/rooms'
import { Edit2, Check, X, BedDouble, ChevronDown, ChevronUp, Clock, ShieldCheck, Hammer } from 'lucide-react'
import toast from 'react-hot-toast'

type Room = Database['public']['Tables']['rooms']['Row']

export default function RoomList({ initialRooms }: { initialRooms: Room[] }) {
    const [rooms, setRooms] = useState<Room[]>(initialRooms)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ type: string, basePrice: string }>({ type: '', basePrice: '' })

    const handleStatusChange = async (roomId: string, newStatus: Room['status']) => {
        // Store previous status for revert BEFORE optimistic update
        const previousStatus = rooms.find(r => r.id === roomId)?.status
        // Optimistic update
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r))
        startTransition(async () => {
            const { error } = await updateRoomStatus(roomId, newStatus)
            if (!error) {
                toast.success(`Room status updated to ${newStatus}`)
            } else {
                // Revert using stored previous status
                setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: previousStatus || newStatus } : r))
                toast.error('Failed: ' + error)
            }
        })
    }

    const startEditing = (room: Room) => {
        setEditingId(room.id)
        setEditForm({ type: room.type, basePrice: room.base_price.toString() })
    }

    const saveEdit = async (roomId: string) => {
        const priceNum = parseFloat(editForm.basePrice)
        if (isNaN(priceNum) || priceNum < 0) { toast.error('Invalid price'); return }
        setLoadingId(roomId)
        startTransition(async () => {
            const { error } = await updateRoomDetails(roomId, editForm.type, priceNum)
            if (!error) {
                setRooms(prev => prev.map(r => r.id === roomId ? { ...r, type: editForm.type as Room['type'], base_price: priceNum } : r))
                setEditingId(null)
                toast.success('Room details updated')
            } else {
                toast.error('Failed: ' + error)
            }
            setLoadingId(null)
        })
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'available': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: ShieldCheck }
            case 'occupied': return { bg: 'bg-neutral-50', text: 'text-neutral-900', border: 'border-neutral-300', icon: BedDouble }
            case 'cleaning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Hammer }
            default: return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200', icon: Clock }
        }
    }

    return (
        <div className="p-5 space-y-3">
            {rooms.map((room) => {
                const isEditing = editingId === room.id
                const isLoading = loadingId === room.id
                const isExpanded = expandedId === room.id
                const sc = getStatusConfig(room.status)
                const Icon = sc.icon

                return (
                    <div key={room.id} className="flex flex-col rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300/80 transition-all duration-200 shadow-sm overflow-hidden group">
                        {/* Main Row */}
                        <div className="flex items-center gap-4 p-4">
                            <div className={`h-10 w-10 rounded-lg ${sc.bg} flex items-center justify-center ${sc.text} flex-shrink-0`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-neutral-900 text-base whitespace-nowrap">Room {room.room_number}</h4>
                                    <span className="text-[10px] font-bold text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-md uppercase tracking-wider">{room.type}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 font-medium">
                                    ${Number(room.base_price).toLocaleString('en-US')} <span className="text-[10px] text-neutral-500 uppercase">Per Night</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${sc.bg} ${sc.text} ${sc.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'available' ? 'bg-emerald-500' : room.status === 'occupied' ? 'bg-neutral-800' : 'bg-amber-500'}`} />
                                    {room.status}
                                </span>

                                <button onClick={() => setExpandedId(isExpanded ? null : room.id)} className="p-1.5 rounded-lg hover:bg-neutral-50 text-neutral-400 transition-colors">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="px-5 pb-5 pt-2 border-t border-neutral-50 bg-neutral-50/30 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    {/* Left: Quick Status Change */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-1">Quick Status Update</p>
                                        <div className="seg-group">
                                            {['available', 'occupied', 'cleaning'].map((status) => (
                                                <button
                                                    key={status}
                                                    disabled={isLoading || isEditing}
                                                    onClick={() => handleStatusChange(room.id, status as any)}
                                                    data-active={room.status === status}
                                                    className="seg-item"
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Room Details Edit */}
                                    <div className="space-y-3 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-neutral-200 md:pl-6">
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Configure Room Details</p>
                                            {!isEditing ? (
                                                <button onClick={() => startEditing(room)} className="text-neutral-900 hover:text-neutral-800 text-xs font-bold flex items-center gap-1">
                                                    <Edit2 className="h-3 w-3" /> Edit
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEdit(room.id)} disabled={isLoading} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold flex items-center gap-1">
                                                        <Check className="h-3 w-3" /> Save
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1">
                                                        <X className="h-3 w-3" /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                                    className="premium-select text-xs py-2">
                                                    <option value="standard">Standard</option>
                                                    <option value="premium">Premium</option>
                                                    <option value="suite">Suite</option>
                                                    <option value="deluxe">Deluxe</option>
                                                </select>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-bold">$</span>
                                                    <input type="number" value={editForm.basePrice}
                                                        onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                                                        className="premium-input pl-6 text-xs font-bold py-2" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-white/50 p-2.5 rounded-xl border border-neutral-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Class</span>
                                                    <span className="text-xs font-bold text-neutral-700 capitalize">{room.type}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Base Tariff</span>
                                                    <span className="text-sm font-bold text-neutral-900">${Number(room.base_price).toLocaleString('en-US')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

