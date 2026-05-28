import React, { useState, useEffect } from 'react';

const DeadlineCard = ({ deadline, onCommentClick, onToggleStatus, onEditClick }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progressPercent, setProgressPercent] = useState(100);
  const isDone = deadline.status === 'Done';

  // Progress Ring လျော့နည်းမှုအတွက် သတ်မှတ်ချက် (ရက်ပေါင်း ၃၀ အခြေခံ)
  const TOTAL_DURATION_DAYS = 30; 

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!deadline.rawDate) return;
      
      const targetDate = new Date(`${deadline.rawDate}T23:59:59`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgressPercent(0);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });

      // Clockwise Progress တွက်ချက်ခြင်း
      const totalSecondsLeft = (d * 86400) + (h * 3600) + (m * 60) + s;
      const totalMaxSeconds = TOTAL_DURATION_DAYS * 86400;
      const percent = Math.min(Math.max((totalSecondsLeft / totalMaxSeconds) * 100, 0), 100);
      setProgressPercent(percent);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deadline.rawDate]);

  // Helper function to format the center display text
  const getCenterDisplayText = () => {
    if (isDone) return 'Done';
    if (timeLeft.days > 0) return `${timeLeft.days}d`;
    // If days = 0, show hours or minutes
    if (timeLeft.hours > 0) return `${timeLeft.hours}h`;
    if (timeLeft.minutes > 0) return `${timeLeft.minutes}m`;
    return `${timeLeft.seconds}s`;
  };

  // Helper function to check if this is a "today" deadline (0 days left but not expired)
  const isTodayDeadline = () => {
    if (isDone) return false;
    return timeLeft.days === 0 && (timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0);
  };

  // SVG parameters
  const radius = 28;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (progressPercent / 100) * strokeDasharray;

  // Priority Badge အရောင်သတ်မှတ်ချက်
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className={`bg-white rounded-3xl border p-5 flex flex-col justify-between w-full max-w-[350px] min-h-[175px] transition-all duration-300 ${isDone ? 'border-emerald-300 bg-emerald-50/5' : 'border-slate-200 shadow-xs hover:shadow-md'}`}>
      
      {/* 🔝 Upper Layout Area */}
      <div className="flex justify-between items-start gap-3">
        
        {/* Left: Checkbox + (Priority + Title + Desc) */}
        <div className="flex gap-3 flex-1">
          {/* Checkbox */}
          <button 
            onClick={() => onToggleStatus(deadline.roomId, deadline.id)}
            className={`w-5 h-5 rounded-md border-2 mt-1 flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-purple-500'}`}
          >
            {isDone && '✓'}
          </button>

          {/* Text Content Stack */}
          <div className="flex flex-col gap-1">
            {/* ⭐ Priority Tag */}
            <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border w-fit select-none ${getPriorityStyle(deadline.priority)}`}>
              {deadline.priority || 'medium'}
            </span>

            {/* Title */}
            <h3 className={`text-base font-black text-slate-800 tracking-tight leading-tight mt-0.5 ${isDone ? 'line-through text-slate-400 font-medium' : ''}`}>
              {deadline.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-400 font-medium leading-normal max-w-[170px] break-words">
              {deadline.description || 'No description'}
            </p>
          </div>
        </div>

        {/* Right: Ring Container */}
        <div className="flex flex-col items-center shrink-0 select-none">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 68 68">
              <circle cx="34" cy="34" r={radius} className="stroke-slate-100" strokeWidth="5" fill="transparent" />
              <circle 
                cx="34" 
                cy="34" 
                r={radius} 
                className={`transition-all duration-1000 ease-linear ${isDone ? 'stroke-emerald-500' : 'stroke-purple-600'}`}
                strokeWidth="5" 
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={isDone ? 0 : strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-black tracking-tight ${isTodayDeadline() ? 'text-amber-600 text-[11px]' : (isDone ? 'text-emerald-600' : 'text-slate-800')}`}>
                {getCenterDisplayText()}
              </span>
            </div>
          </div>

          {/* Time text below ring - Show full HMS for today deadlines */}
          {!isDone && (
            <div className="mt-1 flex flex-col items-center">
              {isTodayDeadline() ? (
                // For today's deadlines, show full HMS countdown
                <span className="text-[10px] font-black text-amber-600 font-mono tracking-tight bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                  {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              ) : timeLeft.days > 0 ? (
                // For future deadlines, show just HMS as before
                <span className="text-[10px] font-black text-slate-700 font-mono tracking-tight bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                  {timeLeft.hours}h {timeLeft.minutes}m <span className="text-[9px] font-bold font-mono text-purple-600/70 tracking-tighter">
                    {timeLeft.seconds}s
                  </span>
                </span>
              ) : (
                // For expired deadlines
                <span className="text-[10px] font-black text-red-500 font-mono tracking-tight bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                  Expired
                </span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 🔽 Bottom Action Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Due Date Info */}
        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          Due: <span className="text-slate-600 font-mono font-black">{deadline.rawDate || '-'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Edit Button */}
          <button 
            onClick={() => onEditClick(deadline)}
            className="text-[11px] font-black text-slate-600 hover:text-purple-600 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
          >
            ✏️ 
          </button>
          
          {/* Comment Button */}
          <button 
            onClick={onCommentClick}
            className="text-[11px] font-black text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
          >
            💬 {deadline.comments?.length || 0}
          </button>
        </div>
      </div>

    </div>
  );
};

export default DeadlineCard;