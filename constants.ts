import { DashboardStats } from './types';

export const APP_NAME = "لوحة تحكم راحة";
// PIN authentication is now handled via localStorage in Login.tsx, but we keep a fallback constant just in case
export const DEFAULT_ADMIN_PIN = "1234"; 

// Initial empty stats
export const INITIAL_STATS: DashboardStats = {
  totalPharmacies: 0,
  totalMonthlySales: 0,
  totalActiveOrders: 0,
  growthRate: 0,
};
