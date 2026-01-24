
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const supabaseUrl = 'https://yqoylbkoheamgrevmpyp.supabase.co';
const supabaseAnonKey = 'sb_publishable_--m-drdu110E5jS29JZVkQ_6WsaQB3M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
