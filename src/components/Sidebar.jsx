import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ဒီနေရာမှာ နောက်ပိုင်းကျရင် Auth state/token တွေကို ဖျက်မယ့် logic ထည့်ရပါမယ်
    navigate('/login'); // Logout နှိပ်ရင် Login Page ကို ပြန်ပို့မယ်
  };

  return (
    // လက်ရှိ ရှိပြီးသား <aside> ဒါမှမဟုတ် <div> ရဲ့ အောက်က ကုဒ်တွေနေရာမှာ...
    <div className="h-screen w-64 bg-slate-900 text-white p-7 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-10 text-blue-400">Deadline Hub</h2>
        
        <ul className="space-y-4 font-medium">
          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">🏠 Dashboard</li>
          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">📚 My Courses</li>
          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">📅 Schedule</li>
          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">⚙️ Settings</li>
        </ul>
      </div>

      {/* အောက်ဆုံးမှာ Logout ခလုတ်ကို ဒီလိုလေး သီးသန့် ထည့်ပေးပါမယ် */}
      <div className="border-t border-slate-800 pt-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 hover:bg-red-500/10 text-red-400 p-2 rounded cursor-pointer transition-colors font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;