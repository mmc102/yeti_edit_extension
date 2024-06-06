import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and key
const supabaseUrl = 'https://ynkipgstoglnycddnluz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlua2lwZ3N0b2dsbnljZGRubHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwNzAzMDAsImV4cCI6MjAzMTY0NjMwMH0.RagCPClX_zoExpe6gSZt-ITZdTSUltsrJU2SzVypeKA';

export const supabase = createClient(supabaseUrl, supabaseKey);
