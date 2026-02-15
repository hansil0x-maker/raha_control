import React from 'react';
import { 
  Users, ShoppingCart, Activity, ArrowUpRight, TrendingUp, AlertCircle, 
  Search, Filter, Plus, XCircle, CheckCircle2, Wallet, PackageCheck, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pharmacy, DemandItem, CHART_DATA } from './data';

// --- UI Components ---

export const Badge = ({ children, variant }: { children: React.ReactNode, variant: string }) => {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
    suspended: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    pending: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-600/20",
    high: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    low: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
    supplied: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/10",
    default: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10"
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant] || styles.default}`}>{children}</span>;
};

export const Button = ({ children, onClick, variant = 'primary', className = '', type = "button" }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  return <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- Page Views ---

// 1. Overview View
export const OverviewView = ({ stats }: { stats: { pharmacies: number, balance: number, orders: number } }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">نظرة عامة</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 border border-gray-200 rounded-md shadow-sm">
          تحديث مباشر
        </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">+4.5% <ArrowUpRight size={12}/></span>
        </div>
        <h3 className="text-sm text-gray-500">إجمالي الصيدليات</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pharmacies}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={20} /></div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">+12% <ArrowUpRight size={12}/></span>
        </div>
        <h3 className="text-sm text-gray-500">إجمالي الأرصدة</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.balance.toLocaleString()} ج.س</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between mb-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity size={20} /></div>
        </div>
        <h3 className="text-sm text-gray-500">الطلبات المعلقة</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">نشاط المبيعات</h3>
      <div className="h-[300px] w-full dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Area type="monotone" dataKey="sales" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// 2. Pharmacies View
export const PharmaciesView = ({ 
  data, 
  onToggleStatus, 
  onAddClick 
}: { 
  data: Pharmacy[], 
  onToggleStatus: (id: string) => void, 
  onAddClick: () => void 
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const filtered = data.filter(p => p.name.includes(searchTerm) || p.uniqueKey.includes(searchTerm));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">إدارة الصيدليات</h1>
            <Button onClick={onAddClick}><Plus size={18} className="ms-2"/> إضافة صيدلية</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="بحث بالاسم أو الكود..." 
                    className="w-full pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <Button variant="outline"><Filter size={16} /></Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">الاسم</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">المفتاح (Key)</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">الموقع</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">الرصيد</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">الحالة</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.contactEmail}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs bg-gray-50/50">{p.uniqueKey}</td>
                        <td className="px-6 py-4 text-sm">{p.location}</td>
                        <td className={`px-6 py-4 font-bold text-sm ${p.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{p.balance.toLocaleString()}</td>
                        <td className="px-6 py-4"><Badge variant={p.status}>{p.status === 'active' ? 'نشط' : (p.status === 'suspended' ? 'موقوف' : 'قيد الانتظار')}</Badge></td>
                        <td className="px-6 py-4">
                        <button onClick={() => onToggleStatus(p.id)} className={`p-1 rounded ${p.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
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
    );
}

// 3. Demand View
export const DemandView = ({ data, onSupply }: { data: DemandItem[], onSupply: (id: string) => void }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h1 className="text-2xl font-bold text-gray-900">طلبات السوق (Wanted Lists)</h1>
    
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-6 flex justify-between items-center">
      <div>
        <p className="text-indigo-100 text-sm">الأكثر طلباً هذا الأسبوع</p>
        <h3 className="text-3xl font-bold mt-1">Amoxicillin</h3>
      </div>
      <TrendingUp size={32} className="text-indigo-200" />
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">الدواء</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">الكمية</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">الأولوية</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">الحالة</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{d.medicineName}</td>
                <td className="px-6 py-4 font-bold">{d.totalQuantity.toLocaleString()}</td>
                <td className="px-6 py-4"><Badge variant={d.urgency}>{d.urgency}</Badge></td>
                <td className="px-6 py-4"><Badge variant={d.status}>{d.status === 'supplied' ? 'تم التوريد' : 'قيد الانتظار'}</Badge></td>
                <td className="px-6 py-4">
                  {d.status === 'pending' && (
                    <button onClick={() => onSupply(d.id)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-xs font-medium border border-indigo-200 flex items-center gap-1">
                      <PackageCheck size={14}/> تحديد كمورد
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);