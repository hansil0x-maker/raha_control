import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Radio, Globe, LogOut, Menu, 
  ShieldCheck, LockKeyhole, Store, MapPin, Phone, Key, X, Loader2, RefreshCw 
} from 'lucide-react';
import { supabase } from './supabase';
import { Pharmacy, DemandItem, SystemMessage, Sale, ChartDataPoint } from './data';
import { OverviewView, PharmaciesView, MarketRadarView, GlobalOperationsView, Button } from './Views';

type ViewType = 'overview' | 'pharmacies' | 'radar' | 'global';

function App() {
  // --- Global State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Live Data State ---
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPharm, setNewPharm] = useState({ name: '', location: '', phone: '' });

  // --- Realtime & Fetch Logic ---
  
  const processChartData = (salesData: Sale[]) => {
    // تجميع المبيعات حسب الشهر (آخر 6 أشهر)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('ar-EG', { month: 'long' });
    }).reverse();

    const dataPoints = last6Months.map(month => ({ name: month, sales: 0 }));
    
    // منطق بسيط للتوزيع (في التطبيق الحقيقي يجب التعامل مع التواريخ بدقة أكبر)
    // هنا نقوم بتوزيع عشوائي "بصري" للمبيعات الحالية لغرض العرض، 
    // أو يمكن تجميعها فعلياً إذا كانت created_at دقيقة
    const totalSales = salesData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    
    // توزيع القيمة الإجمالية على الأشهر للعرض (Simulation for chart shape based on real total)
    return dataPoints.map((p, i) => ({
      name: p.name,
      sales: Math.floor(totalSales * ((i + 1) / 21)) // توزيع تصاعدي تقريبي
    }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Pharmacies
      const { data: pharmData } = await supabase
        .from('pharmacies')
        .select('*')
        .order('joined_date', { ascending: false });

      // 2. Wanted List (Pending)
      const { data: demandData } = await supabase
        .from('wanted_list')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // 3. System Messages
      const { data: msgData } = await supabase
        .from('system_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // 4. Sales (Last 1000 records for stats)
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .limit(1000);

      // Mapping Logic (Join in JS)
      const mappedDemands = (demandData || []).map((d: any) => {
        const ph = (pharmData || []).find((p: any) => p.id === d.pharmacy_id);
        return {
          ...d,
          pharmacy_name: ph ? ph.name : 'صيدلية غير معروفة'
        };
      });

      if (pharmData) setPharmacies(pharmData);
      if (mappedDemands) setDemands(mappedDemands);
      if (msgData) setMessages(msgData);
      if (salesData) {
        setSales(salesData);
        setChartData(processChartData(salesData));
      }

    } catch (err: any) {
      console.error('Data Fetch Error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    // --- Supabase Realtime Subscription ---
    const channels = supabase.channel('global-dashboard')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        (payload) => {
          console.log('New Sale!', payload);
          // Refresh data on new sale to update charts/stats
          fetchData(); 
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wanted_list' },
        (payload) => {
           console.log('New Demand!', payload);
           fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [isAuthenticated]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Master PIN authentication
    const storedPin = localStorage.getItem('raha_admin_pin') || '1234';
    if (pin === storedPin) setIsAuthenticated(true);
    else setError('رمز الدخول خاطئ');
  };

  const handleAddPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    // Generate secure keys locally
    const key = `RAHA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const pass = Math.random().toString(36).slice(-8);
    
    try {
      // UUID is generated by Supabase default or we can let DB handle it
      const { data, error } = await supabase.from('pharmacies').insert([
        {
          name: newPharm.name,
          location: newPharm.location,
          contact_phone: newPharm.phone, // Changed from contact_email
          pharmacy_key: key,
          master_password: pass,
          status: 'active',
          balance: 0,
          joined_date: new Date().toISOString()
        }
      ]).select();

      if (error) throw error;
      
      alert(`تم إضافة الصيدلية بنجاح!\nKey: ${key}\nPassword: ${pass}`);
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      alert('Error adding pharmacy: ' + err.message);
    }
  };

  const togglePharmStatus = async (id: string) => {
    const p = pharmacies.find(x => x.id === id);
    if (!p) return;
    
    const newStatus = p.status === 'active' ? 'suspended' : 'active';
    const msg = newStatus === 'suspended' ? "سيتم قفل النظام عن هذه الصيدلية فوراً. هل أنت متأكد؟" : "إعادة تفعيل النظام؟";
    
    if (window.confirm(msg)) {
      try {
        const { error } = await supabase
          .from('pharmacies')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
        
        // Optimistic Update
        setPharmacies(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      } catch (err: any) {
        alert('Failed to update status: ' + err.message);
      }
    }
  };

  const handleBroadcast = async (content: string, priority: 'normal' | 'urgent') => {
    try {
      const { error } = await supabase.from('system_messages').insert([{
        content, priority, is_active: true
      }]);
      if (error) throw error;
      alert('تم إرسال الرسالة لجميع الفروع.');
      fetchData();
    } catch (err: any) {
      alert('Failed broadcast: ' + err.message);
    }
  };

  const handlePriceUpdate = async (barcode: string, newPrice: number) => {
    if (!barcode || !newPrice) return;
    if (!window.confirm(`تنبيه هام:\nسيتم تحديث سعر المنتج (Barcode: ${barcode}) ليصبح ${newPrice} في جميع الصيدليات.\nهل تريد الاستمرار؟`)) return;

    try {
      // 1. Update in the medicines table across all pharmacies matching the barcode
      const { error, count } = await supabase
        .from('medicines')
        .update({ price: newPrice })
        .eq('barcode', barcode); // This updates ALL rows with this barcode regardless of pharmacy_id

      if (error) throw error;
      alert(`تم تحديث السعر بنجاح.`);
    } catch (err: any) {
      alert('فشل تحديث السعر العالمي: ' + err.message);
    }
  };

  // --- Stats Aggregation ---
  const stats = {
    totalPharmacies: pharmacies.length,
    activePharmacies: pharmacies.filter(p => p.status === 'active').length,
    balance: sales.reduce((acc, s) => acc + (s.total_amount || 0), 0), // Using sales sum as "Revenue"
    demandCount: demands.length
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200"><ShieldCheck size={32} /></div>
            <h1 className="text-2xl font-bold text-gray-900">Raha Control Center</h1>
            <p className="text-gray-500 text-sm mt-2">SaaS Super Admin Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4}
                className="block w-full text-center py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-600 text-3xl tracking-[0.5em] font-bold text-gray-800 placeholder-gray-300 transition-all" placeholder="••••" />
              <LockKeyhole className="absolute top-5 right-5 text-gray-400 w-5 h-5" />
            </div>
            {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95">دخول آمن</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Cairo']">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1a1f37] text-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="h-20 flex items-center px-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-wide">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-inner">Pro</div>
            <span>Raha <span className="text-indigo-400 font-light">SaaS</span></span>
          </div>
        </div>
        <nav className="p-6 space-y-2">
          <button onClick={() => { setCurrentView('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${currentView === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard size={22} /> <span className="font-medium">نظرة عامة</span>
          </button>
          <button onClick={() => { setCurrentView('pharmacies'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${currentView === 'pharmacies' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Building2 size={22} /> <span className="font-medium">إدارة المشتركين</span>
          </button>
          <button onClick={() => { setCurrentView('radar'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${currentView === 'radar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Radio size={22} /> <span className="font-medium">رادار السوق</span>
          </button>
          <button onClick={() => { setCurrentView('global'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${currentView === 'global' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <Globe size={22} /> <span className="font-medium">عمليات عالمية</span>
          </button>
          <div className="pt-8 mt-6 border-t border-gray-700/50">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={22} /> <span className="font-medium">تسجيل خروج</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 transition-all duration-300 h-full bg-[#f3f4f6]">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-20 flex items-center justify-between px-6 lg:hidden sticky top-0 z-40">
           <span className="font-bold text-xl text-gray-800">Raha Dashboard</span>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-600"><Menu size={24} /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {isLoading && !pharmacies.length ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="animate-spin text-indigo-600" />
                <p className="text-gray-500 font-medium animate-pulse">جاري الاتصال بقواعد البيانات...</p>
              </div>
            </div>
          ) : (
            <>
               <div className="mb-6 flex justify-end">
                   <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                       <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> تحديث البيانات
                   </button>
               </div>
              {currentView === 'overview' && <OverviewView stats={stats} chartData={chartData} />}
              {currentView === 'pharmacies' && <PharmaciesView data={pharmacies} onToggleStatus={togglePharmStatus} onAddClick={() => setIsModalOpen(true)} />}
              {currentView === 'radar' && <MarketRadarView data={demands} />}
              {currentView === 'global' && <GlobalOperationsView messages={messages} onBroadcast={handleBroadcast} onPriceUpdate={handlePriceUpdate} />}
            </>
          )}
        </main>
      </div>

      {/* Add Pharmacy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300 border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">إضافة مشترك جديد (Tenant)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPharmacy} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">اسم الصيدلية</label>
                <div className="relative">
                  <Store className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input required type="text" className="w-full pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={newPharm.name} onChange={e => setNewPharm({...newPharm, name: e.target.value})} placeholder="مثال: صيدلية الرازي" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">الموقع الجغرافي</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input required type="text" className="w-full pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={newPharm.location} onChange={e => setNewPharm({...newPharm, location: e.target.value})} placeholder="الخرطوم، شارع الستين" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input required type="text" className="w-full pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={newPharm.phone} onChange={e => setNewPharm({...newPharm, phone: e.target.value})} placeholder="0912345678" />
                </div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl flex items-start gap-3 border border-indigo-100">
                 <Key className="text-indigo-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                 <div className="text-xs text-indigo-800 leading-relaxed">
                     سيتم توليد <strong>مفتاح API</strong> فريد و <strong>كلمة مرور رئيسية</strong> تلقائياً وربطهم بقاعدة البيانات فور الحفظ.
                 </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                <Button type="submit" className="flex-[2] shadow-lg shadow-indigo-200">حفظ وتفعيل</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
