import { Pharmacy, AggregatedOrder, DashboardStats } from './types';

export const APP_NAME = "لوحة تحكم راحة";
export const SUPER_ADMIN_PIN = "1234"; // Simple PIN for demo

export const MOCK_STATS: DashboardStats = {
  totalPharmacies: 124,
  totalMonthlySales: 450000,
  totalActiveOrders: 34,
  growthRate: 12.5,
};

export const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'صيدلية الأمل',
    uniqueKey: 'KRT-001',
    status: 'active',
    joinedDate: '2023-10-15T10:00:00Z',
    location: 'الخرطوم بحري',
    contactEmail: 'contact@alamal.com',
    balance: 150000
  },
  {
    id: '2',
    name: 'مركز النيل الصحي',
    uniqueKey: 'KRT-002',
    status: 'active',
    joinedDate: '2023-11-02T14:30:00Z',
    location: 'أم درمان',
    contactEmail: 'info@nilehealth.sd',
    balance: 45000
  },
  {
    id: '3',
    name: 'صيدلية البحر الأحمر',
    uniqueKey: 'PTS-045',
    status: 'suspended',
    joinedDate: '2024-01-10T09:15:00Z',
    location: 'بورتسودان',
    contactEmail: 'manager@redsea.com',
    balance: -5000
  },
  {
    id: '4',
    name: 'أدوية الصحراء',
    uniqueKey: 'KRT-009',
    status: 'pending',
    joinedDate: '2024-02-20T11:00:00Z',
    location: 'الخرطوم',
    contactEmail: 'support@saharameds.com',
    balance: 0
  },
  {
    id: '5',
    name: 'رعاية النيل الأزرق',
    uniqueKey: 'WDM-012',
    status: 'active',
    joinedDate: '2023-09-01T08:00:00Z',
    location: 'ود مدني',
    contactEmail: 'orders@bluenile.com',
    balance: 89000
  }
];

export const MOCK_MARKET_DEMAND: AggregatedOrder[] = [
  {
    id: '101',
    medicineName: 'Amoxicillin 500mg',
    totalQuantity: 1500,
    requestingPharmacyIds: ['1', '2', '5'],
    status: 'pending',
    urgency: 'high'
  },
  {
    id: '102',
    medicineName: 'Paracetamol 1g IV',
    totalQuantity: 3000,
    requestingPharmacyIds: ['1', '3', '4', '5'],
    status: 'partial',
    urgency: 'medium'
  },
  {
    id: '103',
    medicineName: 'Insulin Glargine',
    totalQuantity: 200,
    requestingPharmacyIds: ['2'],
    status: 'pending',
    urgency: 'high'
  },
  {
    id: '104',
    medicineName: 'Vitamin C 1000mg',
    totalQuantity: 5000,
    requestingPharmacyIds: ['1', '4'],
    status: 'supplied',
    urgency: 'low'
  }
];

export const SALES_DATA = [
  { name: 'يناير', sales: 4000 },
  { name: 'فبراير', sales: 3000 },
  { name: 'مارس', sales: 2000 },
  { name: 'أبريل', sales: 2780 },
  { name: 'مايو', sales: 1890 },
  { name: 'يونيو', sales: 2390 },
  { name: 'يوليو', sales: 3490 },
];
