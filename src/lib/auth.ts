import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigurationError } from './supabase'

export const authConfigurationError = supabaseConfigurationError

function requireClient() {
	if (!supabase) throw new Error(authConfigurationError ?? 'Supabase is not configured.')
	return supabase
}

export async function getCurrentSession(): Promise<Session | null> {
	const client = requireClient()
	const { data, error } = await client.auth.getSession()
	if (error) throw error
	return data.session
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
	if (!supabase) return () => {}

	const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null))
	return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle(redirectTo: string): Promise<void> {
	const client = requireClient()
export async function signInWithGoogle(redirectTo?: string): Promise<void> {
    const client = requireClient()
    const targetRedirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '')

    const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: targetRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
    })
    if (error) throw error
}
export async function signInWithPassword(email: string, password: string): Promise<Session | null> {
	const client = requireClient()
	const { data, error } = await client.auth.signInWithPassword({ email, password })
	if (error) throw error
	return data.session
}

export async function signUpWithPassword(
	email: string,
	password: string,
	fullName: string,
): Promise<{ needsEmailConfirmation: boolean }> {
	const client = requireClient()
	const { data, error } = await client.auth.signUp({
		email,
		password,
		options: { data: { full_name: fullName } },
	})
	if (error) throw error
	return { needsEmailConfirmation: !data.session }
}

export async function signOut(): Promise<void> {
	const client = requireClient()
	const { error } = await client.auth.signOut()
	if (error) throw error
}
