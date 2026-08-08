import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnbyzymnnxlrfukcbbbb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYnl6eW1ubnhscmZ1a2NiYmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjQ0MDMsImV4cCI6MjEwMTU0MDQwM30.NN_DQedtDRW71R14NkGcAwpd1tBl2pVUwWSXOqZ4lZM'

export const supabase = createClient(supabaseUrl, supabaseKey)