import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, CheckCircle2, XCircle, Clock, Wallet, Store, MapPin, Phone, Key, Loader2 
} from 'lucide-react';
import { supabase } from '../src/supabase'; // Using the centralized config
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Pharmacy, PharmacyStatus } from '../types';

const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [newPharmacyLocation, setNewPharmacyLocation] = useState('');
  const [newPharmacyPhone, setNewPharmacyPhone] = useState('');

  // Fetch Data from Supabase
  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('joined_date', { ascending: false });
      
      if (error) throw error;

      if (data) {
        // Map DB types to UI types
        const mapped: Pharmacy[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          uniqueKey: p.pharmacy_key,
          status: p.status,
          joinedDate: p.joined_date,
          location: p.location || '',
          contactPhone: p.contact_phone || '', // Changed mapping
          balance: p.balance || 0,
          lastActive: p.last_active
        }));
        setPharmacies(mapped);
      }
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
    
    // Realtime subscription
    const subscription = supabase
      .channel('pharmacies_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pharmacies' }, () => {
        fetchPharmacies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleAddPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = `RAHA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      const { error } = await supabase.from('pharmacies').insert([{
        name: newPharmacyName,
        location: newPharmacyLocation,
        contact_phone: newPharmacyPhone, // Changed field
        pharmacy_key: key,
        status: 'active',
        balance: 0,
        joined_date: new Date().toISOString()
      }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewPharmacyName('');
      setNewPharmacyLocation('');
      setNewPharmacyPhone('');
      // Data will refresh via subscription or we can call fetchPharmacies()
      fetchPharmacies();
    } catch (err) {
      alert('Error creating pharmacy');
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: PharmacyStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
        await supabase.from('pharmacies').update({ status: newStatus }).eq('id', id);
        // UI updates automatically via fetch or subscription
    } catch (err) {
        console.error(err);
    }
  };

  const getStatusBadge = (status: PharmacyStatus) => {
    switch (status) {
      case 'active': return <Badge variant="success">نشط</Badge>;
      case 'suspended': return <Badge variant="danger">موقوف</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
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
            <Search className="absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="بحث بالاسم أو المعرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center p-12">
                 <Loader2 className="animate-spin text-indigo-600" size={32} />
             </div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200 text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المفتاح</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPharmacies.length > 0 ? (
                filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {pharmacy.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {pharmacy.contactPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono bg-gray-50/50">
                      {pharmacy.uniqueKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pharmacy.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className={`flex items-center gap-1 ${pharmacy.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        <Wallet size={14} />
                        {pharmacy.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pharmacy.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                              onClick={() => toggleStatus(pharmacy.id, pharmacy.status)}
                              className={`p-1 transition-colors ${pharmacy.status === 'active' ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                         >
                              {pharmacy.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد صيدليات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold mb-4">إضافة صيدلية</h2>
                 <form onSubmit={handleAddPharmacy} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="الاسم" value={newPharmacyName} onChange={e => setNewPharmacyName(e.target.value)} required />
                    <input className="w-full border p-2 rounded" placeholder="الموقع" value={newPharmacyLocation} onChange={e => setNewPharmacyLocation(e.target.value)} required />
                    <input className="w-full border p-2 rounded" placeholder="رقم الهاتف" value={newPharmacyPhone} onChange={e => setNewPharmacyPhone(e.target.value)} required />
                    <div className="flex gap-2 justify-end mt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ</Button>
                    </div>
                 </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacies;
