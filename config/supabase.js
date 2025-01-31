import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line no-undef
const supabaseUrl = process.env.SUPABASE_URL;
// eslint-disable-next-line no-undef
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
