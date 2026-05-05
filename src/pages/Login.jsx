import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate(); // Navigation function ကို ကြေညာပါ

  const handleLogin = (e) => {
    e.preventDefault(); // Form က Refresh မဖြစ်အောင် တားတာပါ

    // ဒီနေရာမှာ နောက်ပိုင်းကျရင် Member 1 က Backend နဲ့ ချိတ်တဲ့ logic ရေးပါလိမ့်မယ်
    // အခုလောလောဆယ် ခလုတ်နှိပ်ရင် Dashboard ကို တန်းသွားအောင် လုပ်ထားမယ်
    navigate('/dashboard');};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      {/* Login Card */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-white text-3xl font-black">!</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Deadline Hub</h2>
          <p className="text-slate-500 mt-2">Login to manage your deadlines</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="enter the password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="mr-2 accent-purple-600" /> Remember me
            </label>
            <a href="#" className="text-purple-600 font-semibold hover:underline">Forgot Password?</a>
          </div>

          <button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95">
            Login to Dashboard
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-600 mt-8 text-sm">
          Don't have an account? 
          <Link to="/register" className="text-purple-600 font-bold ml-1 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;