export type PharmacyStatus = 'active' | 'suspended';

export interface Pharmacy {
  id: string;
  name: string;
  uniqueKey: string; // Maps to pharmacy_key in DB
  status: PharmacyStatus;
  joinedDate: string; // ISO Date string
  location: string;
  contactEmail: string;
  balance: number; // Wallet balance in SDG
  lastActive?: string;
}

export interface AggregatedOrder {
  id: string;
  medicineName: string; // Maps to item_name
  totalQuantity: number; // Maps to request_count
  requestingPharmacyIds: string[]; // List of pharmacy IDs requesting this
  status: 'pending' | 'supplied' | 'partial';
  urgency: 'low' | 'medium' | 'high';
}

export interface DashboardStats {
  totalPharmacies: number;
  totalMonthlySales: number;
  totalActiveOrders: number;
  growthRate: number; // Percentage
}

export interface User {
  id: string;
  email: string;
  role: 'super_admin';
}

// Database Row Types (Direct mapping)
export interface WantedListItem {
  id: string;
  pharmacy_id: string;
  item_name: string;
  request_count: number;
  status: string;
  created_at: string;
  urgency?: 'low' | 'medium' | 'high';
}
