import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton client for connection reuse
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
	if (supabaseAdmin) return supabaseAdmin;
	
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
	if (!url || !serviceKey) return null;
	
	supabaseAdmin = createClient(url, serviceKey, { 
		auth: { 
			persistSession: false,
			autoRefreshToken: false,
		},
	});
	
	return supabaseAdmin;
}
