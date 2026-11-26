import ReportsPanel from '@/app/(admin)/superadmin/reports/ReportsPanel'

export default function ReportsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h2 className="page-title">Reports & Analytics</h2>
                <p className="page-subtitle">Generate date-wise, room-wise, payment, stock consumption, and manager activity reports.</p>
            </div>
            <ReportsPanel />
        </div>
    )
}
