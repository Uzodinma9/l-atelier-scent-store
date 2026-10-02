import { createClient } from '@supabase/supabase-js'

function getSupabaseOrigin(value: string | undefined): string {
	const candidate = value?.match(/https?:\/\/[^\s"'`]+/i)?.[0]
	if (!candidate) return ''

	try {
		return new URL(candidate).origin
	} catch {
		return ''
	}
}

const rawPublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
const publishableKey = rawPublishableKey.match(/sb_publishable_[^\s"'`]+|eyJ[^\s"'`]+/)?.[0] ?? ''
const supabaseUrl = getSupabaseOrigin(import.meta.env.VITE_SUPABASE_URL)
const isSecretKey = rawPublishableKey.includes('sb_secret_')

export const supabaseConfigurationError = isSecretKey
	? 'A Supabase secret key cannot be used in the browser. Set VITE_SUPABASE_PUBLISHABLE_KEY to the publishable key.'
	: !supabaseUrl || !publishableKey
		? 'Supabase URL or publishable key is missing or invalid. Check the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY entries in .env.'
		: null

export const supabase = supabaseConfigurationError
	? null
	: createClient(supabaseUrl, publishableKey)