import React, { useState, useEffect } from 'react';
import { PackageCheck, Search, TrendingUp, AlertCircle, BarChart3, ListFilter, Loader2 } from 'lucide-react';
import { supabase } from '../src/supabase';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { AggregatedOrder, WantedListItem } from '../types';

const MarketDemand: React.FC = () => {
  const [demands, setDemands] = useState<AggregatedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch and aggregate demands from "wanted_list"
  const fetchDemands = async () => {
    setLoading(true);
    try {
      // Fetch pending wanted items
      const { data: wantedData, error } = await supabase
        .from('wanted_list')
        .select(`
            id,
            item_name,
            request_count,
            pharmacy_id,
            status,
            urgency,
            created_at
        `)
        .eq('status', 'pending');

      // Fetch pharmacies to map names
      const { data: pharmData } = await supabase.from('pharmacies').select('id, name');

      if (error) throw error;
      
      if (wantedData) {
         // Aggregation Logic: Group by item_name
         const aggregated: Record<string, AggregatedOrder> = {};
         
         wantedData.forEach((item: any) => {
             const key = item.item_name.toLowerCase().trim();
             if (!aggregated[key]) {
                 aggregated[key] = {
                     id: item.id, // Use first ID as ref
                     medicineName: item.item_name,
                     totalQuantity: 0,
                     requestingPharmacyIds: [],
                     status: 'pending',
                     urgency: item.urgency || 'low'
                 };
             }
             aggregated[key].totalQuantity += (item.request_count || 0);
             const pharmName = pharmData?.find(p => p.id === item.pharmacy_id)?.name || item.pharmacy_id;
             if (!aggregated[key].requestingPharmacyIds.includes(pharmName)) {
                 aggregated[key].requestingPharmacyIds.push(pharmName);
             }
             // Upgrade urgency if any request is high
             if (item.urgency === 'high') aggregated[key].urgency = 'high';
         });

         setDemands(Object.values(aggregated));
      }

    } catch (err) {
      console.error('Error fetching demand:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleSupply = async (itemName: string) => {
      // In a real scenario, this would trigger a supply transaction or update all related wanted_list items
      const { error } = await supabase
        .from('wanted_list')
        .update({ status: 'supplied' })
        .eq('item_name', itemName); // Update all requests for this item name
      
      if (!error) {
          fetchDemands(); // Refresh
      }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات السوق المجمعة</h1>
          <p className="text-gray-500 mt-1">تجميع ذكي لـ (request_count) من كافة الفروع.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDemands} leftIcon={<BarChart3 size={16} />}>
            تحديث البيانات
        </Button>
      </div>

      {/* Stats Cards Row (Simplified for this view) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
         {/* ... (Existing stat cards logic can be kept or simplified) ... */}
         <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
            <span className="text-gray-500 text-sm">إجمالي الوحدات المطلوبة</span>
            <span className="text-3xl font-bold text-gray-900">{demands.reduce((acc, curr) => acc + curr.totalQuantity, 0)}</span>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600"/></div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الدواء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية المطلوبة (Total)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأهمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفروع الطالبة</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demands.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">Rx</div>
                        <div className="text-sm font-medium text-gray-900">{item.medicineName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{item.totalQuantity.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.requestingPharmacyIds.slice(0, 3).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {name}
                        </span>
                      ))}
                      {item.requestingPharmacyIds.length > 3 && (
                          <span className="text-xs text-gray-500">+{item.requestingPharmacyIds.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                     <Button size="sm" variant="outline" onClick={() => handleSupply(item.medicineName)}>
                        توفير
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketDemand;
