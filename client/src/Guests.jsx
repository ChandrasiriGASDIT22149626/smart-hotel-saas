import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Mail, Phone, MoreHorizontal, Menu
} from 'lucide-react';

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchGuests(); }, []);

  useEffect(() => {
    const results = guests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuests(results);
  }, [searchTerm, guests]);

  const fetchGuests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const res = await axios.get('http://localhost:5000/api/bookings', { 
        headers: { 'x-auth-token': token } 
      });
      const uniqueGuests = {};
      res.data.forEach(booking => {
        const key = booking.guestEmail || booking.guestPhone; 
        if (!uniqueGuests[key]) {
          uniqueGuests[key] = {
            id: booking.id,
            name: booking.guestName,
            phone: booking.guestPhone || 'N/A',
            email: booking.guestEmail || 'N/A',
            visits: 1,
            totalSpent: parseFloat(booking.totalAmount || 0),
            lastVisit: booking.checkInDate,
          };
        } else {
          uniqueGuests[key].visits += 1;
          uniqueGuests[key].totalSpent += parseFloat(booking.totalAmount || 0);
          if (new Date(booking.checkInDate) > new Date(uniqueGuests[key].lastVisit)) {
            uniqueGuests[key].lastVisit = booking.checkInDate;
          }
        }
      });
      const guestList = Object.values(uniqueGuests);
      setGuests(guestList);
      setFilteredGuests(guestList);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        
        {/* --- RESPONSIVE HEADER --- */}
        <div className="px-4 md:px-8 py-6 md:py-8 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">Guest Management</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 uppercase tracking-widest font-medium">History & Loyalty Dashboard</p>
              </div>
              
              {/* Mobile Search Bar Toggle - Simplifies UI on small screens */}
              <div className="relative w-full md:max-w-md">
                 <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search name, email, or phone..." 
                   className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-gray-50 transition"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
           
           {/* MOBILE CARD VIEW: Visible only on small screens */}
           <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredGuests.map((guest, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{guest.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: #{String(guest.id).slice(-6)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${guest.visits > 1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {guest.visits > 1 ? 'VIP' : 'New'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Visits</p>
                      <p className="text-sm font-bold text-indigo-600">{guest.visits} Stays</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Revenue</p>
                      <p className="text-sm font-bold text-slate-900">${guest.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={14} className="text-slate-400" /> {guest.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={14} className="text-slate-400" /> {guest.phone}
                    </div>
                  </div>

                  <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition">
                    View Full History
                  </button>
                </div>
              ))}
           </div>

           {/* DESKTOP TABLE VIEW: Visible only on LG screens and up */}
           <div className="hidden lg:block bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                       <th className="px-8 py-5">Guest Identity</th>
                       <th className="px-8 py-5">Contact Node</th>
                       <th className="px-8 py-5 text-center">Frequency</th>
                       <th className="px-8 py-5 text-center">Revenue</th>
                       <th className="px-8 py-5">Last Visit</th>
                       <th className="px-8 py-5">Tier</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredGuests.map((guest, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors group">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                                  {guest.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-slate-900 leading-none">{guest.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono uppercase">ID: {String(guest.id).slice(-8)}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-sm font-medium text-slate-600">
                            <div className="flex flex-col gap-1.5">
                               <span className="flex items-center gap-2"><Mail size={14} className="opacity-40" /> {guest.email}</span>
                               <span className="flex items-center gap-2"><Phone size={12} className="opacity-40" /> {guest.phone}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <span className="inline-flex px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 uppercase tracking-tighter">
                               {guest.visits} Stays
                            </span>
                         </td>
                         <td className="px-8 py-5 text-center font-black text-slate-800 tracking-tighter">
                            ${guest.totalSpent.toLocaleString()}
                         </td>
                         <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                            {new Date(guest.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                         </td>
                         <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                               guest.visits > 1 ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'
                            }`}>
                               <span className={`h-1.5 w-1.5 rounded-full ${guest.visits > 1 ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                               {guest.visits > 1 ? 'VIP' : 'New'}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button className="text-slate-300 hover:text-slate-900 transition-colors p-2">
                               <MoreHorizontal size={20} />
                            </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
           </div>

           {/* --- LOADING & EMPTY STATES --- */}
           {(loading || filteredGuests.length === 0) && (
             <div className="py-24 text-center">
               <Users size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-[2px] text-xs">
                 {loading ? 'Decrypting Guest Database...' : 'No guest records matched your query'}
               </p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}