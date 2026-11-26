import { createClient } from '@/lib/supabase/server'
import { getOrSetVersionedCache } from '@/lib/cache/redis'
import SettingsPanel from './SettingsPanel'

export default async function SettingsPage() {
    const { breakfastSetting } = await getOrSetVersionedCache({
        domain: 'settings',
        key: 'superadmin:settings:breakfast',
        ttlSeconds: 60,
        loader: async () => {
            const supabase = await createClient()
            const { data } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'breakfast_control')
                .single()

            return { breakfastSetting: data || null }
        },
    })

    const breakfastConfig = (breakfastSetting?.value as any) || {
        enabled: true,
        start_time: '07:00',
        end_time: '10:30'
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h2 className="page-title">System Settings</h2>
                <p className="page-subtitle">Configure system-wide settings and controls.</p>
            </div>

            <SettingsPanel breakfastConfig={breakfastConfig} />
        </div>
    )
}
