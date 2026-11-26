'use client'

import { useState } from 'react'
import {
    getDateWiseSalesReport, getRoomWiseSalesReport, getPaymentModeReport,
    getStockConsumptionReport, getManagerActivityReport, getMonthlySummary
} from '@/lib/actions/reports'
// jsPDF is dynamically imported when needed
import {
    Calendar, FileBarChart, BedDouble, CreditCard, Package, Users,
    TrendingUp, Download, FileSpreadsheet, Loader2, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

type ReportType = 'date-wise' | 'room-wise' | 'payment-mode' | 'stock-consumption' | 'manager-activity' | 'monthly-summary'

const reportTabs: { key: ReportType; label: string; icon: any; desc: string }[] = [
    { key: 'date-wise', label: 'Date-wise Sales', icon: Calendar, desc: 'Revenue by date range' },
    { key: 'room-wise', label: 'Room & Table Sales', icon: BedDouble, desc: 'Revenue by room/table' },
    { key: 'payment-mode', label: 'Payment Mode', icon: CreditCard, desc: 'Cash vs EcoCash vs Bank Transfer' },
    { key: 'stock-consumption', label: 'Stock Consumption', icon: Package, desc: 'Items consumed' },
    { key: 'manager-activity', label: 'Manager Activity', icon: Users, desc: 'Actions per user' },
    { key: 'monthly-summary', label: 'Monthly Summary', icon: TrendingUp, desc: 'Monthly overview' },
]

export default function ReportsPanel() {
    const [activeTab, setActiveTab] = useState<ReportType>('date-wise')
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30)
        return d.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState<any>(null)

    const fetchReport = async () => {
        setLoading(true)
        setReportData(null)
        try {
            const start = new Date(startDate).toISOString()
            const end = new Date(endDate + 'T23:59:59').toISOString()

            let result: any
            switch (activeTab) {
                case 'date-wise':
                    result = await getDateWiseSalesReport(start, end); break
                case 'room-wise':
                    result = await getRoomWiseSalesReport(start, end); break
                case 'payment-mode':
                    result = await getPaymentModeReport(start, end); break
                case 'stock-consumption':
                    result = await getStockConsumptionReport(start, end); break
                case 'manager-activity':
                    result = await getManagerActivityReport(start, end); break
                case 'monthly-summary':
                    const [y, m] = selectedMonth.split('-')
                    result = await getMonthlySummary(parseInt(y), parseInt(m)); break
            }

            if (result?.error) { toast.error(result.error) }
            else { setReportData(result?.data) }
        } catch (e: any) { toast.error('Failed to load report') }
        setLoading(false)
    }

    const exportCSV = () => {
        if (!reportData) return
        let csv = ''

        if (activeTab === 'date-wise') {
            csv = 'Date,Source,Guest,Resource (Room/Table),Total,Room Charges,Food Charges,Tax,Payment Mode\n'
            for (const r of reportData) {
                const g = r.guests as any
                const dateStr = r.formatted_date || new Date(r.created_at).toLocaleDateString()
                csv += `"${dateStr}","${r.source}","${g?.name || ''}","${g?.rooms?.room_number || ''}",${r.total_amount},${r.room_charges},${r.food_charges},${r.gst_amount},"${r.payment_mode}"\n`
            }
        } else if (activeTab === 'room-wise') {
            csv = 'Source,Resource,Type,Bills,Total Revenue\n'
            for (const r of reportData) { csv += `"${r.source}","${r.label}","${r.type}",${r.count},${r.total.toFixed(2)}\n` }
        } else if (activeTab === 'payment-mode') {
            csv = 'Payment Mode,Transactions,Total Amount\n'
            for (const r of reportData) { csv += `"${r.mode}",${r.count},${r.total.toFixed(2)}\n` }
        } else if (activeTab === 'stock-consumption') {
            csv = 'Item Code,Item Name,Qty Consumed,Revenue\n'
            for (const r of reportData) { csv += `"${r.item_code}","${r.name}",${r.qty_consumed},${r.revenue.toFixed(2)}\n` }
        } else if (activeTab === 'manager-activity') {
            csv = 'Email,Role,Actions,Manual Orders,Room Shifts\n'
            for (const r of reportData) { csv += `"${r.email}","${r.role}",${r.actions},${r.manual_orders},${r.room_shifts}\n` }
        } else if (activeTab === 'monthly-summary') {
            csv = `Monthly Summary\nTotal Revenue,${reportData.total_revenue}\nHotel Revenue,${reportData.hotel_revenue}\nRestaurant Revenue,${reportData.restaurant_revenue}\nTotal Bills,${reportData.total_bills}\nRoom Charges,${reportData.total_room_charges}\nFood Charges,${reportData.total_food_charges}\nTax,${reportData.total_gst}\nDiscounts,${reportData.total_discounts}\n`
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; 
        const namePrefix = activeTab === 'room-wise' ? 'room_table_sales' : `report_${activeTab}`;
        a.download = `${namePrefix}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url)
        toast.success('CSV exported!')
    }

    const exportPDF = async () => {
        if (!reportData) return
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        const title = activeTab === 'room-wise' ? 'Room & Table Sales' : (reportTabs.find(t => t.key === activeTab)?.label || 'Report')
        doc.setFontSize(18); doc.text(title, 20, 20)
        doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 20, 28)
        doc.line(20, 32, 190, 32)

        let y = 40
        doc.setFontSize(11)

        if (activeTab === 'date-wise' && Array.isArray(reportData)) {
            doc.text('Date | Guest | Room | Total | Mode', 20, y); y += 8
            for (const r of reportData.slice(0, 40)) {
                const g = r.guests as any
                const dateStr = r.formatted_date || new Date(r.created_at).toLocaleDateString()
                doc.text(`${dateStr} | ${g?.name || ''} | Rm ${g?.rooms?.room_number || ''} | ${r.total_amount} | ${r.payment_mode}`, 20, y)
                y += 6; if (y > 270) { doc.addPage(); y = 20 }
            }
        } else if (activeTab === 'room-wise' && Array.isArray(reportData)) {
            for (const r of reportData) {
                doc.text(`${r.source} | ${r.label} (${r.type}) — ${r.count} bills — ${r.total.toFixed(2)}`, 20, y)
                y += 7; if (y > 270) { doc.addPage(); y = 20 }
            }
        } else if (activeTab === 'payment-mode' && Array.isArray(reportData)) {
            for (const r of reportData) {
                doc.text(`${r.mode}: ${r.count} transactions — ${r.total.toFixed(2)}`, 20, y)
                y += 7
            }
        } else if (activeTab === 'stock-consumption' && Array.isArray(reportData)) {
            doc.text('Code | Item | Qty | Revenue', 20, y); y += 8
            for (const r of reportData) {
                doc.text(`${r.item_code} | ${r.name} | ${r.qty_consumed} | ${r.revenue.toFixed(2)}`, 20, y)
                y += 6; if (y > 270) { doc.addPage(); y = 20 }
            }
        } else if (activeTab === 'manager-activity' && Array.isArray(reportData)) {
            for (const r of reportData) {
                doc.text(`${r.email} (${r.role}) — ${r.actions} actions, ${r.manual_orders} manual orders, ${r.room_shifts} shifts`, 20, y)
                y += 7; if (y > 270) { doc.addPage(); y = 20 }
            }
        } else if (activeTab === 'monthly-summary' && reportData) {
            doc.text(`Total Revenue: ${reportData.total_revenue?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Hotel Revenue: ${reportData.hotel_revenue?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Restaurant Revenue: ${reportData.restaurant_revenue?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Total Bills: ${reportData.total_bills}`, 20, y); y += 8
            doc.text(`Room Charges: ${reportData.total_room_charges?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Food Charges: ${reportData.total_food_charges?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Tax: ${reportData.total_gst?.toFixed(2)}`, 20, y); y += 8
            doc.text(`Discounts: ${reportData.total_discounts?.toFixed(2)}`, 20, y)
        }

        doc.save(`report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`)
        toast.success('PDF exported!')
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {reportTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setReportData(null) }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${activeTab === tab.key
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                    >
                        <tab.icon className={`h-5 w-5 ${activeTab === tab.key ? 'text-neutral-900' : 'text-neutral-400'}`} />
                        <span className={`text-xs font-medium ${activeTab === tab.key ? 'text-neutral-900' : 'text-neutral-500'}`}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-5">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    {activeTab === 'monthly-summary' ? (
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">Month</label>
                            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                                className="premium-input" />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                    className="premium-input" />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                    className="premium-input" />
                            </div>
                        </>
                    )}
                    <button onClick={fetchReport} disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Results */}
            {reportData && (
                <div className="glass-card overflow-hidden">
                    {/* Export buttons */}
                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileBarChart className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-bold text-neutral-800">
                                {reportTabs.find(t => t.key === activeTab)?.label} Results
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={exportCSV}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                <FileSpreadsheet className="h-3.5 w-3.5" /> Excel/CSV
                            </button>
                            <button onClick={exportPDF}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors">
                                <Download className="h-3.5 w-3.5" /> PDF
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="p-5 overflow-x-auto">
                        {activeTab === 'date-wise' && Array.isArray(reportData) && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Date</th>
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Source</th>
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Guest/Table</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Room $</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Food $</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Tax $</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Total $</th>
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-8 text-neutral-400 italic">No data in this range.</td></tr>
                                    ) : reportData.map((r: any) => {
                                        const g = r.guests as any
                                        return (
                                            <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                <td className="py-2.5 px-3 text-neutral-600 font-medium">{r.formatted_date || new Date(r.created_at).toLocaleDateString('en-US')}</td>
                                                <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-neutral-400 tracking-tight">{r.source}</td>
                                                <td className="py-2.5 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-neutral-800">{g?.name}</span>
                                                        <span className="text-[10px] text-neutral-400">{g?.rooms?.room_number}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-neutral-600">${Number(r.room_charges).toLocaleString('en-US')}</td>
                                                <td className="py-2.5 px-3 text-right text-neutral-600">${Number(r.food_charges).toLocaleString('en-US')}</td>
                                                <td className="py-2.5 px-3 text-right text-neutral-600">${Number(r.gst_amount).toLocaleString('en-US')}</td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-neutral-900">${Number(r.total_amount).toLocaleString('en-US')}</td>
                                                <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold border border-neutral-200">{r.payment_mode}</span></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                {reportData.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-neutral-300">
                                            <td colSpan={6} className="py-3 px-3 text-right font-bold text-neutral-600 uppercase text-xs">Grand Total</td>
                                            <td className="py-3 px-3 text-right font-semibold text-lg text-emerald-600">${reportData.reduce((s: number, r: any) => s + Number(r.total_amount), 0).toLocaleString('en-US')}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        )}

                        {activeTab === 'room-wise' && Array.isArray(reportData) && (
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Revenue by Room & Table</p>
                                {reportData.length === 0 ? (
                                    <p className="text-center py-8 text-neutral-400 italic">No data in this range.</p>
                                ) : reportData.map((r: any) => (
                                    <div key={r.label} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center font-semibold text-neutral-700">
                                                {r.label.split(' ')[1]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-neutral-800">{r.label}</p>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{r.source}</span>
                                                </div>
                                                <p className="text-xs text-neutral-500 capitalize">{r.type} • {r.count} bills</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-semibold text-emerald-600">${r.total.toLocaleString('en-US')}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'payment-mode' && Array.isArray(reportData) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {reportData.length === 0 ? (
                                    <p className="col-span-3 text-center py-8 text-neutral-400 italic">No data in this range.</p>
                                ) : reportData.map((r: any) => {
                                    const icons: Record<string, string> = { Cash: '💵', EcoCash: '📱', 'Bank Transfer': '🏦' }
                                    return (
                                        <div key={r.mode} className="p-5 rounded-xl border border-neutral-200 bg-white text-center">
                                            <span className="text-3xl">{icons[r.mode] || '💰'}</span>
                                            <p className="font-bold text-neutral-800 text-lg mt-2">{r.mode}</p>
                                            <p className="text-2xl font-semibold text-emerald-600 mt-1">${r.total.toLocaleString('en-US')}</p>
                                            <p className="text-xs text-neutral-500 mt-1">{r.count} transactions</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {activeTab === 'stock-consumption' && Array.isArray(reportData) && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Item Code</th>
                                        <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Item Name</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Qty Consumed</th>
                                        <th className="text-right py-2 px-3 text-xs font-bold text-neutral-500 uppercase">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-neutral-400 italic">No consumption data.</td></tr>
                                    ) : reportData.map((r: any, i: number) => (
                                        <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-mono font-bold">{r.item_code}</span></td>
                                            <td className="py-2.5 px-3 font-bold text-neutral-800">{r.name}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-neutral-600">{r.qty_consumed}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">${r.revenue.toLocaleString('en-US')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'manager-activity' && Array.isArray(reportData) && (
                            <div className="space-y-3">
                                {reportData.length === 0 ? (
                                    <p className="text-center py-8 text-neutral-400 italic">No activity data.</p>
                                ) : reportData.map((r: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm">{r.email.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="font-bold text-neutral-800">{r.email}</p>
                                                <p className="text-xs text-neutral-500 capitalize">{r.role === 'superadmin' ? 'Admin' : r.role === 'admin' ? 'Manager 1' : r.role === 'manager' ? 'Manager 2' : r.role === 'kitchen' ? 'Kitchen' : r.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-center">
                                            <div><p className="text-xl font-semibold text-neutral-600">{r.actions}</p><p className="text-[10px] text-neutral-500 font-bold uppercase">Actions</p></div>
                                            <div><p className="text-xl font-semibold text-amber-600">{r.manual_orders}</p><p className="text-[10px] text-neutral-500 font-bold uppercase">Manual KOT</p></div>
                                            <div><p className="text-xl font-semibold text-neutral-600">{r.room_shifts}</p><p className="text-[10px] text-neutral-500 font-bold uppercase">Shifts</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'monthly-summary' && reportData && !Array.isArray(reportData) && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Total Revenue', value: `$${reportData.total_revenue?.toLocaleString('en-US')}`, color: 'emerald', sub: `${reportData.total_bills} total bills` },
                                        { label: 'Hotel Revenue', value: `$${reportData.hotel_revenue?.toLocaleString('en-US')}`, color: 'indigo', sub: 'From guest rooms' },
                                        { label: 'Restaurant Revenue', value: `$${reportData.restaurant_revenue?.toLocaleString('en-US')}`, color: 'orange', sub: 'From table orders' },
                                        { label: 'Room Charges', value: `$${reportData.total_room_charges?.toLocaleString('en-US')}`, color: 'blue' },
                                        { label: 'Food Charges', value: `$${reportData.total_food_charges?.toLocaleString('en-US')}`, color: 'amber' },
                                        { label: 'Tax Collected', value: `$${reportData.total_gst?.toLocaleString('en-US')}`, color: 'violet' },
                                        { label: 'Discounts Given', value: `$${reportData.total_discounts?.toLocaleString('en-US')}`, color: 'rose' },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                                                <p className={`text-2xl font-semibold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                                            </div>
                                            {stat.sub && <p className="text-[10px] font-medium text-neutral-400 mt-2 uppercase">{stat.sub}</p>}
                                        </div>
                                    ))}
                                </div>
                                {Object.keys(reportData.by_payment_mode || {}).length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Payment Mode Breakdown</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {Object.entries(reportData.by_payment_mode).map(([mode, vals]: any) => (
                                                <div key={mode} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                                                    <p className="font-bold text-neutral-700">{mode}</p>
                                                    <p className="text-lg font-semibold text-emerald-600">${vals.amount?.toLocaleString('en-US')}</p>
                                                    <p className="text-[10px] text-neutral-500">{vals.count} bills</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
