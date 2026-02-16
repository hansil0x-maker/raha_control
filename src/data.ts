// --- Types Only - Aligned with Supabase Schema ---

export type PharmacyStatus = 'active' | 'suspended';

export interface Pharmacy {
  id: string;
  name: string;
  pharmacy_key: string;
  master_password?: string;
  status: PharmacyStatus;
  joined_date?: string;
  location?: string;
  contact_phone?: string; // Changed from contact_email
  balance: number;
  last_active?: string;
}

export interface DemandItem {
  id: string;
  item_name: string;
  request_count: number;
  pharmacy_id: string;
  pharmacy_name?: string; 
  status: 'pending' | 'supplied' | 'received';
  urgency?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface SystemMessage {
  id: string;
  content: string;
  is_active: boolean;
  created_at: string;
  priority: 'normal' | 'urgent';
}

export interface Sale {
  id: string;
  pharmacy_id: string;
  total_amount: number;
  created_at: string;
}

export interface ChartDataPoint {
  name: string;
  sales: number;
}
