import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Filter, Wifi, Tv, Coffee, Edit3, Trash2, X, ChevronDown, AlertCircle 
} from 'lucide-react';

export default function Rooms() {
  // --- STATE ---
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({}); // Validation State
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const [form, setForm] = useState({ 
    id: null, 
    roomNumber: '', 
    floor: '1st Floor',
    type: 'Single', 
    price: '', 
    status: 'AVAILABLE',
    amenities: { ac: false, wifi: true, tv: false, minibar: false }
  });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'GUEST' };

  // --- API CALLS ---
  useEffect(() => { fetchRooms(); }, []);

  // Filter Logic
  useEffect(() => {
    let result = rooms;
    if (typeFilter !== 'All Types') result = result.filter(r => r.type === typeFilter);
    if (statusFilter !== 'All Statuses') {
      const apiStatusMap = { 'Available': 'AVAILABLE', 'Occupied': 'OCCUPIED', 'Cleaning': 'CLEANING', 'Maintenance': 'MAINTENANCE' };
      const targetStatus = apiStatusMap[statusFilter] || statusFilter.toUpperCase(); 
      result = result.filter(r => r.status === targetStatus);
    }
    setFilteredRooms(result);
  }, [rooms, typeFilter, statusFilter]);

  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await axios.get('http://localhost:5000/api/rooms', { headers: { 'x-auth-token': token } });
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (error) { console.error("Fetch error:", error.message); }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    let newErrors = {};
    if (!form.roomNumber.trim()) newErrors.roomNumber = "Room number is required";
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) {
      newErrors.price = "Enter a valid price greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if invalid

    const token = localStorage.getItem('token');
    try {
      const config = { headers: { 'x-auth-token': token } };
      if (isEditing) await axios.put(`http://localhost:5000/api/rooms/${form.id}`, form, config);
      else await axios.post('http://localhost:5000/api/rooms', form, config);
      
      alert('✅ Room asset saved successfully');
      fetchRooms();
      closeForm();
    } catch (error) { 
      const msg = error.response?.data?.message || 'Error saving room';
      setErrors({ server: msg });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room asset?")) return;
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://localhost:5000/api/rooms/${id}`, { headers: { 'x-auth-token': token } });
        fetchRooms();
    } catch (error) { alert("Failed to delete"); }
  };

  const openEditForm = (room) => {
    setErrors({});
    setForm({ ...room, amenities: room.amenities || { ac: false, wifi: true, tv: false, minibar: false } });
    setIsEditing(true);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setErrors({});
    setForm({ id: null, roomNumber: '', floor: '1st Floor', type: 'Single', price: '', status: 'AVAILABLE', amenities: { ac: false, wifi: true, tv: false, minibar: false } });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        
        {/* --- RESPONSIVE HEADER --- */}
        <div className="px-4 md:px-8 py-6 md:py-8 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Room Management</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 uppercase tracking-widest font-medium">Inventory & Pricing Control</p>
              </div>
              {user.role === 'OWNER' && (
                <button 
                  onClick={() => { setErrors({}); setShowForm(true); }}
                  className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-amber-200 font-bold flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Plus size={18} /> Add Room
                </button>
              )}
           </div>

           {/* --- FILTER BAR --- */}
           <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="hidden sm:flex items-center gap-2 text-slate-400 ml-2">
                  <Filter size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
                <select className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option>All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
                <select className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Statuses</option>
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Cleaning</option>
                  <option>Maintenance</option>
                </select>
              </div>
           </div>
        </div>

        {/* --- ROOM GRID --- */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredRooms.map(room => (
                 <div key={room.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all relative group">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         room.status === 'AVAILABLE' ? 'bg-green-50 text-green-600 border-green-100' :
                         room.status === 'OCCUPIED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                         room.status === 'MAINTENANCE' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                         {room.status}
                      </span>
                      {user.role === 'OWNER' && (
                        <div className="flex gap-1">
                          <button onClick={() => openEditForm(room)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(room.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-4xl font-black text-slate-900 leading-none">{room.roomNumber}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-2">{room.type} • {room.floor}</p>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex gap-3 text-slate-300">
                          {room.amenities?.wifi && <Wifi size={18} />}
                          {room.amenities?.tv && <Tv size={18} />}
                          {room.amenities?.minibar && <Coffee size={18} />}
                       </div>
                       <div className="text-right">
                          <span className="block text-2xl font-black text-amber-500 tracking-tighter">${room.price}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ night</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </main>

      {/* --- MODAL WITH VALIDATION --- */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">{isEditing ? 'Update Room' : 'Add New Room'}</h3>
                 <button onClick={closeForm} className="bg-slate-100 w-10 h-10 rounded-full text-slate-500 hover:text-red-500 transition-colors">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 {/* Server Error Alert */}
                 {errors.server && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase">
                       <AlertCircle size={16} /> {errors.server}
                    </div>
                 )}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                       <InputGroup 
                          label="Room Number" 
                          value={form.roomNumber} 
                          error={errors.roomNumber}
                          onChange={(e) => setForm({...form, roomNumber: e.target.value})} 
                       />
                    </div>
                    <div className="flex flex-col">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Floor</label>
                       <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})}>
                          <option value="1st Floor">1st Floor</option>
                          <option value="2nd Floor">2nd Floor</option>
                          <option value="3rd Floor">3rd Floor</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Room Type</label>
                       <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Suite">Suite</option>
                          <option value="Deluxe">Deluxe</option>
                       </select>
                    </div>
                    <div className="flex flex-col">
                       <InputGroup 
                          label="Base Price" 
                          type="number" 
                          value={form.price} 
                          error={errors.price}
                          onChange={(e) => setForm({...form, price: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex flex-col md:flex-row justify-end gap-3 border-t border-slate-100 pt-6">
                    <button type="button" onClick={closeForm} className="order-2 md:order-1 px-8 py-3.5 rounded-2xl text-slate-400 font-black uppercase text-xs hover:bg-slate-50 transition">Discard</button>
                    <button type="submit" className="order-1 md:order-2 px-10 py-3.5 bg-slate-900 text-amber-500 rounded-2xl font-black uppercase text-xs shadow-xl shadow-slate-200 transform active:scale-95 transition">
                       {isEditing ? 'Confirm Update' : 'Publish Room Asset'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

const InputGroup = ({ label, type = "text", value, onChange, error }) => (
  <div className="flex flex-col">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">{label}</label>
     <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        className={`w-full px-5 py-3.5 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none placeholder-slate-300 transition-all`} 
     />
     {error && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 ml-1">{error}</p>}
  </div>
);