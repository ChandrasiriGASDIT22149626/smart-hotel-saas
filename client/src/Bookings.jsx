import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
  // --- STATE ---
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'list', 'checkinout'
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New State for Date Filtering in Check-in/Out view
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [form, setForm] = useState({ 
    guestName: '', guestPhone: '', guestEmail: '', guestCount: 1, roomId: '', checkInDate: '', checkOutDate: '' 
  });
  
  const navigate = useNavigate();

  // --- API CALLS ---
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const roomRes = await axios.get('http://localhost:5000/api/rooms', { headers: { 'x-auth-token': token } });
      setRooms(roomRes.data);
      const bookingRes = await axios.get('http://localhost:5000/api/bookings', { headers: { 'x-auth-token': token } });
      setBookings(bookingRes.data);
    } catch (error) { console.error(error); }
  };

  // --- FILTER AVAILABLE ROOMS LOGIC ---
  useEffect(() => {
    if (form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);

      const available = rooms.filter(room => {
        if (room.status === 'MAINTENANCE' || room.status === 'CLEANING') return false;

        const isBooked = bookings.some(b => {
          if (b.Room && b.Room.id === room.id && b.status !== 'CHECKED_OUT' && b.status !== 'CANCELLED') {
            const bookedStart = new Date(b.checkInDate);
            const bookedEnd = new Date(b.checkOutDate);
            return (checkIn < bookedEnd && checkOut > bookedStart);
          }
          return false;
        });
        return !isBooked;
      });
      setAvailableRooms(available);
    } else {
      setAvailableRooms(rooms.filter(r => r.status === 'AVAILABLE'));
    }
  }, [form.checkInDate, form.checkOutDate, rooms, bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/bookings', form, { headers: { 'x-auth-token': token } });
      alert('✅ Booking Confirmed!');
      setShowForm(false); 
      fetchData(); 
    } catch (error) { alert('Error: ' + (error.response?.data?.message || 'Failed')); }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
        await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: newStatus }, { headers: { 'x-auth-token': token } });
        fetchData();
    } catch (error) { alert("Failed to update status"); }
  };

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.Room && String(b.Room.roomNumber).includes(searchTerm))
  );

  // --- SUB-COMPONENT: CALENDAR VIEW ---
  const CalendarView = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const renderCalendarGrid = () => {
      const grid = [];
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayBookings = filteredBookings.filter(b => b.checkInDate === dateStr);
        
        grid.push(
          <div key={i} className="min-h-[100px] border border-gray-100 p-2 relative bg-white hover:bg-gray-50 transition">
             <span className="text-sm font-bold text-gray-400">{i}</span>
             <div className="mt-1 space-y-1">
                {dayBookings.map(b => (
                   <div key={b.id} className={`text-[10px] p-1 rounded truncate font-bold ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                      b.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                   }`}>
                      {b.guestName}
                   </div>
                ))}
             </div>
          </div>
        );
      }
      return grid;
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center font-bold text-xs text-gray-500 py-3 uppercase">
            {days.map(d => <div key={d}>{d}</div>)}
         </div>
         <div className="grid grid-cols-7 auto-rows-fr">{renderCalendarGrid()}</div>
      </div>
    );
  };

  // --- SUB-COMPONENT: LIST VIEW ---
  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
       <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
             <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 text-sm">
                   <td className="px-6 py-4 font-mono text-gray-500">#{String(b.id).slice(0, 6)}</td>
                   <td className="px-6 py-4 font-bold text-gray-900">{b.guestName}</td>
                   <td className="px-6 py-4">{b.Room ? `Room ${b.Room.roomNumber}` : 'N/A'}</td>
                   <td className="px-6 py-4">{b.checkInDate}</td>
                   <td className="px-6 py-4">{b.checkOutDate}</td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${
                         b.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                         b.status === 'CHECKED_IN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>{b.status}</span>
                   </td>
                   <td className="px-6 py-4 font-black">${b.totalAmount}</td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  // --- SUB-COMPONENT: CHECK-IN / OUT VIEW (FIXED) ---
  const CheckInOutView = () => {
    // Filter specifically for the selectedDate context
    const arriving = filteredBookings.filter(b => 
      b.checkInDate === selectedDate && (b.status === 'CONFIRMED' || b.status === 'PENDING')
    );
    
    const departing = filteredBookings.filter(b => 
      b.checkOutDate === selectedDate && b.status === 'CHECKED_IN'
    );

    const Card = ({ booking, type }) => (
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition group">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{booking.guestName}</h4>
            {/* Automatic Role Label based on current date */}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
              type === 'arrival' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {type === 'arrival' ? 'Check-In' : 'Check-Out'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {booking.Room ? `Room ${booking.Room.roomNumber}` : 'No Room'} • ${booking.totalAmount}
          </p>
        </div>
        <button 
          onClick={() => handleStatusChange(booking.id, type === 'arrival' ? 'CHECKED_IN' : 'CHECKED_OUT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-widest ${
            type === 'arrival' ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
          }`}
        >
          {type === 'arrival' ? 'Process Check-In' : 'Process Check-Out'}
        </button>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Date Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Schedule For:</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-800"
            />
          </div>
          <div className="text-sm font-medium text-gray-400">
            Currently displaying schedule for <span className="text-amber-600 font-bold underline decoration-2">{new Date(selectedDate).toDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 ml-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Arrivals Due</h3>
            </div>
            <div className="space-y-4">
              {arriving.length > 0 ? arriving.map(b => <Card key={b.id} booking={b} type="arrival" />) : 
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium italic">No check-ins scheduled for today.</div>}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 ml-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Departures Due</h3>
            </div>
            <div className="space-y-4">
              {departing.length > 0 ? departing.map(b => <Card key={b.id} booking={b} type="departure" />) : 
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium italic">No check-outs scheduled for today.</div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      
      {/* SIDEBAR PLACEHOLDER - You can insert your sidebar here */}
      
      <main className="flex-1 flex flex-col h-full">
        <div className="px-10 py-10 bg-white border-b border-gray-100 flex justify-between items-center">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Booking Management</h2>
              <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Property Operations Dashboard</p>
           </div>
           <button 
             onClick={() => setShowForm(true)}
             className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-amber-200 font-black flex items-center gap-3 transition-all transform active:scale-95 uppercase text-xs"
           >
             <span className="text-lg">+</span> New Booking
           </button>
        </div>

        <div className="bg-white px-10 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('calendar')} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>Calendar</button>
              <button onClick={() => setActiveTab('list')} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>List View</button>
              <button onClick={() => setActiveTab('checkinout')} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'checkinout' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>Arrival/Dept</button>
           </div>
           <div className="relative w-full sm:w-80">
              <input type="text" placeholder="Search guests..." className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-amber-500 text-sm bg-gray-50 font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>

        <div className="flex-1 overflow-auto p-10">
           {activeTab === 'calendar' && <CalendarView />}
           {activeTab === 'list' && <ListView />}
           {activeTab === 'checkinout' && <CheckInOutView />}
        </div>
      </main>

      {/* NEW BOOKING MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
              <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">New Reservation</h3>
                 <button onClick={() => setShowForm(false)} className="bg-gray-100 w-10 h-10 rounded-full text-gray-500 hover:text-red-500 transition-colors">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="Guest Name" placeholder="John Doe" onChange={(e) => setForm({...form, guestName: e.target.value})} />
                    <InputGroup label="Phone Number" placeholder="+1 (555) 000-0000" onChange={(e) => setForm({...form, guestPhone: e.target.value})} />
                 </div>
                 <InputGroup label="Email Address" placeholder="john@example.com" type="email" onChange={(e) => setForm({...form, guestEmail: e.target.value})} />
                 <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="Check-in Date" type="date" onChange={(e) => setForm({...form, checkInDate: e.target.value})} />
                    <InputGroup label="Check-out Date" type="date" onChange={(e) => setForm({...form, checkOutDate: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 ml-1">Available Rooms</label>
                       <select 
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50" 
                          onChange={(e) => setForm({...form, roomId: e.target.value})}
                          disabled={!form.checkInDate || !form.checkOutDate}
                       >
                          <option value="">Select Room</option>
                          {availableRooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} - {r.type} (${r.price})</option>)}
                       </select>
                    </div>
                    <InputGroup label="Total Guests" type="number" placeholder="1" onChange={(e) => setForm({...form, guestCount: e.target.value})} />
                 </div>
                 <div className="pt-6 flex justify-end gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase text-xs hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-10 py-4 rounded-2xl bg-slate-950 text-amber-500 font-black uppercase text-xs shadow-xl shadow-slate-200 transform active:scale-95">Confirm Stay</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

const InputGroup = ({ label, placeholder, type = "text", onChange }) => (
  <div>
     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 ml-1">{label}</label>
     <input type={type} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none placeholder-gray-300" placeholder={placeholder} onChange={onChange} required />
  </div>
);