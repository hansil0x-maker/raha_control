import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Activity, 
  ArrowUpRight, 
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../src/supabase';
import { INITIAL_STATS } from '../constants';
import { DashboardStats } from '../types';

interface ChartData {
  name: string;
  sales: number;
}

const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Pharmacies Count
        const { count: pharmaciesCount, error: phError } = await supabase
          .from('pharmacies')
          .select('*', { count: 'exact', head: true });

        // 2. Fetch Pending Orders Count
        const { count: ordersCount, error: ordError } = await supabase
          .from('wanted_list')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 3. Fetch Sales Data for Stats & Chart
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('total_amount, created_at')
          .limit(1000);

        if (phError || ordError || salesError) throw new Error('Error fetching data');

        // Calculate Sales Stats
        const totalSales = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

        // Process Chart Data (Mocking monthly distribution based on real total if dates aren't enough, 
        // or actually grouping by month if possible. For simplicity here, we simulate distribution or use real timestamps)
        const processedChart = processChartData(salesData || []);

        setStats({
          totalPharmacies: pharmaciesCount || 0,
          totalActiveOrders: ordersCount || 0,
          totalMonthlySales: totalSales,
          growthRate: 0 // Calculation would require historical data comparison
        });

        setChartData(processedChart);

      } catch (err) {
        console.error('Failed to fetch overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processChartData = (sales: any[]): ChartData[] => {
      // Simple aggregation by month for the current year
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const currentYear = new Date().getFullYear();
      const monthlyTotals = new Array(12).fill(0);

      sales.forEach(sale => {
          const date = new Date(sale.created_at);
          if (date.getFullYear() === currentYear) {
              monthlyTotals[date.getMonth()] += (sale.total_amount || 0);
          }
      });

      // Filter to just months with data or last 6 months
      // For now, returning non-zero or last 6 for visual
      return months.map((m, i) => ({
          name: m,
          sales: monthlyTotals[i]
      })).filter(d => d.sales > 0 || true).slice(0, 6); // Just showing first 6 for layout if empty
  };

  if (loading) {
      return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظرة عامة</h1>
          <p className="text-gray-500 mt-1">رؤى النظام ومقاييس الأداء الحقيقية.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 border border-gray-200 rounded-md shadow-sm">
          تحديث مباشر
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">إجمالي الصيدليات</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPharmacies}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={14} className="ms-1" />
              SaaS
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">إجمالي التداول</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.totalMonthlySales.toLocaleString()} ج.س
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">الطلبات النشطة (Wanted)</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalActiveOrders}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">الأداء المالي</h3>
          <div className="h-[300px] w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">حركة التداول</h3>
          <div className="h-[300px] w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#cbd5e1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  activeBar={{ fill: '#4f46e5' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
