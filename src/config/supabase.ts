/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iwvtfyuxwfgknqurkvcf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dnRmeXV4d2Zna25xdXJrdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU5ODMsImV4cCI6MjA5ODI1MTk4M30.lYjKUHX2tblPiZX5VzBqSu2TJkSk4aw5vn0W_SJd0bg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
