import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function updateMosque() {
  const { data, error } = await supabase
    .from('mosques')
    .update({
      stripe_account_id: 'acct_1R6czTR6hvWQXl3x',
      stripe_charges_enabled: true,
      stripe_payouts_enabled: true
    })
    .eq('slug', 'masjid-manhattan')
    .select();

  if (error) {
    console.error('Error updating mosque:', error);
  } else {
    console.log('Mosque updated successfully:', data);
  }
}

updateMosque();