import React, { useState } from 'react';
import { 
  PackageCheck, 
  Search, 
  TrendingUp,
  AlertCircle,
  BarChart3,
  ListFilter
} from 'lucide-react';
import { MOCK_MARKET_DEMAND, MOCK_PHARMACIES } from '../constants';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const MarketDemand: React.FC = () => {
  const [demands, setDemands] = useState(MOCK_MARKET_DEMAND);

  const getPharmacyNames = (ids: string[]) => {
    return ids.map(id => {
      const p = MOCK_PHARMACIES.find(ph => ph.id === id);
      return p ? p.name : 'غير معروف';
    });
  };

  const handleSupply = (id: string) => {
    setDemands(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'supplied' } : d
    ));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      default: return 'منخفضة';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات السوق المجمعة</h1>
          <p className="text-gray-500 mt-1">تحليل "قوائم النواقص" (Wanted Lists) لتحديد احتياجات السوق.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<BarChart3 size={16} />}>
                تحليل البيانات
            </Button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">الدواء الأكثر طلباً</p>
              <h3 className="text-3xl font-bold tracking-tight">Amoxicillin</h3>
              <p className="mt-2 text-indigo-100 text-sm opacity-90">مطلوب في 3 صيدليات</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500 h-5 w-5" />
                <span className="text-gray-500 font-medium text-sm">حالات نفاد المخزون الحرجة</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">12</span>
            <span className="text-sm text-gray-400 mt-1">عنصر ذو أولوية قصوى</span>
        </div>

         <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
                <PackageCheck className="text-green-500 h-5 w-5" />
                <span className="text-gray-500 font-medium text-sm">تم توفيره هذا الشهر</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">850+</span>
            <span className="text-sm text-gray-400 mt-1">وحدة دوائية</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
             <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
             <input 
              type="text"
              placeholder="بحث عن دواء، مادة فعالة..."
              className="w-full pr-9 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
             />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" leftIcon={<ListFilter size={16}/>}>
                تصفية
            </Button>
            <select className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 w-full sm:w-auto cursor-pointer focus:ring-indigo-500 focus:border-indigo-500">
                <option>كل الأولويات</option>
                <option>عالية</option>
                <option>متوسطة</option>
                <option>منخفضة</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الدواء</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي الكمية المطلوبة</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأهمية</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصيدليات الطالبة</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demands.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            Rx
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{item.medicineName}</div>
                            <div className="text-xs text-gray-500">كود: #{item.id}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{item.totalQuantity.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">وحدة / عبوة</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency === 'high' && <AlertCircle size={12} className="ms-1" />}
                      {getUrgencyText(item.urgency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {getPharmacyNames(item.requestingPharmacyIds).map((name, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {name}
                        </span>
                      ))}
                      {item.requestingPharmacyIds.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                              +{item.requestingPharmacyIds.length - 3} المزيد
                          </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    {item.status === 'supplied' ? (
                      <Badge variant="success">تم التوريد</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleSupply(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <PackageCheck size={14} className="ms-1" />
                        توفير الطلب
                      </Button>
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
};

export default MarketDemand;
