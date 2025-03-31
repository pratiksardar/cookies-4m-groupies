import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Add error handling helpers
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  if (error.code === '42703') {
    return 'Invalid query structure';
  }
  return 'An unexpected error occurred';
};

// Add a connection check function with retry
export const checkSupabaseConnection = async (retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();
      
      if (!error) {
        return true;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      console.error('Supabase connection error:', error);
      if (i === retries - 1) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
};