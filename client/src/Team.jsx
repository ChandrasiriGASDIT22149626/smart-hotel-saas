import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Plus, Mail, Phone, Shield, 
  Edit3, Trash2, X, MoreVertical, CheckCircle, MinusCircle 
} from 'lucide-react';

export default function Team() {
  // --- STATE ---
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedRoleUser, setSelectedRoleUser] = useState(null); 

  const [form, setForm] = useState({ 
    name: '', email: '', password: '', phone: '', role: 'Receptionist', status: 'Active' 
  });

  const navigate = useNavigate();

  // --- ROLE CONFIG ---
  const rolePermissions = {
    'Manager': { bookings: true, rooms: true, billing: true, delete: true, guests: true },
    'Receptionist': { bookings: true, rooms: true, billing: false, delete: false, guests: true },
    'Housekeeping': { bookings: false, rooms: true, billing: false, delete: false, guests: false },
    'Security': { bookings: false, rooms: false, billing: false, delete: false, guests: true },
    'OWNER': { bookings: true, rooms: true, billing: true, delete: true, guests: true }
  };

  useEffect(() => { fetchStaff(); }, []);

  useEffect(() => {
    const results = staff.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(results);
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await axios.get('http://localhost:5000/api/auth/staff', {
        headers: { 'x-auth-token': token }
      });
      setStaff(res.data);
    } catch (error) { console.error("Fetch Error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/auth/staff/${currentId}`, form, { headers: { 'x-auth-token': token } });
      } else {
        await axios.post('http://localhost:5000/api/auth/create-staff', form, { headers: { 'x-auth-token': token } });
      }
      fetchStaff(); 
      setShowForm(false);
    } catch (error) { alert('Action Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove employee?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/auth/staff/${id}`, { headers: { 'x-auth-token': token } });
      fetchStaff();
    } catch (error) { alert("Delete Error"); }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        
        {/* --- RESPONSIVE HEADER --- */}
        <div className="px-4 md:px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Staff Management</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Access Control & HR</p>
              </div>
              <button onClick={() => { setIsEditing(false); setForm({ name: '', email: '', password: '', phone: '', role: 'Receptionist', status: 'Active' }); setShowForm(true); }} 
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-amber-200 font-bold flex items-center justify-center gap-2 transition active:scale-95">
                <Plus size={18} /> Add Staff
              </button>
           </div>
           
           <div className="mt-6 relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 text-sm bg-gray-50 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
           
           {/* MOBILE LIST VIEW (Cards) */}
           <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredStaff.map((emp) => (
                <div key={emp.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center font-black text-xs uppercase">
                            {emp.name.charAt(0)}{emp.name.split(' ')[1]?.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[10px] font-black text-amber-600 uppercase">{emp.role}</p>
                         </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                         {emp.status}
                      </span>
                   </div>
                   <div className="space-y-1 text-xs text-slate-500 border-y border-slate-50 py-3">
                      <p className="flex items-center gap-2"><Mail size={14} /> {emp.email}</p>
                      <p className="flex items-center gap-2"><Phone size={14} /> {emp.phone || 'No phone'}</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setSelectedRoleUser(emp)} className="flex-1 py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Shield size={14}/> Permissions</button>
                      <button onClick={() => { setForm({...emp, password: ''}); setCurrentId(emp.id); setIsEditing(true); setShowForm(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={18}/></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-50 text-red-600 rounded-xl"><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
           </div>

           {/* DESKTOP TABLE VIEW */}
           <div className="hidden md:block bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                       <th className="px-8 py-5">Employee Identity</th>
                       <th className="px-8 py-5">Role/Access</th>
                       <th className="px-8 py-5">Contact Node</th>
                       <th className="px-8 py-5">System Status</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredStaff.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors group text-sm">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                  {emp.name.charAt(0)}{emp.name.split(' ')[1]?.charAt(0)}
                               </div>
                               <span className="font-bold text-slate-900">{emp.name}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <button onClick={() => setSelectedRoleUser(emp)} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 hover:bg-amber-100 transition">
                               {emp.role}
                            </button>
                         </td>
                         <td className="px-8 py-5 font-medium text-slate-500">{emp.email}</td>
                         <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                               <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                               {emp.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setForm({...emp, password: ''}); setCurrentId(emp.id); setIsEditing(true); setShowForm(true); }} className="text-slate-400 hover:text-blue-600"><Edit3 size={18}/></button>
                               <button onClick={() => handleDelete(emp.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* --- PERMISSIONS SIDE PANEL (MOBILE READY) --- */}
        {selectedRoleUser && (
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[100] p-8 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-slate-900 text-amber-500 flex items-center justify-center font-black text-xl shadow-xl shadow-slate-200">
                      {selectedRoleUser.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 uppercase leading-none">{selectedRoleUser.name}</h3>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">{selectedRoleUser.role} Access</p>
                   </div>
                </div>
                <button onClick={() => setSelectedRoleUser(null)} className="p-2 hover:bg-slate-50 rounded-full"><X size={24}/></button>
             </div>
             
             <div className="flex-1 space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Module Authorization</h4>
                {['bookings', 'rooms', 'billing', 'delete', 'guests'].map(perm => (
                  <div key={perm} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <span className="text-xs font-bold text-slate-700 capitalize">{perm} Module</span>
                     {rolePermissions[selectedRoleUser.role]?.[perm] 
                       ? <CheckCircle className="text-green-500" size={20}/> 
                       : <MinusCircle className="text-slate-300" size={20}/>}
                  </div>
                ))}
             </div>

             <div className="mt-auto pt-8 border-t border-slate-100">
                <button onClick={() => handleDelete(selectedRoleUser.id)} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition">
                   Terminate Access
                </button>
             </div>
          </div>
        )}
      </main>

      {/* --- RESPONSIVE MODAL FORM --- */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{isEditing ? 'Modify Identity' : 'Enroll Staff'}</h3>
                 <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-5">
                 <div className="space-y-4">
                    <InputGroup label="Full Name" placeholder="Ex: Sahan Narangoda" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                    <InputGroup label="System Email" placeholder="krish@gmail.com" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex flex-col">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Assigned Role</label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                              <option value="Receptionist">Receptionist</option>
                              <option value="Manager">Manager</option>
                              <option value="Housekeeping">Housekeeping</option>
                              <option value="Security">Security</option>
                          </select>
                       </div>
                       <div className="flex flex-col">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Login Status</label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                          </select>
                       </div>
                    </div>

                    <InputGroup label="Phone Number" placeholder="0719100053" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                    {!isEditing && <InputGroup label="Temporary Password" type="password" placeholder="********" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />}
                 </div>

                 <div className="pt-8 flex flex-col md:flex-row justify-end gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="order-2 md:order-1 px-8 py-4 rounded-2xl text-slate-400 font-black uppercase text-[10px] hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="order-1 md:order-2 px-10 py-4 bg-slate-900 text-amber-500 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-200 transform active:scale-95">Verify & Save</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

const InputGroup = ({ label, placeholder, type = "text", value, onChange }) => (
  <div className="flex flex-col">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">{label}</label>
     <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" required />
  </div>
);