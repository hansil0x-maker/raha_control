import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Store,
  MapPin,
  Mail,
  Key
} from 'lucide-react';
import { MOCK_PHARMACIES } from '../constants';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Pharmacy, PharmacyStatus } from '../types';

const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [newPharmacyLocation, setNewPharmacyLocation] = useState('');
  const [newPharmacyEmail, setNewPharmacyEmail] = useState('');

  const generateUniqueKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RAHA-${result}`;
  };

  const handleAddPharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    const newPharmacy: Pharmacy = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPharmacyName,
      location: newPharmacyLocation,
      contactEmail: newPharmacyEmail,
      uniqueKey: generateUniqueKey(),
      status: 'pending',
      joinedDate: new Date().toISOString(),
      balance: 0
    };

    setPharmacies([newPharmacy, ...pharmacies]);
    setIsModalOpen(false);
    
    // Reset Form
    setNewPharmacyName('');
    setNewPharmacyLocation('');
    setNewPharmacyEmail('');
  };

  const toggleStatus = (id: string) => {
    setPharmacies(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === 'active' ? 'suspended' : 'active'
        };
      }
      return p;
    }));
  };

  const getStatusBadge = (status: PharmacyStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">نشط</Badge>;
      case 'suspended':
        return <Badge variant="danger">موقوف</Badge>;
      case 'pending':
        return <Badge variant="warning">قيد الانتظار</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.uniqueKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الصيدليات</h1>
          <p className="text-gray-500 mt-1">قائمة المستأجرين، الأرصدة، ومفاتيح الوصول.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
          إضافة صيدلية جديدة
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="بحث بالاسم أو المعرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" leftIcon={<Filter size={14} />}>
              تصفية
            </Button>
            <Button variant="outline" size="sm">
              تصدير
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصيدلية</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المفتاح</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرصيد</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPharmacies.length > 0 ? (
                filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {pharmacy.name.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                          <div className="text-sm text-gray-500">{pharmacy.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono bg-gray-50/50">
                      {pharmacy.uniqueKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pharmacy.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className={`flex items-center gap-1 ${pharmacy.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        <Wallet size={14} className="text-gray-400" />
                        {pharmacy.balance.toLocaleString()} ج.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pharmacy.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                       <div className="flex items-center justify-end gap-2">
                         {pharmacy.status === 'active' ? (
                            <button 
                              onClick={() => toggleStatus(pharmacy.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="إيقاف"
                            >
                              <XCircle size={18} />
                            </button>
                         ) : pharmacy.status === 'suspended' ? (
                            <button 
                              onClick={() => toggleStatus(pharmacy.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                              title="تنشيط"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                         ) : (
                            <button className="text-gray-400 cursor-not-allowed p-1">
                               <Clock size={18} />
                            </button>
                         )}
                         <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                           <MoreHorizontal size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد صيدليات مطابقة لبحثك.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Pharmacy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-xl text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <form onSubmit={handleAddPharmacy}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 mb-4 sm:mb-0 sm:ms-4">
                      <Store className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ms-4 sm:text-right w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        تسجيل صيدلية جديدة
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم الصيدلية</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Store className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                              placeholder="مثال: صيدلية الخرطوم"
                              value={newPharmacyName}
                              onChange={(e) => setNewPharmacyName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">الموقع</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                              placeholder="المدينة، الحي"
                              value={newPharmacyLocation}
                              onChange={(e) => setNewPharmacyLocation(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              required
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                              placeholder="admin@pharmacy.com"
                              value={newPharmacyEmail}
                              onChange={(e) => setNewPharmacyEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md">
                           <div className="flex">
                             <div className="flex-shrink-0">
                               <Key className="h-5 w-5 text-blue-400" aria-hidden="true" />
                             </div>
                             <div className="ms-3">
                               <h3 className="text-sm font-medium text-blue-800">توليد تلقائي للمفتاح</h3>
                               <div className="mt-2 text-sm text-blue-700">
                                 <p>سيقوم النظام بتوليد مفتاح API فريد تلقائياً عند الحفظ.</p>
                               </div>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit" variant="primary" className="w-full sm:w-auto">
                    حفظ وتوليد المفتاح
                  </Button>
                  <Button type="button" variant="outline" className="mt-3 sm:mt-0 w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacies;
