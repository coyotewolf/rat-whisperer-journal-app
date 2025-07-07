import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

async function globalSetup(config: FullConfig) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const testUsername = process.env.TEST_USERNAME;
  const testPassword = process.env.TEST_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey || !testUsername || !testPassword) {
    throw new Error('Supabase URL, Anon Key, or test credentials are not set in .env file');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as the test user
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: testUsername,
    password: testPassword,
  });

  if (signInError || !user) {
    throw new Error(`Failed to sign in as test user: ${signInError?.message}`);
  }

  // Check if a test rat already exists
  const { data: existingRats, error: fetchError } = await supabase
    .from('rats')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Test Rat');

  if (fetchError) {
    throw new Error(`Failed to fetch existing rats: ${fetchError.message}`);
  }

  // If no test rat exists, create one
  if (existingRats.length === 0) {
    console.log('No test rat found. Creating one...');
    const { error: insertError } = await supabase
      .from('rats')
      .insert({
        user_id: user.id,
        name: 'Test Rat',
        sex: 'Male',
        status: 'active',
        birthday: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(`Failed to create test rat: ${insertError.message}`);
    }
    console.log('Test rat created successfully.');
  } else {
    console.log('Test rat already exists.');
  }
}

export default globalSetup;
