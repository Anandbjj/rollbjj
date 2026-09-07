import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://awssdwyjcnqmgheghkrf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3c3Nkd3lqY25xbWdoZWdoa3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDk2NzMsImV4cCI6MjEwNDM4NTY3M30.Za_WkegV4OHoZXWrYrLGWZ74-xMVUvZVQNTw8y-kZlE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
