import { createClient } from '@supabase/supabase-js';

// Note: User needs to click "Connect to Supabase" button to set these up
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);