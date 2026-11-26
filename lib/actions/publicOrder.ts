'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { bumpCacheVersions } from '@/lib/cache/redis'

export async function placeOrder(
    roomId: string | null,
    guestCode: string,
    cart: { food_id?: string | null, quantity: number, price: number, custom_name?: string | null }[],
    entryMode: 'manual' | 'automatic' = 'automatic',
    tableId?: string | null
) {
    const supabase = await createClient()
    let createdBy: string | null = null

    if (!cart || cart.length === 0) return { error: 'Your cart is empty.' }
    if (cart.length > 50) return { error: 'You can only order up to 50 unique items at a time.' }
    const totalQuantity = cart.reduce((acc, item) => acc + (item.quantity || 0), 0)
    if (totalQuantity > 100) return { error: 'Order quantity is too high. Please contact reception.' }

    // ── Restaurant Table Order Flow ──────────────────────────────────
    if (tableId) {
        const { data: table } = await supabase
            .from('restaurant_tables')
            .select('id, status')
            .eq('id', tableId)
            .single()

        if (!table) return { error: 'Table not found.' }

        if (table.status === 'available') {
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
            const supabaseAdmin = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            const { error: reserveError } = await supabaseAdmin
                .from('restaurant_tables')
                .update({ status: 'occupied' })
                .eq('id', tableId)
                .eq('status', 'available')

            if (reserveError) return { error: reserveError.message }
        }

        // Auth check: allow TABLE_QR (public QR) to skip auth, otherwise require staff login
        let tableCreatedBy: string | null = null
        if (guestCode !== 'TABLE_QR') {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) return { error: 'Unauthorized. Staff login required for table orders.' }

            const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single()
            if (!userData || !['admin', 'superadmin', 'manager', 'kitchen'].includes(userData.role)) {
                return { error: 'Unauthorized. Only staff can place table orders.' }
            }
            tableCreatedBy = session.user.id
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                table_id: tableId,
                room_id: null,
                guest_id: null,
                status: 'pending',
                entry_mode: guestCode === 'TABLE_QR' ? 'automatic' : 'manual',
                created_by: tableCreatedBy
            })
            .select()
            .single()

        if (orderError) return { error: orderError.message }

        const itemsToInsert = cart.map(item => ({
            order_id: order.id,
            food_id: item.food_id || null,
            quantity: item.quantity,
            price_snapshot: item.price,
            custom_name: item.custom_name || null
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert as any)

        if (itemsError) {
            await supabase.from('orders').delete().eq('id', order.id)
            return { error: itemsError.message }
        }

        revalidatePath('/admin/orders')
        await bumpCacheVersions(['orders', 'billing', 'tables', 'dashboard'])
        return { success: true }
    }

    // ── Hotel Room Order Flow ─────────────────────────────────────────
    if (!roomId) return { error: 'Room or table must be specified.' }

    const { data: activeGuest, error: guestError } = await supabase
        .from('guests')
        .select('id, guest_code, room_id')
        .eq('room_id', roomId)
        .eq('is_active', true)
        .maybeSingle()

    if (!activeGuest) return { error: 'No active guest found for this room.' }

    if (entryMode !== 'manual') {
        const { count: pendingOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('guest_id', activeGuest.id)
            .eq('status', 'pending')

        if (pendingOrders && pendingOrders >= 3)
            return { error: 'You have too many pending orders. Please wait for them to be accepted or call reception.' }
    }

    if (guestCode === 'ROOM_QR') {
        // QR scan from room — no auth needed, active guest check is sufficient
        if (!activeGuest) return { error: 'No active guest in this room to place an order.' }
    } else if (guestCode === 'ADMIN_OVERRIDE') {
        // ADMIN_OVERRIDE — use fast getSession() check
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return { error: 'Unauthorized Admin Override.' }

        const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single()
        if (!userData || !['admin', 'superadmin', 'manager', 'kitchen'].includes(userData.role))
            return { error: 'Unauthorized Admin Override.' }
        createdBy = session.user.id

        if (!activeGuest) return { error: 'No active guest in this room to place an order.' }
    } else {
        let normalizedCode = guestCode.trim().toUpperCase()
        if (!normalizedCode.includes('-')) {
            if (normalizedCode.startsWith('G') && normalizedCode.length > 3) {
                normalizedCode = `G-${normalizedCode.substring(1)}`
            } else {
                if (/^\d+$/.test(normalizedCode)) normalizedCode = normalizedCode.padStart(3, '0')
                normalizedCode = `G-${normalizedCode}`
            }
        }
        const cleanCode = normalizedCode.replace('-', '')
        const justRandomPart = normalizedCode.startsWith('G-') ? normalizedCode.substring(2) : cleanCode.startsWith('G') ? cleanCode.substring(1) : cleanCode
        const isValid = activeGuest && (
            activeGuest.guest_code === normalizedCode ||
            activeGuest.guest_code === cleanCode ||
            activeGuest.guest_code === justRandomPart
        )
        if (!isValid) return { error: 'Invalid Security Code for this room.' }
    }

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ room_id: roomId, table_id: null, guest_id: activeGuest.id, status: 'pending', entry_mode: entryMode, created_by: createdBy })
        .select()
        .single()

    if (orderError) return { error: orderError.message }

    const itemsToInsert = cart.map(item => ({
        order_id: order.id,
        food_id: item.food_id || null,
        quantity: item.quantity,
        price_snapshot: item.price,
        custom_name: item.custom_name || null
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert as any)

    if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id)
        return { error: itemsError.message }
    }

    revalidatePath('/admin/orders')
    await bumpCacheVersions(['orders', 'billing', 'dashboard'])
    return { success: true }
}
