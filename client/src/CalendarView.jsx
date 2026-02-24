import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Billing() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      // 1. Fetch all bookings from database
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { 'x-auth-token': token }
      });
      
      const allBookings = res.data;

      // 2. Load generated invoices from local storage (Simulating DB persistence for invoices)
      const storedHistory = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
      setInvoiceHistory(storedHistory);

      // 3. Filter: Active Bills are bookings that are NOT yet in the invoice history
      const historyIds = new Set(storedHistory.map(inv => inv.bookingId));
      const pending = allBookings.filter(b => !historyIds.has(b.id) && b.status !== 'CANCELLED');
      
      setActiveBookings(pending);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateInvoice = (booking) => {
    const doc = new jsPDF();
    const invoiceNum = "INV-" + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().split('T')[0];
    const amount = parseFloat(booking.totalAmount || 0);
    const tax = amount * 0.12; 
    const total = amount + tax;

    // --- PDF GENERATION ---
    doc.setFillColor(255, 165, 0); 
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", 14, 13);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoiceNum}`, 14, 40);
    doc.text(`Date: ${dateStr}`, 14, 46);
    
    doc.setFontSize(14);
    doc.text("Bill To:", 14, 60);
    doc.setFontSize(11);
    doc.text(`Guest: ${booking.guestName}`, 14, 66);
    doc.text(`Email: ${booking.guestEmail || 'N/A'}`, 14, 72);
    doc.text(`Room: ${booking.Room ? booking.Room.roomNumber : 'Unassigned'}`, 14, 78);

    autoTable(doc, {
        startY: 90,
        head: [['Description', 'Amount']],
        body: [
            [`Room Charge (${booking.Room?.type || 'Standard'})`, `$${amount.toFixed(2)}`],
            ['Taxes (12%)', `$${tax.toFixed(2)}`],
            ['Total Due', `$${total.toFixed(2)}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 58, 74] }
    });

    doc.save(`${invoiceNum}_${booking.guestName}.pdf`);

    // --- UPDATE STATE ---
    // Default status set to 'Unpaid' so user can mark it Paid later
    const newInvoice = {
        invoiceNumber: invoiceNum,
        bookingId: booking.id,
        guest: booking.guestName,
        date: dateStr,
        amount: total.toFixed(2),
        status: 'Unpaid' 
    };

    const updatedHistory = [newInvoice, ...invoiceHistory];
    setInvoiceHistory(updatedHistory);
    localStorage.setItem('invoiceHistory', JSON.stringify(updatedHistory)); 
    
    setActiveBookings(activeBookings.filter(b => b.id !== booking.id));
    alert("✅ Invoice Generated! You can now update its payment status.");
  };

  // --- NEW: Update Invoice Status ---
  const handleStatusChange = (index, newStatus) => {
    const updatedHistory = [...invoiceHistory];
    updatedHistory[index].status = newStatus;
    setInvoiceHistory(updatedHistory);
    localStorage.setItem('invoiceHistory', JSON.stringify(updatedHistory));
  };

  // Helper for Badge Color
  const getStatusColor = (status) => {
      switch (status) {
          case 'Paid': return 'bg-green-50 text-green-700 border-green-200';
          case 'Unpaid': return 'bg-red-50 text-red-700 border-red-200';
          case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-200';
          default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
  };

  const getStatusDot = (status) => {
      switch (status) {
          case 'Paid': return 'bg-green-500';
          case 'Unpaid': return 'bg-red-500';
          case 'Pending': return 'bg-orange-500';
          default: return 'bg-gray-500';
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      
    

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        
        {/* Header */}
        <div className="px-8 py-8 bg-white border-b border-gray-100 sticky top-0 z-10">
           <div>
              <h2 className="text-2xl font-bold text-slate-900">Billing & Invoicing</h2>
              <p className="text-slate-500 mt-1">Manage payments, invoices, and discounts.</p>
           </div>

           {/* Tabs */}
           <div className="mt-8 flex items-center gap-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('active')}
                className={`pb-3 text-sm font-bold transition-all ${activeTab === 'active' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Generate Invoice
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-bold transition-all ${activeTab === 'history' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Invoice History
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
           
           {/* TAB 1: ACTIVE BILLS */}
           {activeTab === 'active' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeBookings.length > 0 ? activeBookings.map(booking => (
                   <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="font-bold text-lg text-gray-900">{booking.guestName}</h3>
                            <p className="text-sm text-gray-500">{booking.Room ? `Room ${booking.Room.roomNumber}` : 'Room Unassigned'}</p>
                         </div>
                         <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold">Pending Invoice</span>
                      </div>
                      
                      <div className="space-y-2 border-t border-b border-gray-100 py-4 my-4 text-sm">
                         <div className="flex justify-between">
                            <span className="text-gray-600">Room Rate</span>
                            <span className="font-medium">${parseFloat(booking.totalAmount).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Taxes (12%)</span>
                            <span className="font-medium">${(parseFloat(booking.totalAmount) * 0.12).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between pt-2 font-bold text-gray-900 text-base">
                            <span>Total</span>
                            <span>${(parseFloat(booking.totalAmount) * 1.12).toFixed(2)}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => generateInvoice(booking)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-md transition flex justify-center items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Generate Invoice
                      </button>
                   </div>
                )) : (
                   <div className="col-span-full text-center py-20 text-gray-400">
                      <p>No pending bills found. All bookings have invoices.</p>
                   </div>
                )}
             </div>
           )}

           {/* TAB 2: INVOICE HISTORY */}
           {activeTab === 'history' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Invoice #</th>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Guest</th>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                         <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions (Select Status)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {invoiceHistory.map((inv, idx) => (
                         <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{inv.invoiceNumber}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{inv.guest}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">${inv.amount}</td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(inv.status)}`}></span> 
                                  {inv.status}
                               </span>
                            </td>
                            {/* ACTIONS COLUMN: Dropdown + Download */}
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-3">
                                  <select 
                                    value={inv.status} 
                                    onChange={(e) => handleStatusChange(idx, e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-700 text-xs rounded p-1.5 outline-none focus:border-amber-500 cursor-pointer hover:bg-gray-50"
                                  >
                                     <option value="Paid">Paid</option>
                                     <option value="Unpaid">Unpaid</option>
                                     <option value="Pending">Pending</option>
                                  </select>
                                  
                               </div>
                            </td>
                         </tr>
                      ))}
                      {invoiceHistory.length === 0 && (
                         <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No invoices generated yet.</td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS & ICONS ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition ${active ? 'border-amber-500 bg-slate-800 text-amber-500' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}>
     {icon} <span className="font-medium">{label}</span>
  </button>
);

const DashboardIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const CalendarIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const BedIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UserIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UsersIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DollarIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;