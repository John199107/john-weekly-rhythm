import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oofqbmlpfrhiothxkjiy.supabase.co';
const supabasePublishableKey = 'sb_publishable_q4u4134lelLWzHgaICDs9g_SfN2Zon8';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
