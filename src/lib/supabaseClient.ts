import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdxpxqdewqrbvlsajeeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHB4cWRld3FyYnZsc2FqZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NzM0MDMsImV4cCI6MjA1MzI0OTQwM30.-wnDf1hMWOow3O1kbcTfC3mw59h-5SsmdFGhp5bKgUE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);