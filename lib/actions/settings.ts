'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-guard'
import { bumpCacheVersions } from '@/lib/cache/redis'

export async function getSystemSetting(key: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single()
    if (error) return null
    return data?.value
}

export async function updateSystemSetting(key: string, value: any) {
    const { user, supabase } = await requireAuth(['superadmin'])

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return { error: error.message }

    await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'setting_update',
        entity_type: 'system_settings',
        entity_id: key,
        details: value
    })

    revalidatePath('/superadmin/dashboard')
    revalidatePath('/superadmin/settings')
    await bumpCacheVersions(['settings', 'dashboard', 'menu', 'orders'])
    return { success: true }
}
