// --- Types ---
export type PharmacyStatus = 'active' | 'suspended' | 'pending';

export interface Pharmacy {
  id: string;
  name: string;
  uniqueKey: string;
  status: PharmacyStatus;
  joinedDate: string;
  location: string;
  contactEmail: string;
  balance: number;
}

export interface DemandItem {
  id: string;
  medicineName: string;
  totalQuantity: number;
  requestingPharmacyIds: string[];
  status: 'pending' | 'supplied';
  urgency: 'low' | 'medium' | 'high';
}

// --- Mock Data ---
export const MOCK_PHARMACIES: Pharmacy[] = [
  { id: '1', name: 'صيدلية الأمل', uniqueKey: 'KRT-001', status: 'active', joinedDate: '2023-10-15', location: 'الخرطوم بحري', contactEmail: 'contact@alamal.com', balance: 150000 },
  { id: '2', name: 'مركز النيل الصحي', uniqueKey: 'KRT-002', status: 'active', joinedDate: '2023-11-02', location: 'أم درمان', contactEmail: 'info@nilehealth.sd', balance: 45000 },
  { id: '3', name: 'صيدلية البحر الأحمر', uniqueKey: 'PTS-045', status: 'suspended', joinedDate: '2024-01-10', location: 'بورتسودان', contactEmail: 'manager@redsea.com', balance: -5000 },
  { id: '4', name: 'أدوية الصحراء', uniqueKey: 'KRT-009', status: 'pending', joinedDate: '2024-02-20', location: 'الخرطوم', contactEmail: 'support@saharameds.com', balance: 0 },
  { id: '5', name: 'رعاية النيل الأزرق', uniqueKey: 'WDM-012', status: 'active', joinedDate: '2023-09-01', location: 'ود مدني', contactEmail: 'orders@bluenile.com', balance: 89000 }
];

export const MOCK_DEMAND: DemandItem[] = [
  { id: '101', medicineName: 'Amoxicillin 500mg', totalQuantity: 1500, requestingPharmacyIds: ['1', '2', '5'], status: 'pending', urgency: 'high' },
  { id: '102', medicineName: 'Paracetamol 1g IV', totalQuantity: 3000, requestingPharmacyIds: ['1', '3', '4', '5'], status: 'pending', urgency: 'medium' },
  { id: '103', medicineName: 'Insulin Glargine', totalQuantity: 200, requestingPharmacyIds: ['2'], status: 'supplied', urgency: 'high' },
  { id: '104', medicineName: 'Vitamin C 1000mg', totalQuantity: 5000, requestingPharmacyIds: ['1', '4'], status: 'supplied', urgency: 'low' }
];

export const CHART_DATA = [
  { name: 'يناير', sales: 4000 },
  { name: 'فبراير', sales: 3000 },
  { name: 'مارس', sales: 2000 },
  { name: 'أبريل', sales: 2780 },
  { name: 'مايو', sales: 1890 },
  { name: 'يونيو', sales: 2390 },
  { name: 'يوليو', sales: 3490 },
];