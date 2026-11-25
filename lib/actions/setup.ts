'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// We use the standard supabase-js client here specifically for the service_role key
// to bypass RLS and create users on the server side securely.
export async function initializeSuperadmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const superEmail = process.env.SUPERADMIN_EMAIL
    const superPassword = process.env.SUPERADMIN_PASSWORD

    if (!supabaseUrl || !serviceRoleKey || !superEmail || !superPassword) {
        return { error: 'Missing environment variables for Superadmin setup.' }
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Check if user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) return { error: listError.message }

    const existingSuperadmin = users.find(u => u.email === superEmail)

    let userId = existingSuperadmin?.id

    if (!existingSuperadmin) {
        // Create new user in Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: superEmail,
            password: superPassword,
            email_confirm: true,
            user_metadata: { role: 'superadmin' }
        })

        if (createError) return { error: createError.message }
        userId = newUser.user.id
    } else {
        // If user exists but password changed in env, we can update it
        await supabaseAdmin.auth.admin.updateUserById(existingSuperadmin.id, {
            password: superPassword
        })
    }

    // Ensure role is correctly set in public.users table (trigger might have set it to 'admin' initially depending on metadata timing)
    if (userId) {
        await supabaseAdmin.from('users').update({ role: 'superadmin' }).eq('id', userId)
    }

    return { success: true }
}
