import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid hotel email address";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for a field when user starts typing again
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Ensure backend is running to avoid ERR_CONNECTION_REFUSED
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      const serverMsg = error.response?.data?.message || 'Server connection failed';
      setErrors({ server: `❌ Login Failed: ${serverMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f59e0b] overflow-hidden font-sans">
      
      {/* Background Glowing Orbs (Yellow/Amber Theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-400 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-400 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse delay-1000"></div>
      
      {/* Decorative Wavy SVG Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,200 Q250,100 500,200 T1000,200" fill="none" stroke="#7c2d12" strokeWidth="40" strokeLinecap="round" />
          <path d="M0,500 Q250,400 500,500 T1000,500" fill="none" stroke="#7c2d12" strokeWidth="30" strokeLinecap="round" />
          <path d="M0,800 Q250,700 500,800 T1000,800" fill="none" stroke="#7c2d12" strokeWidth="20" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main Glass Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 mx-4 bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
        
        <div className="text-center mb-10">
            <h1 className="text-amber-950 text-3xl font-black mb-2 tracking-tight">SMART HOTEL</h1>
            <h2 className="text-amber-900 text-lg font-medium opacity-80">Sign in to your account</h2>
        </div>

        {/* Server Error Message */}
        {errors.server && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-900 text-sm font-bold text-center">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-amber-950 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="email" 
              type="email" 
              placeholder="admin@hotel.com" 
              value={formData.email}
              onChange={handleChange} 
            />
            {errors.email && <p className="mt-1 ml-2 text-red-900 text-[10px] font-bold uppercase tracking-wider">{errors.email}</p>}
          </div>

          <div className="group">
            <label className="block text-amber-950 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.password ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange} 
            />
            {errors.password && <p className="mt-1 ml-2 text-red-900 text-[10px] font-bold uppercase tracking-wider">{errors.password}</p>}
          </div>

          <button 
            disabled={isSubmitting}
            className={`w-full py-4 ${isSubmitting ? 'bg-amber-950/50 cursor-not-allowed' : 'bg-amber-950 hover:bg-black'} text-yellow-400 font-black rounded-2xl shadow-[0_10px_20px_-5px_rgba(124,45,18,0.4)] transform active:scale-[0.98] transition-all duration-200 mt-4 uppercase tracking-widest text-sm`} 
            type="submit"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-amber-950/10 pt-6">
            <p className="text-amber-950/70 text-sm">
                New here? 
                <Link to="/register" className="ml-2 text-amber-950 font-bold hover:underline transition-colors">Start a Hotel</Link>
            </p>
        </div>
      </div>
    </div>
  );
}