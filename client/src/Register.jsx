import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    // Hotel Name Validation
    if (!formData.hotelName.trim()) {
      newErrors.hotelName = "Hotel name is required";
    }

    // Owner Name Validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid business email";
    }

    // Phone Validation (Standard Sri Lankan/International format)
    const phoneRegex = /^[0-9+]{10,15}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Enter a valid phone number (10-15 digits)";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Security requires at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Endpoint matches authroutes.js structure
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('✅ Registration Successful! Welcome to KANEX AI.');
      navigate('/login'); 
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.message || 'Server Error: Connection refused';
      setErrors({ server: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f59e0b] overflow-hidden font-sans p-6">
      
      {/* Background Glowing Orbs (Yellow/Amber Theme) */}
      <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-yellow-400 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-orange-400 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse delay-1000"></div>
      
      {/* Decorative Wavy SVG Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,300 Q250,200 500,300 T1000,300" fill="none" stroke="#7c2d12" strokeWidth="40" strokeLinecap="round" />
          <path d="M0,600 Q250,500 500,600 T1000,600" fill="none" stroke="#7c2d12" strokeWidth="30" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main Glass Registration Card */}
      <div className="relative z-10 w-full max-w-xl p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
        
        <div className="text-center mb-8">
            <h1 className="text-amber-950 text-3xl font-black mb-2 tracking-tight">START YOUR HOTEL</h1>
            <h2 className="text-amber-900 text-lg font-medium opacity-80 uppercase tracking-widest text-[10px]">Premium SaaS Onboarding</h2>
        </div>

        {/* Server Level Error Display */}
        {errors.server && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-900 text-xs font-bold text-center uppercase tracking-tighter">
            ❌ {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 group">
            <label className="block text-amber-950 text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">Hotel Name</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.hotelName ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="hotelName" placeholder="Ex: Grand Luxury Resort" value={formData.hotelName} onChange={handleChange} 
            />
            {errors.hotelName && <p className="mt-1 ml-2 text-red-900 text-[10px] font-black uppercase tracking-widest">{errors.hotelName}</p>}
          </div>

          <div className="group">
            <label className="block text-amber-950 text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">Owner Name</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.ownerName ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="ownerName" placeholder="Your Name" value={formData.ownerName} onChange={handleChange} 
            />
            {errors.ownerName && <p className="mt-1 ml-2 text-red-900 text-[10px] font-black uppercase tracking-widest">{errors.ownerName}</p>}
          </div>

          <div className="group">
            <label className="block text-amber-950 text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">Phone Number</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="phone" placeholder="+94 77 123 4567" value={formData.phone} onChange={handleChange} 
            />
            {errors.phone && <p className="mt-1 ml-2 text-red-900 text-[10px] font-black uppercase tracking-widest">{errors.phone}</p>}
          </div>

          <div className="group">
            <label className="block text-amber-950 text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">Email</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="email" type="email" placeholder="admin@hotel.com" value={formData.email} onChange={handleChange} 
            />
            {errors.email && <p className="mt-1 ml-2 text-red-900 text-[10px] font-black uppercase tracking-widest">{errors.email}</p>}
          </div>

          <div className="group">
            <label className="block text-amber-950 text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">Password</label>
            <input 
              className={`w-full px-6 py-4 bg-white/20 border ${errors.password ? 'border-red-500' : 'border-white/20'} rounded-2xl text-amber-950 placeholder-amber-900/50 outline-none focus:border-amber-600 focus:bg-white/30 transition-all shadow-inner`} 
              name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} 
            />
            {errors.password && <p className="mt-1 ml-2 text-red-900 text-[10px] font-black uppercase tracking-widest">{errors.password}</p>}
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              disabled={isSubmitting}
              className={`w-full py-4 ${isSubmitting ? 'bg-amber-950/50 cursor-not-allowed' : 'bg-amber-950 hover:bg-black'} text-yellow-400 font-black rounded-2xl shadow-[0_10px_20px_-5px_rgba(124,45,18,0.4)] transform active:scale-[0.98] transition-all duration-200 uppercase tracking-widest text-sm`} 
              type="submit"
            >
              {isSubmitting ? 'Encrypting Details...' : 'Register Hotel Instance'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-amber-950/10 pt-6">
            <p className="text-amber-950/70 text-sm font-medium">
                Already part of the ecosystem? 
                <Link to="/login" className="ml-2 text-amber-950 font-extrabold hover:underline transition-colors uppercase tracking-tighter">Sign In here</Link>
            </p>
        </div>
      </div>
    </div>
  );
}