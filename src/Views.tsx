import React, { useState } from 'react';
import { 
  Users, Activity, ArrowUpRight, TrendingUp, Search, Filter, Plus, 
  XCircle, CheckCircle2, Wallet, Lock, Unlock, Key, Radio, Tag, Megaphone, Send, AlertTriangle, CloudLightning, MapPin, Phone
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pharmacy, DemandItem, SystemMessage, ChartDataPoint } from './data';

// --- UI Components ---

export const Badge = ({ children, variant }: { children: React.ReactNode, variant: string }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    suspended: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    high: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    low: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    urgent: "bg-red-100 text-red-800 font-bold",
    normal: "bg-gray-100 text-gray-800",
    default: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10"
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant] || styles.default}`}>{children}</span>;
};

export const Button = ({ children, onClick, variant = 'primary', className = '', type = "button", disabled = false }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- Page Views ---

// 1. Overview
export const OverviewView = ({ stats, chartData }: { stats: any, chartData: ChartDataPoint[] }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between mb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24} /></div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1"><CloudLightning size={12}/> متصل</span>
        </div>
        <h3 className="text-sm font-medium text-gray-500">الصيدليات النشطة</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stats.activePharmacies} <span className="text-gray-400 text-lg font-normal">/ {stats.totalPharmacies}</span></p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet size={24} /></div>
        </div>
        <h3 className="text-sm font-medium text-gray-500">إجمالي المبيعات (SaaS)</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stats.balance.toLocaleString()} <span className="text-xs text-gray-400">ج.س</span></p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between mb-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Activity size={24} /></div>
        </div>
        <h3 className="text-sm font-medium text-gray-500">طلبات السوق (Wanted List)</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stats.demandCount}</p>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
         <h3 className="text-lg font-bold text-gray-900">تحليل نمو المبيعات (Network-wide)</h3>
         <div className="text-sm text-gray-400">آخر 6 أشهر</div>
      </div>
      <div className="h-[300px] w-full dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
            <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// 2. Pharmacies
export const PharmaciesView = ({ data, onToggleStatus, onAddClick }: { data: Pharmacy[], onToggleStatus: (id: string) => void, onAddClick: () => void }) => {
    const [search, setSearch] = useState('');
    const filtered = data.filter(p => 
        (p.name && p.name.includes(search)) || 
        (p.pharmacy_key && p.pharmacy_key.includes(search))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">إدارة المشتركين (Tenants)</h1>
                   <p className="text-gray-500 text-sm mt-1">التحكم في الوصول والحالة لجميع الصيدليات المسجلة</p>
                </div>
                <Button onClick={onAddClick}><Plus size={18} className="ms-2"/> إضافة صيدلية</Button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="ابحث بالاسم، الكود، أو البريد..." className="w-full pr-12 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-right">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">معلومات الصيدلية</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">بيانات الدخول (API Key)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">نظام القفل (Kill Switch)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                                        <div className="bg-gray-100 p-3 rounded-full"><Search size={24}/></div>
                                        <span>لا توجد بيانات صيدليات مطابقة</span>
                                    </td>
                                </tr>
                            )}
                            {filtered.map((p) => (
                                <tr key={p.id} className={`transition-colors ${p.status === 'suspended' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10}/> {p.contact_phone || 'غير محدد'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg w-fit border border-gray-200 flex items-center gap-2 text-gray-600 select-all">
                                                <Key size={12}/> {p.pharmacy_key}
                                            </div>
                                            <div className="text-[10px] text-gray-400">Pass: {p.master_password || '********'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Badge variant={p.status}>{p.status === 'active' ? 'نظام نشط' : 'تم الإيقاف'}</Badge></td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onToggleStatus(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${p.status === 'active' ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}>
                                            {p.status === 'active' ? <><Lock size={16} /> تعطيل النظام</> : <><Unlock size={16} /> استعادة الخدمة</>}
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

// 3. Market Radar
export const MarketRadarView = ({ data }: { data: DemandItem[] }) => {
    const uniquePharmacies = new Set(data.map(d => d.pharmacy_id)).size;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-900">رادار السوق (Live Market Radar)</h1>
            <div className="bg-gradient-to-r from-[#1e1b4b] to-[#312e81] rounded-2xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">مراقبة حية للطلبات</p>
                        </div>
                        <h3 className="text-2xl font-bold">يتم تجميع الطلبات الآن من <span className="text-yellow-400 text-3xl mx-1">{uniquePharmacies}</span> صيدليات</h3>
                        <p className="text-indigo-300 text-sm mt-1 max-w-lg">يظهر هذا الجدول الأدوية التي تم وضع علامة "نفاد كمية" عليها في تطبيقات العملاء بشكل فوري.</p>
                    </div>
                    <Radio className="text-indigo-500/20 absolute -left-10 -bottom-10 w-64 h-64 animate-pulse" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المنتج المطلوب</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الكمية</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المصدر (الصيدلية)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">درجة الإلحاح</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">وقت الطلب</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle2 size={32} className="mb-2 text-green-500 opacity-50"/>
                                        لا توجد نواقص معلقة حالياً في السوق
                                    </div>
                                </td>
                            </tr>
                        )}
                        {data.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{d.item_name}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-indigo-600 text-lg">{d.request_count}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{d.pharmacy_name}</td>
                                <td className="px-6 py-4"><Badge variant={d.urgency || 'low'}>{d.urgency || 'Normal'}</Badge></td>
                                <td className="px-6 py-4 text-xs text-gray-500">{new Date(d.created_at).toLocaleString('ar-EG')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 4. Global Operations
export const GlobalOperationsView = ({ 
    messages, 
    onBroadcast, 
    onPriceUpdate 
}: { 
    messages: SystemMessage[], 
    onBroadcast: (msg: string, priority: 'normal'|'urgent') => void,
    onPriceUpdate: (barcode: string, price: number) => void
}) => {
    const [msg, setMsg] = useState('');
    const [priority, setPriority] = useState<'normal'|'urgent'>('normal');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">مركز العمليات (Global Operations)</h1>
                <p className="text-gray-500 mt-1">إجراء تغييرات جذرية على مستوى الشبكة بالكامل</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Price Update */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 border-t-4 border-t-blue-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Tag size={24} /></div>
                        <div>
                            <h3 className="text-lg font-bold">تحديث الأسعار المركزي</h3>
                            <p className="text-xs text-gray-500">ينعكس فوراً على جميع الصيدليات</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="text-sm text-blue-800 bg-blue-50 p-4 rounded-xl flex gap-3 leading-relaxed border border-blue-100">
                           <AlertTriangle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                           <span><strong>تحذير:</strong> هذا الإجراء سيقوم بالبحث عن الباركود المدخل في قواعد بيانات جميع الصيدليات وتحديث السعر لديهم فوراً.</span>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">الباركود (Barcode)</label>
                            <input type="text" value={barcode} onChange={e=>setBarcode(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Scan or enter barcode" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">السعر الجديد (SDG)</label>
                            <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="0.00" />
                        </div>
                        <Button onClick={() => { onPriceUpdate(barcode, Number(price)); setBarcode(''); setPrice(''); }} disabled={!barcode || !price} className="w-full py-3 bg-blue-600 hover:bg-blue-700">تحديث السعر للجميع</Button>
                    </div>
                </div>

                {/* Broadcast System */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 border-t-4 border-t-purple-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Megaphone size={24} /></div>
                        <div>
                            <h3 className="text-lg font-bold">نظام البث المباشر</h3>
                            <p className="text-xs text-gray-500">إرسال إشعارات للنظام</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">نص الرسالة</label>
                            <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none" placeholder="اكتب رسالة لتظهر في شريط التنبيهات..." />
                        </div>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium hover:text-purple-700">
                                <input type="radio" name="prio" checked={priority==='normal'} onChange={()=>setPriority('normal')} className="text-purple-600 focus:ring-purple-500" /> عادي
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer font-medium hover:text-red-700">
                                <input type="radio" name="prio" checked={priority==='urgent'} onChange={()=>setPriority('urgent')} className="text-red-600 focus:ring-red-500" /> <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">عاجل</span>
                            </label>
                        </div>
                        <Button onClick={() => { onBroadcast(msg, priority); setMsg(''); }} disabled={!msg} variant="outline" className="w-full py-3 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300">
                            <Send size={18} className="ms-2"/> إرسال للشبكة
                        </Button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">سجل الرسائل المرسلة</h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                            {messages.map(m => (
                                <div key={m.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                                    <span className="text-gray-700 line-clamp-1">{m.content}</span>
                                    <Badge variant={m.priority}>{m.priority}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
