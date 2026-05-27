import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentView, onViewChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Auth state/token တွေကို ရှင်းထုတ်ရန် လိုအပ်ပါက ဒီနေရာမှာ ထည့်နိုင်ပါတယ်
    localStorage.removeItem('token'); // Token သုံးထားပါက တစ်ခါတည်း ဖျက်ပေးခြင်း
    navigate('/login'); // Logout နှိပ်ရင် Login Page ကို ပြန်ပို့မယ်
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white p-7 flex flex-col justify-between shrink-0">
      <div>
        <h2 className="text-2xl font-bold mb-10 text-blue-400">Deadline Hub</h2>
        
        <ul className="space-y-4 font-medium">
          {/* 🏠 Dashboard Button */}
          <li 
            onClick={() => onViewChange && onViewChange('dashboard')}
            className={`p-2 rounded cursor-pointer transition-all ${
              currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🏠 Dashboard
          </li>

          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer text-slate-300 hover:text-white">
            📚 My Courses
          </li>

          {/* 📅 Schedule Button */}
          <li 
            onClick={() => onViewChange && onViewChange('schedule')}
            className={`p-2 rounded cursor-pointer transition-all ${
              currentView === 'schedule' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📅 Schedule
          </li>

          <li className="hover:bg-slate-800 p-2 rounded cursor-pointer text-slate-300 hover:text-white">
            ⚙️ Settings
          </li>
        </ul>
      </div>

      {/* အောက်ဆုံးမှ Logout ခလုတ် */}
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