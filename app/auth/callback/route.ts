import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { resolveAppOrigin } from '@/lib/supabase/utils'

export async function GET(request: Request) {
 const { searchParams } = new URL(request.url)
 const code = searchParams.get('code')

 if (code) {
 const supabase = await createClient()
 const { data, error } = await supabase.auth.exchangeCodeForSession(code)
 if (!error) {
 // Reuse exchanged user to avoid an additional /user request.
 const user = data?.user ?? data?.session?.user
 if (user) {
 const { data: userData } = await supabase
 .from('users')
 .select('role')
 .eq('id', user.id)
 .single();

 const appOrigin = resolveAppOrigin(request)
 const role = userData?.role;

 // Handle edge case: user exists in auth but has no profile row
 if (!role) {
   const loginUrl = new URL('/admin/login', appOrigin)
   loginUrl.searchParams.set('error', 'no_profile')
   return NextResponse.redirect(loginUrl)
 }

 const dashboardPath = role === 'superadmin'
	 ? '/superadmin/dashboard'
	 : role === 'kitchen'
		 ? '/admin/orders'
		 : '/admin/dashboard';

 return NextResponse.redirect(`${appOrigin}${dashboardPath}`)
 }
 }
 }

 // return the user to an error page with instructions
 const appOrigin = resolveAppOrigin(request)
 return NextResponse.redirect(`${appOrigin}/auth/auth-code-error`)
}
