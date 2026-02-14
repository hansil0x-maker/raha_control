export type PharmacyStatus = 'active' | 'suspended' | 'pending';

export interface Pharmacy {
  id: string;
  name: string;
  uniqueKey: string;
  status: PharmacyStatus;
  joinedDate: string; // ISO Date string
  location: string;
  contactEmail: string;
  balance: number; // Wallet balance in SDG
}

export interface AggregatedOrder {
  id: string;
  medicineName: string;
  totalQuantity: number;
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
