import React, { useState } from 'react';
import { 
  LayoutDashboard, Building2, PackageSearch, LogOut, Menu, 
  ShieldCheck, LockKeyhole, Store, MapPin, Mail, Key, X 
} from 'lucide-react';
import { MOCK_PHARMACIES, MOCK_DEMAND, Pharmacy, DemandItem } from './data';
import { OverviewView, PharmaciesView, DemandView, Button } from './Views';

// State Types
type ViewType = 'overview' | 'pharmacies' | 'demand';

function App() {
  // --- Global State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- Data State ---
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [demands, setDemands] = useState<DemandItem[]>(MOCK_DEMAND);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPharm, setNewPharm] = useState({ name: '', location: '', email: '' });

  // --- Actions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') setIsAuthenticated(true);
    else setError('رمز الدخول خاطئ');
  };

  const handleAddPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Pharmacy = {
      id: Date.now().toString(),
      name: newPharm.name,
      location: newPharm.location,
      contactEmail: newPharm.email,
      uniqueKey: `RAHA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'active',
      joinedDate: new Date().toISOString(),
      balance: 0
    };
    setPharmacies([newItem, ...pharmacies]);
    setIsModalOpen(false);
    setNewPharm({ name: '', location: '', email: '' });
  };

  const togglePharmStatus = (id: string) => {
    setPharmacies(pharmacies.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'suspended' : 'active' } : p));
  };

  const supplyDemand = (id: string) => {
    setDemands(demands.map(d => d.id === id ? { ...d, status: 'supplied' } : d));
  };

  // --- Stats Calculation ---
  const stats = {
    pharmacies: pharmacies.length,
    balance: pharmacies.reduce((acc, p) => acc + p.balance, 0),
    orders: demands.filter(d => d.status === 'pending').length
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><ShieldCheck size={32} /></div>
            <h1 className="text-2xl font-bold text-gray-900">مركز تحكم راحة</h1>
            <p className="text-gray-500 text-sm mt-2">بوابة المشرف العام</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4}
                className="block w-full text-center py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 text-2xl tracking-widest placeholder-gray-300" placeholder="••••" />
              <LockKeyhole className="absolute top-4 right-4 text-gray-400 w-5 h-5" />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold transition">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
          <div className="pt-8 mt-4 border-t border-gray-100">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50">
              <LogOut size={20} /> تسجيل خروج
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 transition-all duration-200 h-full">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden flex-shrink-0">
           <span className="font-bold text-indigo-600">لوحة تحكم راحة</span>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-md"><Menu size={24} /></button>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {currentView === 'overview' && <OverviewView stats={stats} />}
          {currentView === 'pharmacies' && <PharmaciesView data={pharmacies} onToggleStatus={togglePharmStatus} onAddClick={() => setIsModalOpen(true)} />}
          {currentView === 'demand' && <DemandView data={demands} onSupply={supplyDemand} />}
        </main>
      </div>

      {/* Add Pharmacy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">إضافة صيدلية جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPharmacy} className="p-6 space-y-4">
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="flex-1">حفظ</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;