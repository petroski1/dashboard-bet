import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnqmfwvxxmjdgwpgfnyw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW1md3Z4eG1qZGd3cGdmbnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODA0ODUsImV4cCI6MjA5MTE1NjQ4NX0.kNFexmsx22xxvQ0ZQDGgjELjAhlhY_Jo0nH_MDJ3D-8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Review = {
  id: string
  name: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
}
