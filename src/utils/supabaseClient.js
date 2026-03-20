import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '⚠️ Supabase credentials missing!\n' +
        'Create a .env file in the project root with:\n' +
        '  VITE_SUPABASE_URL=your_project_url\n' +
        '  VITE_SUPABASE_ANON_KEY=your_anon_key'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
