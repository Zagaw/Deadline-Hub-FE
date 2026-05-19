import React, { useState, useEffect } from 'react';

const DeadlineCard = ({ deadline, onCommentClick, onToggleStatus }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // ⏱️ Countdown Timer Logic
  useEffect(() => {
    // တကယ်လို့ Task က Done ဖြစ်သွားရင် Countdown တွက်စရာမလိုတော့ပါ
    if (deadline.status === 'Done') {
      setTimeLeft('Task Completed! 🎉');
      return;
    }

    const calculateTimeLeft = () => {
      // Due Date ရဲ့ String ထဲက 'Due: ' ကို ဖယ်ပြီး အချိန်ပြောင်းလဲခြင်း
      const targetDateStr = deadline.timestamp.replace('Due: ', '').trim();
      const difference = +new Date(targetDateStr) - +new Date();
      
      if (difference <= 0) {
        return 'Time is up! ⏰';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    };

    // စစချင်း တစ်ကြိမ် Run မယ်
    setTimeLeft(calculateTimeLeft());

    // ၁ စက္ကန့်တိုင်း အလိုအလျောက် အချိန်ပြောင်းလဲစေမယ်
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline.timestamp, deadline.status]);

  const handleOpenFile = () => {
    if (deadline.fileObject) {
      const fileURL = URL.createObjectURL(deadline.fileObject);
      window.open(fileURL, '_blank');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-[270px] transition-all hover:shadow-md">
      
      <div className="space-y-3 overflow-hidden">
        
        {/* Header: Title & Complete/Undo Button */}
        <div className="flex justify-between items-start gap-2">
          <div className="overflow-hidden flex-1">
            <h4 className={`text-base font-black text-slate-800 truncate ${deadline.status === 'Done' ? 'line-through text-slate-400' : ''}`} title={deadline.name}>
              {deadline.name}
            </h4>
            
            {/* Countdown ပြသရမည့်နေရာ (ရက်၊ နာရီ၊ မိနစ်၊ စက္ကန့်) */}
            <p className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${
              deadline.status === 'Done' 
                ? 'bg-green-50 text-green-600' 
                : timeLeft.includes('Time is up') ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-purple-50 text-purple-600'
            }`}>
              ⏳ {timeLeft}
            </p>
          </div>

          {/* 🔘 Status Toggle Button (ပြီးမြောက်ကြောင်း နှိပ်ရန် ခလုတ်) */}
          <button 
            onClick={() => onToggleStatus(deadline.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all active:scale-95 cursor-pointer ${
              deadline.status === 'Done' 
                ? 'bg-green-600 text-white shadow-md shadow-green-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-purple-600 hover:text-white'
            }`}
          >
            {deadline.status === 'Done' ? '✓ Done' : 'Mark Done'}
          </button>
        </div>

        {/* Description */}
        <p className={`text-xs text-slate-500 leading-relaxed line-clamp-2 ${deadline.status === 'Done' ? 'text-slate-300' : ''}`}>
          {deadline.description}
        </p>

        {/* Attached File */}
        {deadline.fileName && (
          <div className="pt-1">
            <button 
              type="button"
              onClick={handleOpenFile}
              className="bg-purple-50 hover:bg-purple-100 text-purple-600 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-purple-100/50 transition-all max-w-full truncate flex items-center gap-1 cursor-pointer"
            >
              📄 {deadline.fileName}
            </button>
          </div>
        )}
      </div>

      {/* Footer: Comment Button */}
      <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
        <button 
          onClick={onCommentClick}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-600 transition-colors font-bold bg-slate-50 hover:bg-purple-50 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          💬 Comment {deadline.comments?.length > 0 && `(${deadline.comments.length})`}
        </button>
      </div>

    </div>
  );
};

export default DeadlineCard;