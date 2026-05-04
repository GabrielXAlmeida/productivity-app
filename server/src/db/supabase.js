import { createClient } from '@supabase/supabase-js'


let supabase 

export function getSupabase() {
    if (!supabase) {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        )
    }
    return supabase
}