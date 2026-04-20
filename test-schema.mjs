import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sgtrcdmdmzmcxliglvby.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndHJjZG1kbXptY3hsaWdsdmJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU3OTE3MCwiZXhwIjoyMDYxMTU1MTcwfQ.3ti_CPDmDwfecxFAAYCzY0oy6ZBs56xxSdFrXYF9hkI'
);

async function inspect() {
  const { data, error } = await supabase.from('request_company').insert({ company_name: 'test', social_media: 'test' }).select('*');
  console.log(JSON.stringify(error || data, null, 2));
}

inspect();
