
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iawwawcofvgoduvskueu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd3dhd2NvZnZnb2R1dnNrdWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTMxMjcsImV4cCI6MjA4MDkyOTEyN30.sc6jutfGaWET1Oxl_SftjdukVubf_pddStb7teoSo7A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
