import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_ENV,
    process.env.SUPABASE_KEY
)

export default supabase 