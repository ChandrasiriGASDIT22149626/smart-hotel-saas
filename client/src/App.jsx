import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Rooms from './Rooms';
import Bookings from './Bookings';
import Guests from './Guests';
import CalendarView from './CalendarView';
import Team from './Team';
import Layout from './Layout';

// --- AUTH GUARD COMPONENT ---
// This checks if the user is logged in before showing protected content
const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  // If no token exists, send them back to login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (WRAPPED IN AUTH GUARD & LAYOUT) */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/team" element={<Team />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;