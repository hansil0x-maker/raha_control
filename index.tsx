import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
    LayoutDashboard, Building2, Radio, Globe, LogOut, Menu,
    ShieldCheck, LockKeyhole, Search, Plus,
    Wallet, Lock, Unlock, Tag, Megaphone, Send, AlertTriangle, CloudLightning,
    FileSpreadsheet, BarChart3, AlertOctagon, ArrowUpRight,
    History, DollarSign, Command, X, RefreshCw, Loader2, Activity, Users, TrendingUp, Key,
    Smartphone, Eye, Clock, Database, ShieldAlert, Laptop, Phone, MapPin
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://cihficjizojbtnshwtfl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9Nmdm3LJUHK1fBF0ihj38g_ophBRHyD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- TYPES ---
type ViewType = 'overview' | 'pharmacies' | 'radar' | 'global' | 'security';
type Priority = 'normal' | 'urgent';

interface Pharmacy {
    id: string;
    name: string;
    pharmacy_key: string;
    master_password?: string;
    status: 'active' | 'suspended';
    location?: string;
    contact_phone?: string;
    balance: number;
    joined_date?: string;
    last_active?: string; // Phase 5 Add
}

interface Device {
    id: string;
    pharmacy_id: string;
    hardware_id: string;
    device_name: string;
    last_login: string;
}

interface InventoryItem {
    id: string;
    name: string;
    price: number;
    cost_price: number;
    supplier: string;
    stock: number;
}

interface DemandItem {
    id: string;
    item_name: string; // Changed from medicine_name to match Supabase
    request_count: number; // Changed from quantity to match Supabase
    pharmacy_id: string;
    pharmacy_name?: string;
    status: 'pending' | 'supplied' | 'received';
    notes?: string;
    created_at: string;
}

interface Sale {
    id: string;
    pharmacy_id: string;
    total_amount: number;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    user: string;
}

// --- UTILS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', maximumFractionDigits: 0 }).format(amount);
};

const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- COMPONENTS ---

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`glass-card rounded-2xl p-6 border border-slate-700/50 ${className}`}>
        {children}
    </div>
);

const Badge = ({ variant, children }: { variant: string, children: React.ReactNode }) => {
    const styles: any = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        suspended: "bg-red-500/10 text-red-400 border-red-500/20",
        high: "bg-red-500/10 text-red-400 border-red-500/20",
        medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        urgent: "bg-red-600 text-white font-bold animate-pulse",
        normal: "bg-slate-700 text-slate-300",
        online: "bg-emerald-500/20 text-emerald-400 flex items-center gap-1",
        offline: "bg-slate-700 text-slate-400",
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[variant] || styles.normal}`}>
            {children}
        </span>
    );
};

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled }: any) => {
    const variants: any = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50",
        outline: "bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800",
        ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50"
    };

    const renderIcon = () => {
        if (!Icon) return null;
        if (React.isValidElement(Icon)) return Icon;
        const IconComp = Icon;
        return <IconComp size={16} />;
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {renderIcon()}
            {children}
        </button>
    );
};

// --- VIEWS ---

const Overview = ({ pharmacies, sales }: { pharmacies: Pharmacy[], sales: Sale[] }) => {
    const totalSales = sales.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const criticalCount = pharmacies.filter(p => p.balance < 0).length;

    const salesByMonth = useMemo(() => {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
        // تجميع المبيعات حقيقياً حسب الشهر (مثال بسيط بناءً على البيانات المتوفرة)
        return months.map((m) => ({
            name: m,
            value: sales.length > 0 ? (totalSales / months.length) : 0 // توزيع تقديري إذا لم يتوفر تاريخ دقيق لكل شهر، أو 0 إذا لا توجد مبيعات
        }));
    }, [totalSales, sales]);

    const topPharmacies = useMemo(() => {
        return pharmacies
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 5)
            .map(p => ({ name: p.name, value: p.balance }));
    }, [pharmacies]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><Users size={80} className="text-indigo-400" /></div>
                    <div className="flex items-center gap-3 mb-2 text-indigo-400"><Building2 size={20} /><span className="text-sm font-medium">الشبكة الطبية</span></div>
                    <div className="text-3xl font-bold text-white mb-1">{pharmacies.length}</div>
                    <div className="text-xs text-slate-400">صيدلية مسجلة</div>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><Wallet size={80} className="text-emerald-400" /></div>
                    <div className="flex items-center gap-3 mb-2 text-emerald-400"><Activity size={20} /><span className="text-sm font-medium">إجمالي التداول</span></div>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalSales)}</div>
                    <div className="text-xs text-emerald-500 flex items-center gap-1"><ArrowUpRight size={12} /> +12.5%</div>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><AlertOctagon size={80} className="text-red-400" /></div>
                    <div className="flex items-center gap-3 mb-2 text-red-400"><AlertTriangle size={20} /><span className="text-sm font-medium">تنبيهات حرجة</span></div>
                    <div className="text-3xl font-bold text-white mb-1">{criticalCount}</div>
                    <div className="text-xs text-red-400">حسابات مكشوفة</div>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><CloudLightning size={80} className="text-amber-400" /></div>
                    <div className="flex items-center gap-3 mb-2 text-amber-400"><TrendingUp size={20} /><span className="text-sm font-medium">المبيعات اليومية</span></div>
                    <div className="text-3xl font-bold text-white mb-1">245</div>
                    <div className="text-xs text-slate-400">عملية بيع</div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="text-indigo-400" /> التحليل المالي</h3>
                    </div>
                    <div className="h-[300px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesByMonth}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#818cf8' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="min-h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><DollarSign className="text-emerald-400" /> الأعلى أداءً</h3>
                    <div className="space-y-4">
                        {topPharmacies.map((p, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between text-xs mb-1 text-slate-300">
                                    <span>{p.name}</span>
                                    <span className="font-mono text-emerald-400">{formatCurrency(p.value)}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: `${(p.value / (topPharmacies[0]?.value || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const PharmacyDetailModal = ({ pharmacy, onClose, sales, devices, inventory }: { pharmacy: Pharmacy, onClose: () => void, sales: Sale[], devices: Device[], inventory: InventoryItem[] }) => {
    // Calculate Peak Hours from Sales
    const peakHoursData = useMemo(() => {
        const hours = Array(24).fill(0).map((_, i) => ({ name: `${i}:00`, count: 0 }));
        const pSales = sales.filter(s => s.pharmacy_id === pharmacy.id);

        if (pSales.length > 0) {
            pSales.forEach(s => {
                const hour = new Date(s.created_at).getHours();
                hours[hour].count += 1;
            });
        }
        return hours;
    }, [sales, pharmacy.id]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <GlassCard className="w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col p-0 border-slate-600 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">{pharmacy.name.charAt(0)}</div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {pharmacy.name}
                                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">ID: {pharmacy.id}</span>
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {pharmacy.location}</span>
                                <span className="flex items-center gap-1"><Key size={12} /> {pharmacy.pharmacy_key}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <GlassCard className="lg:col-span-1 p-0 overflow-hidden flex flex-col h-full bg-slate-800/20">
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/40">
                                <h3 className="font-bold text-slate-200 flex items-center gap-2"><Smartphone size={16} className="text-blue-400" /> الأجهزة الموثوقة</h3>
                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{devices.length} Devices</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {devices.map(d => (
                                    <div key={d.id} className="p-4 border-b border-slate-700/50 flex justify-between items-center hover:bg-slate-700/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Laptop size={18} className="text-slate-500" />
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{d.device_name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono italic">{d.hardware_id}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="online">Online</Badge>
                                            <div className="text-[10px] text-slate-500 mt-1">{new Date(d.last_login).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="lg:col-span-2 flex flex-col h-full bg-slate-800/20">
                            <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-400" /> ساعات الذروة (Peak Hours)</h3>
                            <div className="flex-1 w-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={peakHoursData}>
                                        <defs>
                                            <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={2} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fbbf24' }} />
                                        <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#colorPeak)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-0 overflow-hidden bg-slate-800/20">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/40">
                            <h3 className="font-bold text-slate-200 flex items-center gap-2"><Eye size={16} className="text-red-400" /> مخزون المراقبة (Inventory Spy)</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" className="text-xs h-8">تحميل تقرير كامل</Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">الصنف</th>
                                        <th className="px-6 py-3">المخزون</th>
                                        <th className="px-6 py-3">سعر البيع</th>
                                        <th className="px-6 py-3 text-red-300">التكلفة الشاملة</th>
                                        <th className="px-6 py-3 text-indigo-300">المورد</th>
                                        <th className="px-6 py-3">الهامش</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {inventory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-200">{item.name}</td>
                                            <td className="px-6 py-3">{item.stock}</td>
                                            <td className="px-6 py-3 font-mono">{item.price}</td>
                                            <td className="px-6 py-3 font-mono text-red-300">{item.cost_price}</td>
                                            <td className="px-6 py-3 text-indigo-300">{item.supplier}</td>
                                            <td className="px-6 py-3 font-mono text-emerald-400">
                                                {item.price > 0 ? Math.round(((item.price - item.cost_price) / item.price) * 100) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                </div>
            </GlassCard>
        </div>
    );
};

const PharmaciesView = ({ data, onUpdateStatus, onAdd, sales }: { data: Pharmacy[], onUpdateStatus: any, onAdd: any, sales: Sale[] }) => {
    const [search, setSearch] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [activeDevices, setActiveDevices] = useState<Device[]>([]);
    const [activeInventory, setActiveInventory] = useState<InventoryItem[]>([]);

    const filtered = data.filter(p => p.name.includes(search) || p.pharmacy_key.includes(search));

    const handleOpenDetail = async (pharmacy: Pharmacy) => {
        const { data: devData } = await supabase.from('pharmacy_devices').select('*').eq('pharmacy_id', pharmacy.id);
        const { data: invData } = await supabase.from('medicines').select('*').eq('pharmacy_id', pharmacy.id).limit(10);
        setActiveDevices(devData || []);
        setActiveInventory(invData || []);
        setSelectedPharmacy(pharmacy);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">إدارة المشتركين</h2>
                    <p className="text-slate-400 text-xs">تتبع الأجهزة والنشاط الحيوي لكل صيدلية</p>
                </div>
                <Button onClick={onAdd} icon={Plus}>إضافة صيدلية</Button>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-3 text-slate-500" size={18} />
                        <input type="text" placeholder="بحث باسم الصيدلية أو المفتاح..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pr-10 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">الصيدلية / آخر ظهور</th>
                                <th className="px-6 py-4">المفتاح</th>
                                <th className="px-6 py-4">الرصيد</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filtered.map(p => (
                                <tr key={p.id} onClick={() => handleOpenDetail(p)} className="hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                            {p.name} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-xs text-slate-500">{p.contact_phone}</div>
                                        <div className="text-[10px] text-emerald-500 font-bold mt-1">
                                            {p.last_active ? `نشط منذ: ${new Date(p.last_active).toLocaleString('ar-EG')}` : 'لم يبدأ النشاط بعد'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><code className="bg-slate-900 px-2 py-1 rounded text-xs text-slate-400 font-mono border border-slate-800">{p.pharmacy_key}</code></td>
                                    <td className="px-6 py-4">
                                        <div className={`font-mono font-bold ${p.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(p.balance)}</div>
                                    </td>
                                    <td className="px-6 py-4"><Badge variant={p.status}>{p.status === 'active' ? 'نشط' : 'معطل'}</Badge></td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => onUpdateStatus(p.id)} className={`p-2 rounded-lg transition-colors ${p.status === 'active' ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                                            {p.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {selectedPharmacy && (
                <PharmacyDetailModal
                    pharmacy={selectedPharmacy}
                    onClose={() => setSelectedPharmacy(null)}
                    sales={sales}
                    devices={activeDevices}
                    inventory={activeInventory}
                />
            )}
        </div>
    );
};

const MarketRadar = ({ demands, pharmacies }: { demands: DemandItem[], pharmacies: Pharmacy[] }) => {
    const [addMode, setAddMode] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', qty: '', pharm_id: '' });

    const handleAddShortage = async () => {
        const exists = demands.find(d =>
            d.item_name.toLowerCase() === newItem.name.toLowerCase() &&
            d.pharmacy_id === newItem.pharm_id
        );

        if (exists) {
            alert('تنبيه الرادار الذكي: هذا الصنف مسجل بالفعل كـ "ناقص" لهذه الصيدلية. لا يمكن التكرار.');
            return;
        }

        const { error } = await supabase.from('wanted_list').insert([{
            item_name: newItem.name,
            request_count: Number(newItem.qty),
            pharmacy_id: newItem.pharm_id,
            status: 'pending',
            created_at: new Date().toISOString()
        }]);

        if (!error) {
            alert('تم إضافة الناقص بنجاح');
            setAddMode(false);
            setNewItem({ name: '', qty: '', pharm_id: '' });
        } else {
            alert('خطأ في الإضافة');
        }
    };

    const topMedicines = useMemo(() => {
        const counts: Record<string, number> = {};
        demands.forEach(d => { counts[d.item_name] = (counts[d.item_name] || 0) + d.request_count; });
        return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({ name, count }));
    }, [demands]);

    const handleExport = () => {
        const exportData = demands.map(d => ({ Medicine: d.item_name, Quantity: d.request_count, Pharmacy: d.pharmacy_name }));
        downloadCSV(exportData, 'market_demand.csv');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Radio className="text-indigo-400 animate-pulse" /> رادار النواقص الذكي</h2>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Plus} onClick={() => setAddMode(!addMode)}>إضافة يدوياً</Button>
                    <Button variant="outline" icon={FileSpreadsheet} onClick={handleExport}>تصدير Excel</Button>
                </div>
            </div>

            {addMode && (
                <GlassCard className="border-indigo-500/50 bg-indigo-900/10 animate-in slide-in-from-top duration-300">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ShieldAlert className="text-indigo-400" /> إضافة ناقص جديد (Deduplication Check Active)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">اسم الدواء</label>
                            <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="الاسم..." />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">الكمية المطلوبة</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">الصيدلية المستهدفة</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" value={newItem.pharm_id} onChange={e => setNewItem({ ...newItem, pharm_id: e.target.value })}>
                                <option value="">اختر صيدلية...</option>
                                {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleAddShortage}>تحقق وحفظ</Button>
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-1 border-indigo-500/30">
                    <h3 className="text-sm font-bold text-indigo-300 mb-4 uppercase tracking-wider">الأكثر طلباً (Aggregate)</h3>
                    <div className="h-[250px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMedicines} layout="vertical" margin={{ left: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topMedicines.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
                <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center"><span className="text-sm font-bold text-slate-300">طلبات السوق الموحدة</span><Badge variant="active">{demands.length}</Badge></div>
                    <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-800/30 text-slate-400 sticky top-0 backdrop-blur-md"><tr><th className="px-4 py-3">الصنف</th><th className="px-4 py-3">عدد الطلبات</th><th className="px-4 py-3">الصيدلية</th><th className="px-4 py-3">الحالة</th></tr></thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {demands.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-700/20">
                                        <td className="px-4 py-3 text-slate-200">{d.item_name}</td>
                                        <td className="px-4 py-3 font-mono text-indigo-300">{d.request_count}</td>
                                        <td className="px-4 py-3 text-slate-400">{d.pharmacy_name}</td>
                                        <td className="px-4 py-3"><Badge variant="normal">{d.status}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const SecurityPanel = ({ pharmacies, onUpdatePass }: { pharmacies: Pharmacy[], onUpdatePass: (id: string, pass: string) => void }) => {
    const [adminPass, setAdminPass] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [newMasterPass, setNewMasterPass] = useState('');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-emerald-500" /> مجمع الحماية والأمان</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="border-l-4 border-l-emerald-500">
                    <h3 className="text-lg font-bold text-white mb-4">تغيير رمز دخول المشرف</h3>
                    <div className="space-y-4">
                        <input type="password" placeholder="الرمز السداسي الجديد" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={() => { localStorage.setItem('raha_admin_pin', adminPass); alert('تم تحديث الرمز'); setAdminPass(''); }}>حفظ التغيير</Button>
                    </div>
                </GlassCard>

                <GlassCard className="border-l-4 border-l-indigo-500">
                    <h3 className="text-lg font-bold text-white mb-4">تعديل Master Password الموحد</h3>
                    <div className="space-y-4">
                        <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                            <option value="">اختر صيدلية للتدخل...</option>
                            {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="text" placeholder="كلمة المرور الجديدة" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" value={newMasterPass} onChange={e => setNewMasterPass(e.target.value)} />
                        <Button className="w-full" disabled={!selectedId || !newMasterPass} onClick={() => { onUpdatePass(selectedId, newMasterPass); setNewMasterPass(''); setSelectedId(''); }}>إعادة تعيين فورية</Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const CommandCenter = ({ onPriceUpdate, onBroadcast, logs }: { onPriceUpdate: any, onBroadcast: any, logs: AuditLog[] }) => {
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [msg, setMsg] = useState('');
    const [prio, setPrio] = useState<Priority>('normal');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Command className="text-red-500" /> العمليات المركزية</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-lg bg-blue-500/20 text-blue-400"><Tag size={24} /></div><div><h3 className="text-lg font-bold text-white">إجبار تسعيرة (Force Sync)</h3></div></div>
                    <div className="space-y-4">
                        <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none" placeholder="أدخل الباركود..." />
                        <div className="flex gap-2">
                            <input value={price} onChange={e => setPrice(e.target.value)} type="number" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none" placeholder="السعر الجديد..." />
                            <Button onClick={() => { onPriceUpdate(barcode, price); setBarcode(''); setPrice(''); }} className="bg-blue-600 hover:bg-blue-500">تطبيق عام</Button>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-lg bg-red-500/20 text-red-400"><Megaphone size={24} /></div><div><h3 className="text-lg font-bold text-white">الرسائل العاجلة</h3></div></div>
                    <div className="space-y-4">
                        <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none resize-none h-24" placeholder="اكتب نصاً ليظهر لجميع المستخدمين..." />
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="radio" checked={prio === 'normal'} onChange={() => setPrio('normal')} className="accent-blue-500" /> تنويه</label>
                                <label className="flex items-center gap-2 text-sm text-red-400 font-bold cursor-pointer"><input type="radio" checked={prio === 'urgent'} onChange={() => setPrio('urgent')} className="accent-red-500" /> عاجل جداً</label>
                            </div>
                            <Button onClick={() => { onBroadcast(msg, prio); setMsg(''); }} variant="danger" icon={Send}>إرسال للبشرية</Button>
                        </div>
                    </div>
                </GlassCard>
            </div>
            <GlassCard className="mt-8">
                <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2"><History size={16} /> سجل تتبع المدير</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {logs.map(log => (
                        <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
                            <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span className="text-slate-200 font-medium">{log.action}</span><span className="text-slate-500 text-xs">{log.details}</span></div>
                            <span className="text-slate-600 font-mono text-xs">{log.timestamp}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [view, setView] = useState<ViewType>('overview');
    const [loading, setLoading] = useState(false);

    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [demands, setDemands] = useState<DemandItem[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPharm, setNewPharm] = useState({ name: '', location: '', phone: '' });

    const addLog = (action: string, details: string) => {
        setLogs(prev => [{ id: Math.random().toString(), action, details, timestamp: new Date().toLocaleTimeString(), user: 'Super Admin' }, ...prev]);
    };

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
            });
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: phData } = await supabase.from('pharmacies').select('*');
            const { data: demData } = await supabase.from('wanted_list').select('*').eq('status', 'pending');
            const { data: salesData } = await supabase.from('sales').select('*').limit(1000).order('timestamp', { ascending: false });

            if (phData) setPharmacies(phData.map((p: any) => ({ ...p, status: p.balance < 0 ? 'suspended' : p.status })));
            if (demData) setDemands(demData.map((d: any) => ({ ...d, pharmacy_name: phData?.find((p: any) => p.id === d.pharmacy_id)?.name || 'Unknown' })));
            if (salesData) setSales(salesData.map((s: any) => ({ id: s.id, pharmacy_id: s.pharmacy_id, total_amount: s.net_amount, created_at: new Date(Number(s.timestamp)).toISOString() })));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            const channel = supabase.channel('realtime_admin').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
            return () => { supabase.removeChannel(channel) };
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const savedPin = localStorage.getItem('raha_admin_pin') || '1234';
        if (pin === savedPin) setIsAuthenticated(true); else alert('الرمز غير صحيح');
    };

    const handleAddPharmacy = async () => {
        const key = `RAHA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const { error } = await supabase.from('pharmacies').insert([{ name: newPharm.name, location: newPharm.location, contact_phone: newPharm.phone, pharmacy_key: key, status: 'active', balance: 0, joined_date: new Date().toISOString() }]);
        if (!error) { alert(`تم إنشاء الصيدلية بنجاح. رمز القفل: ${key}`); setShowAddModal(false); addLog('إضافة صيدلية', newPharm.name); fetchData(); }
    };

    const toggleStatus = async (id: string) => {
        const p = pharmacies.find(x => x.id === id);
        if (!p) return;
        const newStatus = p.status === 'active' ? 'suspended' : 'active';
        if (confirm(`هل تريد فعلاً ${newStatus === 'suspended' ? 'تعطيل' : 'تنشيط'} ${p.name}؟`)) {
            await supabase.from('pharmacies').update({ status: newStatus }).eq('id', id);
            addLog('تغيير حالة وصول', `${p.name} -> ${newStatus}`);
            fetchData();
        }
    };

    const updatePrice = async (barcode: string, price: string) => {
        if (!barcode || !price) return;
        if (confirm(`سيتم تغيير سعر الصنف ذو الباركود ${barcode} إلى ${price} في كافة الصيدليات. موافق؟`)) {
            await supabase.from('medicines').update({ price: Number(price) }).eq('barcode', barcode);
            addLog('تحديث سعر شامل', barcode);
            alert('تم تطبيق السعر الجديد');
        }
    };

    const broadcast = async (content: string, priority: Priority) => {
        if (!content) return;
        await supabase.from('system_messages').insert([{ content, priority, is_active: true }]);
        addLog('بث رسالة نظام', priority);
        alert('تم البث بنجاح');
    };

    const updateMasterPass = async (id: string, pass: string) => {
        await supabase.from('pharmacies').update({ master_password: pass }).eq('id', id);
        addLog('تصفير Master Password', `Pharmacy ID: ${id}`);
        alert('تم تحديث كلمة المرور الرئيسية');
    };

    if (!isAuthenticated) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
            <GlassCard className="w-full max-w-md p-8 relative z-10 border-indigo-500/20 shadow-2xl">
                <div className="flex justify-center mb-6"><div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg"><ShieldCheck size={40} className="text-white" /></div></div>
                <h1 className="text-3xl font-bold text-center text-white mb-8">RAHA CONTROL</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} className="w-full bg-slate-900/50 border border-slate-700 text-center text-3xl tracking-[1em] text-white py-4 rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-700 font-bold" placeholder="••••" autoFocus />
                        <LockKeyhole className="absolute right-4 top-5 text-slate-600" size={20} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">ENTER PORTAL</button>
                </form>
            </GlassCard>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col z-50 shadow-2xl">
                <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">R</div>
                    <div>
                        <h1 className="font-bold text-white text-lg tracking-tight">Raha Control</h1>
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM ACTIVE
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'الرؤية العامة' },
                        { id: 'pharmacies', icon: Building2, label: 'إدارة الصيدليات' },
                        { id: 'radar', icon: Radio, label: 'رادار النواقص' },
                        { id: 'global', icon: Globe, label: 'الأومامر المركزية' },
                        { id: 'security', icon: ShieldCheck, label: 'لوحة الأمان' }
                    ].map(item => (
                        <button key={item.id} onClick={() => setView(item.id as ViewType)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><item.icon size={20} /><span className="font-medium">{item.label}</span></button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-colors font-bold">
                        <LogOut size={20} /> خروج آمن
                    </button>
                </div>
            </motion.aside>
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                <header className="h-20 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">{view}</h2>
                    <div className="flex items-center gap-4">
                        {loading && <Loader2 className="animate-spin text-indigo-400" />}
                        <button onClick={() => fetchData()} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
                    <AnimatePresence mode='wait'>
                        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {view === 'overview' && <Overview pharmacies={pharmacies} sales={sales} />}
                            {view === 'pharmacies' && <PharmaciesView data={pharmacies} onUpdateStatus={toggleStatus} onAdd={() => setShowAddModal(true)} sales={sales} />}
                            {view === 'radar' && <MarketRadar demands={demands} pharmacies={pharmacies} />}
                            {view === 'global' && <CommandCenter onPriceUpdate={updatePrice} onBroadcast={broadcast} logs={logs} />}
                            {view === 'security' && <SecurityPanel pharmacies={pharmacies} onUpdatePass={updateMasterPass} />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <GlassCard className="w-full max-w-lg border-slate-600 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">إضافة صيدلية للشبكة</h3><button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-white" /></button></div>
                        <div className="space-y-4">
                            <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={newPharm.name} onChange={e => setNewPharm({ ...newPharm, name: e.target.value })} placeholder="اسم الصيدلية" />
                            <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={newPharm.location} onChange={e => setNewPharm({ ...newPharm, location: e.target.value })} placeholder="المدينة / المنطقة" />
                            <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={newPharm.phone} onChange={e => setNewPharm({ ...newPharm, phone: e.target.value })} placeholder="رقم الهاتف للتواصل" />
                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1" variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
                                <Button className="flex-[2]" onClick={handleAddPharmacy}>تأكيد الإضافة</Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
