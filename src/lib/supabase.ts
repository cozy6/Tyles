import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sapyemzzwoxyqmffzhpb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcHllbXp6d294eXFtZmZ6aHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzI1MTcsImV4cCI6MjA2NzM0ODUxN30.ynWVk_eOWEbl0LMIi9uOycba9EgUt8npkOfI0zJWM60'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to create authenticated Supabase client for Firebase users
export const createAuthenticatedSupabaseClient = (firebaseUid: string) => {
  const client = createClient(supabaseUrl, supabaseAnonKey)
  
  // Set the Firebase UID for RLS policies
  client.functions.setAuth(`Bearer ${supabaseAnonKey}`)
  
  return client
}

// Helper function to set Firebase UID for RLS policies on existing client
export const setFirebaseUidForRLS = async (firebaseUid: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.firebase_uid',
      setting_value: firebaseUid,
      is_local: true
    })
  } catch (error) {
    console.error('Error setting Firebase UID for RLS:', error)
  }
}

export default supabase