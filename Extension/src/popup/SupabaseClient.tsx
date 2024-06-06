
import { createClient, Session } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynkipgstoglnycddnluz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlua2lwZ3N0b2dsbnljZGRubHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwNzAzMDAsImV4cCI6MjAzMTY0NjMwMH0.RagCPClX_zoExpe6gSZt-ITZdTSUltsrJU2SzVypeKA';




export const supabase = createClient(supabaseUrl, supabaseKey);

// Restore session from local storage
const savedSession = localStorage.getItem('supabase.auth.token');

if (savedSession) {
    const session = JSON.parse(savedSession);
    supabase.auth.setSession(session);
}
