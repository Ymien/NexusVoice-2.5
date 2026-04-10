import { createClient } from '@supabase/supabase-js';

// 获取环境变量，或者使用默认值（注意：sb_secret_ 看起来像数据库密码，实际上这里需要的是 anon public key）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
