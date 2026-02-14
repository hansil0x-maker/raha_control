import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URLs are missing from environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Helper function to fetch pharmacies
export const getPharmacies = async () => {
  const { data, error } = await supabase
    .from('pharmacies')
    .select('*');
    
  if (error) throw error;
  return data;
};

// Helper function to fetch aggregated demand (Mock logic for SQL view)
export const getMarketDemand = async () => {
  // In a real scenario, this would be a view or a complex query on 'wanted_list'
  const { data, error } = await supabase
    .from('wanted_list')
    .select('medicine_name, quantity, status')
    // Logic to aggregate would typically happen in SQL (View) or backend function
  
  if (error) throw error;
  return data;
};