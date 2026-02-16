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

export const MOCK_STATS: DashboardStats = {
  totalPharmacies: 24,
  totalMonthlySales: 1250000,
  totalActiveOrders: 15,
  growthRate: 8.5,
};

export const SALES_DATA = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];