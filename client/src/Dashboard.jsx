import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, BedDouble, Users, CreditCard, 
  LogOut, TrendingUp, TrendingDown, Bell, Search, Menu
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ checkIns: 0, checkOuts: 0, revenue: 0, occupancyRate: 0, totalRooms: 0 });
  const [bookings, setBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#E2E8F0'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchData(token);
    }
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings', { headers: { 'x-auth-token': token } });
      const roomsRes = await axios.get('http://localhost:5000/api/rooms', { headers: { 'x-auth-token': token } });
      
      const allBookings = bookingsRes.data;
      const allRooms = roomsRes.data;

      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = allBookings.filter(b => b.checkInDate === today).length;
      const todayCheckOuts = allBookings.filter(b => b.checkOutDate === today).length;
      const totalRev = allBookings.reduce((acc, curr) => acc + parseFloat(curr.totalAmount || 0), 0);
      
      const activeBookings = allBookings.filter(b => b.status === 'CHECKED_IN').length;
      const totalRoomsCount = allRooms.length || 1;
      const occupancy = Math.round((activeBookings / totalRoomsCount) * 100);

      setStats({
        checkIns: todayCheckIns,
        checkOuts: todayCheckOuts,
        revenue: totalRev,
        occupancyRate: occupancy,
        totalRooms: totalRoomsCount
      });

      setBookings(allBookings);
      processChartData(allBookings);
      setLoading(false);

    } catch (error) { 
      console.error(error);
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const last7Days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 
      last7Days[dateStr] = { name: dayName, amount: 0 };
    }

    data.forEach(b => {
      if (last7Days[b.checkInDate]) {
        last7Days[b.checkInDate].amount += parseFloat(b.totalAmount);
      }
    });
    setChartData(Object.values(last7Days));
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* --- RESPONSIVE HEADER --- */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              {/* This button can be used to trigger a sidebar on mobile if needed */}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-tight">Dashboard</h2>
                <p className="hidden md:block text-sm text-slate-500">Welcome back, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-6">
               <div className="hidden sm:relative sm:block">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-amber-500 w-40 md:w-64" />
               </div>
               <div className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                  <Bell size={20} className="text-slate-500" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </div>
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                  {user?.name?.charAt(0) || 'A'}
               </div>
            </div>
        </header>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           
           {/* STATS CARDS: Stacks on mobile, 2 cols on tablet, 4 on desktop */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <StatCard 
                title="Today's Check-ins" 
                value={stats.checkIns} 
                icon={<CalendarDays size={22} className="text-blue-600" />} 
                trend="+8%" trendUp={true} 
                bgColor="bg-blue-50"
              />
              <StatCard 
                title="Today's Check-outs" 
                value={stats.checkOuts} 
                icon={<LogOut size={22} className="text-orange-600" />} 
                trend="-3%" trendUp={false} 
                bgColor="bg-orange-50"
              />
              <StatCard 
                title="Available Rooms" 
                value={`${Math.round(stats.totalRooms - (stats.occupancyRate * stats.totalRooms / 100))}/${stats.totalRooms}`} 
                icon={<BedDouble size={22} className="text-green-600" />} 
                trend="48%" trendUp={true} 
                bgColor="bg-green-50"
              />
              <StatCard 
                title="Total Revenue" 
                value={`$${stats.revenue.toLocaleString()}`} 
                icon={<CreditCard size={22} className="text-purple-600" />} 
                trend="+12%" trendUp={true} 
                bgColor="bg-purple-50"
              />
           </div>

           {/* CHARTS SECTION: Stacks on mobile */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
              
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base md:text-lg text-slate-800">Revenue Analytics</h3>
                    <select className="text-[10px] md:text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                       <option>This Week</option>
                       <option>Last Week</option>
                    </select>
                 </div>
                 <div className="h-60 md:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                 <h3 className="font-bold text-base md:text-lg text-slate-800 w-full text-left mb-4">Occupancy Rate</h3>
                 <div className="h-48 md:h-64 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                              data={[{ name: 'Occupied', value: stats.occupancyRate }, { name: 'Empty', value: 100 - stats.occupancyRate }]}
                              cx="50%" cy="50%"
                              innerRadius="70%" outerRadius="90%"
                              paddingAngle={5}
                              dataKey="value"
                          >
                             {[{ name: 'Occupied', value: stats.occupancyRate }, { name: 'Empty', value: 100 - stats.occupancyRate }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl md:text-4xl font-bold text-slate-800">{stats.occupancyRate}%</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupied</span>
                    </div>
                 </div>
                 <div className="w-full text-center text-xs text-slate-500 mt-4">
                    <p>{Math.round((stats.occupancyRate / 100) * stats.totalRooms)} rooms in use.</p>
                 </div>
              </div>
           </div>

           {/* RECENT ACTIVITY & TABLE: Stacks on mobile */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-base md:text-lg text-slate-800 mb-6">Recent Activity</h3>
                 <div className="space-y-6">
                    <ActivityItem color="bg-green-500" text="Room 204 checked in" time="2 mins ago" />
                    <ActivityItem color="bg-blue-500" text="Invoice #1042 generated" time="15 mins ago" />
                    <ActivityItem color="bg-orange-500" text="Room 305 - Maintenance" time="1 hour ago" />
                    <ActivityItem color="bg-purple-500" text="New booking - Sarah C." time="2 hours ago" />
                 </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base md:text-lg text-slate-800">New Bookings</h3>
                    <button onClick={() => navigate('/bookings')} className="text-amber-500 text-xs font-semibold">View All</button>
                 </div>
                 {/* Table container for horizontal scroll on mobile */}
                 <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full text-left min-w-[500px]">
                       <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <th className="pb-3 px-4">Guest</th>
                             <th className="pb-3">Room</th>
                             <th className="pb-3">Check In</th>
                             <th className="pb-3 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {bookings.slice(0, 5).map((b) => (
                             <tr key={b.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-4 font-semibold text-slate-700 text-xs md:text-sm">{b.guestName}</td>
                                <td className="py-4 text-xs text-slate-500">{b.Room ? b.Room.roomNumber : 'N/A'}</td>
                                <td className="py-4 text-xs text-slate-500">{b.checkInDate}</td>
                                <td className="py-4 text-right">
                                   <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                                      {b.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

const StatCard = ({ title, value, icon, trend, trendUp, bgColor }) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
     <div className="flex justify-between items-start mb-4">
        <div className={`p-2 md:p-3 rounded-xl ${bgColor}`}>{icon}</div>
        {trend && (
           <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
           </div>
        )}
     </div>
     <div>
        <h3 className="text-xl md:text-3xl font-bold text-slate-900 leading-none">{value}</h3>
        <p className="text-xs text-slate-500 font-medium mt-2">{title}</p>
     </div>
  </div>
);

const ActivityItem = ({ color, text, time }) => (
  <div className="flex items-start gap-3">
     <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${color}`}></div>
     <div className="flex-1">
        <p className="text-xs md:text-sm font-medium text-slate-700 leading-tight">{text}</p>
        <p className="text-[10px] text-slate-400 mt-1">{time}</p>
     </div>
  </div>
);