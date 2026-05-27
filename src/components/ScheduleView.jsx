import React, { useState } from 'react';

const ScheduleView = ({ deadlines }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  
  // ယနေ့ ရက်စွဲအမှန်ကို ရယူထားခြင်း (Today Button နှင့် ယနေ့ရက်စွဲကို Highlight ပြရန်)
  const today = new Date();
  
  // 📆 လက်ရှိကြည့်နေသော ပြက္ခဒိန်ရက်စွဲ State
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Jan, 11 = Dec

  // လအမည်များ
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // တွက်ချက်မှုများ-
  // ၁။ ရွေးချယ်ထားသော လတွင် စုစုပေါင်း ရက်ပေါင်း မည်မျှရှိသလဲ Dynamic တွက်ချက်ခြင်း
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // ၂။ ထိုလ၏ ရက်စတင်သောနေ့သည် ဘာနေ့လဲ (0 = Sun, 1 = Mon, ...)
  const startDayOffset = new Date(year, month, 1).getDay();

  // ⬅️ ယခင်လသို့ သွားရန်
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // ➡️ နောက်လသို့ သွားရန်
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 🏠 ယနေ့ကျရောက်ရာ လ/နှစ် သို့ ချက်ချင်းပြန်သွားရန် (Today Button Logic)
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // ပြက္ခဒိန် Grid Cells တည်ဆောက်ခြင်း
  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null); // လဆန်းရက်မတိုင်ခင် အကွက်လွတ်များ
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // ရက်အလိုက် API Deadline စစ်ဆေးပေးမည့် Function
  const getDeadlinesForDay = (day) => {
    if (!day) return [];
    
    const pad = (n) => n < 10 ? '0' + n : n;
    // API Format "YYYY-MM-DD" ပုံစံဖြင့် ညှိနှိုင်းစစ်ဆေးခြင်း
    const formattedDayStr = `${year}-${pad(month + 1)}-${pad(day)}`; 

    return deadlines.filter(dl => {
      if (!dl.rawDate) return false;
      return dl.rawDate.startsWith(formattedDayStr);
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in duration-200">
      
      {/* 🔄 Calendar Header Navigation (မြှားဒီဇိုင်းအသစ်နှင့် Today Button) */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl gap-4">
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-xs border border-slate-200">
          {/* ဘယ်ဘက်မြှား ခလုတ် (Modern Style) */}
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer text-sm font-bold flex items-center justify-center"
            title="Previous Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* ပြောင်းလဲထားသော သပ်ရပ်လှပသည့် ပြက္ခဒိန်ခေါင်းစဉ် */}
          <h3 className="text-sm font-black text-slate-800 px-4 min-w-[140px] text-center select-none">
            {monthNames[month]} {year}
          </h3>

          {/* ညာဘက်မြှား ခလုတ် (Modern Style) */}
          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer text-sm font-bold flex items-center justify-center"
            title="Next Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* ⚡ Right Actions: Today Button & Status Count */}
        <div className="flex items-center gap-3">
          {/* ✨ Today ပြန်လာမည့် ခလုတ်လေး */}
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            🎯 Today
          </button>

          <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
            Total Load: {deadlines.length} Tasks
          </span>
        </div>
      </div>

      {/* Week Days Label */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-3 min-h-[400px]">
        {calendarCells.map((day, idx) => {
          const dayDeadlines = getDeadlinesForDay(day);
          
          // ယနေ့ ရက်စွဲအမှန် ဟုတ်/မဟုတ် စစ်ဆေးခြင်း
          const isCurrentToday = day && 
            day === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear();
          
          return (
            <div 
              key={idx} 
              className={`p-2 border rounded-2xl min-h-[90px] flex flex-col justify-between transition-all relative ${
                day 
                  ? isCurrentToday
                    ? 'bg-purple-50/20 border-purple-400 shadow-xs' // ယနေ့ရက်စွဲဖြစ်ပါက ခရမ်းရောင်အနားသတ်ပြမည်
                    : 'bg-white border-slate-100 hover:bg-slate-50/50' 
                  : 'bg-slate-50/30 border-none'
              }`}
            >
              {day && (
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black p-1.5 inline-block w-6 h-6 text-center rounded-lg ${
                    dayDeadlines.length > 0 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : isCurrentToday ? 'bg-purple-200 text-purple-800' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  {isCurrentToday && (
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping mt-1 mr-1"></span>
                  )}
                </div>
              )}

              {/* Deadline Tasks List */}
              <div className="flex-1 mt-1.5 space-y-1 overflow-hidden max-h-[60px] overflow-y-auto custom-scrollbar">
                {dayDeadlines.map(dl => (
                  <div 
                    key={dl.id}
                    onClick={() => setSelectedTask(dl)}
                    className={`text-[10px] font-bold p-1 rounded-lg cursor-pointer truncate transition-all active:scale-95 border ${
                      dl.status === 'Done' 
                        ? 'bg-green-50 text-green-600 border-green-100 line-through' 
                        : 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300'
                    }`}
                    title={dl.name}
                  >
                    📌 {dl.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Description Detail Modal Pop-up */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Deadline Info</span>
                <h4 className="text-lg font-black text-slate-800 mt-1">{selectedTask.name}</h4>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-xl font-bold uppercase ${selectedTask.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {selectedTask.status}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">📋 Description</p>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{selectedTask.description || 'No description provided.'}</p>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">⏰ Time: {selectedTask.timestamp}</p>

            <button 
              type="button"
              onClick={() => setSelectedTask(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Detail
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScheduleView;