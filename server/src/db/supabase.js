import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

let supabase 

export function getSupabase() {
    if (!supabase) {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                realtime: {
                    transport: ws
                }
            }
        )
    }
    return supabase
}