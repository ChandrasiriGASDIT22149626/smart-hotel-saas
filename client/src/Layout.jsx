// client/src/Layout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BedDouble, CalendarCheck, 
  Users, CalendarDays, UserSquare2, LogOut, Menu, X 
} from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Bookings', path: '/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Guests', path: '/guests', icon: <Users size={20} /> },
    { name: 'Rooms', path: '/rooms', icon: <BedDouble size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> },
    { name: 'Staff', path: '/team', icon: <UserSquare2 size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#f59e0b] text-amber-950 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Smart Hotel</h1>
            <p className="text-[10px] font-bold opacity-70 tracking-[2px] uppercase">Premium Admin Access</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                  ${location.pathname === item.path 
                    ? 'bg-slate-900 text-amber-500 shadow-xl shadow-amber-900/20' 
                    : 'hover:bg-amber-600/30'}
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-amber-600/20">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
              Logout System
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Top Header (Visible only on Mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-100 rounded-xl text-slate-600"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-black text-slate-900 tracking-tighter uppercase">Smart Hotel</h2>
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white shadow-lg">
            K
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}