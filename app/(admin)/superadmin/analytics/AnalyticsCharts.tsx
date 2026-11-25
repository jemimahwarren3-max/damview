'use client'

import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
 PieChart, Pie, Cell
} from 'recharts'

interface Props {
 monthlyRevenue: { month: string; revenue: number; room: number; food: number }[]
 revenueBreakdown: { name: string; value: number; color: string }[]
 topItems: { name: string; count: number }[]
}

export default function AnalyticsCharts({ monthlyRevenue, revenueBreakdown }: Props) {
 const totalRevenue = revenueBreakdown.reduce((s, d) => s + d.value, 0)

 return (
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
 {/* Monthly Revenue */}
 <div className="lg:col-span-3 glass-card p-6">
 <h3 className="text-lg font-bold text-neutral-800 mb-1">Monthly Revenue</h3>
 <p className="text-xs text-neutral-500 mb-5">Room vs. Food revenue breakdown by month</p>
 <div className="h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={monthlyRevenue} barCategoryGap="15%">
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
 <Tooltip
 contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 16px' }}
 formatter={(value: any, name: any) => [`$${Number(value).toLocaleString('en-US')}`, name === 'room' ? 'Room Revenue' : name === 'food' ? 'Food Revenue' : 'Total']}
 />
 <Legend formatter={(v: string) => v === 'room' ? 'Room Revenue' : 'Food Revenue'} iconType="circle" iconSize={8} />
 <Bar dataKey="room" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
 <Bar dataKey="food" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Revenue Breakdown */}
 <div className="lg:col-span-2 glass-card p-6 flex flex-col items-center">
 <h3 className="text-lg font-bold text-neutral-800 mb-1 self-start">Revenue Sources</h3>
 <p className="text-xs text-neutral-500 mb-4 self-start">${totalRevenue.toLocaleString('en-US')} total</p>
 <div className="h-[240px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
 {revenueBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
 </Pie>
 <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
 formatter={(value: string) => <span style={{ color: '#525252', fontSize: '12px', fontWeight: 500 }}>{value}</span>} />
 <Tooltip
 contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
 formatter={(value: any, name: any) => [`$${Number(value).toLocaleString('en-US')}`, name]} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 )
}

