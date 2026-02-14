import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, PackageSearch, LogOut, Menu, 
  ShieldCheck, LockKeyhole, Search, Plus, X, Wallet, 
  MapPin, Mail, Store, Key, TrendingUp, AlertCircle, PackageCheck,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';

// --- Types ---
type ViewState = 'overview' | 'pharmacies' | 'demand';
type PharmacyStatus = 'active' | 'suspended' | 'pending';

interface Pharmacy {
  id: string;
  name: string;
  uniqueKey: string;
  status: PharmacyStatus;
  joinedDate: string;
  location: string;
  contactEmail: string;
  balance: number;
}

interface DemandItem {
  id: string;
  medicineName: string;
  totalQuantity: number;
  requestingPharmacyIds: string[];
  status: 'pending' | 'supplied';
  urgency: 'low' | 'medium' | 'high';
}

// --- Mock Data ---
const INITIAL_PHARMACIES: Pharmacy[] = [
  { id: '1', name: 'صيدلية الأمل', uniqueKey: 'KRT-001', status: 'active', joinedDate: '2023-10-15', location: 'الخرطوم بحري', contactEmail: 'contact@alamal.com', balance: 150000 },
  { id: '2', name: 'مركز النيل الصحي', uniqueKey: 'KRT-002', status: 'active', joinedDate: '2023-11-02', location: 'أم درمان', contactEmail: 'info@nilehealth.sd', balance: 45000 },
  { id: '3', name: 'صيدلية البحر الأحمر', uniqueKey: 'PTS-045', status: 'suspended', joinedDate: '2024-01-10', location: 'بورتسودان', contactEmail: 'manager@redsea.com', balance: -5000 },
];

const INITIAL_DEMAND: DemandItem[] = [
  { id: '101', medicineName: 'Amoxicillin 500mg', totalQuantity: 1500, requestingPharmacyIds: ['1', '2'], status: 'pending', urgency: 'high' },
  { id: '102', medicineName: 'Paracetamol 1g IV', totalQuantity: 3000, requestingPharmacyIds: ['1', '3'], status: 'pending', urgency: 'medium' },
  { id: '103', medicineName: 'Insulin Glargine', totalQuantity: 200, requestingPharmacyIds: ['2'], status: 'supplied', urgency: 'high' },
];

// --- Helper Components ---

const Badge = ({ children, variant }: { children: React.ReactNode, variant: string }) => {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    suspended: "bg-red-50 text-red-700 ring-red-600/10",
    pending: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    high: "bg-red-50 text-red-700 ring-red-600/10",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    low: "bg-green-50 text-green-700 ring-green-600/20",
    supplied: "bg-gray-100 text-gray-600 ring-gray-500/10",
    default: "bg-gray-50 text-gray-600 ring-gray-500/10"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

// --- Main Application Component ---

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [demands, setDemands] = useState<DemandItem[]>(INITIAL_DEMAND);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPharm, setNewPharm] = useState({ name: '', location: '', email: '' });

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      setError('رمز الدخول غير صحيح');
    }
  };

  const generateKey = () => `RAHA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const addPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    const p: Pharmacy = {
      id: Date.now().toString(),
      name: newPharm.name,
      location: newPharm.location,
      contactEmail: newPharm.email,
      uniqueKey: generateKey(),
      status: 'active',
      joinedDate: new Date().toISOString(),
      balance: 0
    };
    setPharmacies([p, ...pharmacies]);
    setIsModalOpen(false);
    setNewPharm({ name: '', location: '', email: '' });
  };

  const markSupplied = (id: string) => {
    setDemands(demands.map(d => d.id === id ? { ...d, status: 'supplied' } : d));
  };

  const toggleStatus = (id: string) => {
    setPharmacies(pharmacies.map(p => {
        if(p.id !== id) return p;
        return { ...p, status: p.status === 'active' ? 'suspended' : 'active' };
    }));
  };

  // --- Views ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم راحة</h1>
            <p className="text-gray-500 text-sm mt-2">أدخل رمز المشرف العام</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="block w-full text-center py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-2xl tracking-widest"
                placeholder="••••"
                maxLength={4}
              />
              <LockKeyhole className="absolute top-4 right-4 text-gray-400 w-5 h-5" />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold transition">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">ر</div>
            <span>راحة <span className="text-gray-900 font-normal">كونترول</span></span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <button onClick={() => { setCurrentView('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${currentView === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard size={20} /> نظرة عامة
          </button>
          <button onClick={() => { setCurrentView('pharmacies'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${currentView === 'pharmacies' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Building2 size={20} /> الصيدليات
          </button>
          <button onClick={() => { setCurrentView('demand'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${currentView === 'demand' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <PackageSearch size={20} /> طلبات السوق
          </button>
          <div className="pt-8 border-t border-gray-100 mt-4">
             <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50">
              <LogOut size={20} /> تسجيل خروج
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 transition-all duration-200">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden">
           <span className="font-bold text-indigo-600">لوحة تحكم راحة</span>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-md"><Menu size={24} /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* OVERVIEW VIEW */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">نظرة عامة</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 size={20} /></div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+4.5%</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">إجمالي الصيدليات</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{pharmacies.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={20} /></div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12.5%</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">إجمالي الأرصدة</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{(pharmacies.reduce((acc, p) => acc + p.balance, 0)).toLocaleString()} ج.س</p>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><PackageSearch size={20} /></div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">الطلبات المعلقة</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{demands.filter(d => d.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          )}

          {/* PHARMACIES VIEW */}
          {currentView === 'pharmacies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">إدارة الصيدليات</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  <Plus size={18} /> إضافة صيدلية
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">المفتاح</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الموقع</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pharmacies.map((p) => (
                        <tr key={p.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500">{p.contactEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm bg-gray-50">{p.uniqueKey}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{p.location}</td>
                          <td className={`px-6 py-4 whitespace-nowrap font-bold ${p.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {p.balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><Badge variant={p.status}>{p.status === 'active' ? 'نشط' : 'موقوف'}</Badge></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <button onClick={() => toggleStatus(p.id)} className={`p-1 rounded ${p.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                                {p.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DEMAND VIEW */}
          {currentView === 'demand' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">طلبات السوق (Wanted Lists)</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-100 text-sm">الأكثر طلباً</p>
                      <h3 className="text-2xl font-bold mt-1">Amoxicillin</h3>
                    </div>
                    <TrendingUp className="text-indigo-200" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">اسم الدواء</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الكمية المطلوبة</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {demands.map((d) => (
                      <tr key={d.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{d.medicineName}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold">{d.totalQuantity.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant={d.urgency}>{d.urgency}</Badge>
                        </td>
                        <td className="px-6 py-4">
                            <Badge variant={d.status}>{d.status === 'supplied' ? 'مورد' : 'قيد الانتظار'}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          {d.status === 'pending' && (
                            <button onClick={() => markSupplied(d.id)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium border border-indigo-200">
                              تحديد كمورد
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD PHARMACY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">إضافة صيدلية جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={addPharmacy} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصيدلية</label>
                <div className="relative">
                    <Store className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input required type="text" className="w-full pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={newPharm.name} onChange={e => setNewPharm({...newPharm, name: e.target.value})} placeholder="مثال: صيدلية النور" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                <div className="relative">
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input required type="text" className="w-full pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={newPharm.location} onChange={e => setNewPharm({...newPharm, location: e.target.value})} placeholder="المدينة، الحي" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input required type="email" className="w-full pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={newPharm.email} onChange={e => setNewPharm({...newPharm, email: e.target.value})} placeholder="admin@pharmacy.com" />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                 <Key className="text-blue-500 w-5 h-5 mt-0.5" />
                 <div className="text-sm text-blue-800">سيتم توليد مفتاح API فريد تلقائياً عند الحفظ.</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;