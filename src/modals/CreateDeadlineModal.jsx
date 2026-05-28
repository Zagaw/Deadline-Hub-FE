import React, { useState, useEffect } from 'react';

const CreateDeadlineModal = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState('medium');

  // 💡 Edit လုပ်မည့် Data ရှိပါက မူရင်း Data များကို ဖြည့်ပေးမည့် Logic
  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setDescription(editData.description || '');
      setDueDate(editData.rawDate || '');
      if (editData.timestamp && editData.timestamp.includes(':')) {
        const timePart = editData.timestamp.split(' ')[2] || '23:59';
        setDueTime(timePart.substring(0, 5));
      }
      setPriority(editData.priority || 'medium');
    } else {
      // Clear Form if Create Mode
      setName('');
      setDescription('');
      setDueDate('');
      setDueTime('23:59');
      setPriority('medium');
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) return;

    onSubmit({
      id: editData?.id, // Edit ဆိုရင် ID ပါသွားမည်
      name,
      description,
      dueDate,
      dueTime: `${dueTime}:00`,
      priority,
      timestamp: `Due: ${dueDate} ${dueTime}:00`
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="text-xl font-black text-slate-800 mb-4">
          {editData ? '✏️ Deadline ပြင်ဆင်ရန်' : '📝 Deadline အသစ်ဆောက်ရန်'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase block mb-1">ခေါင်းစဉ်</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-purple-500 text-sm font-medium" />
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase block mb-1">အကြောင်းအရာ</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-purple-500 text-sm font-medium h-20 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase block mb-1">သတ်မှတ်ရက်</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 text-sm" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase block mb-1">အချိန်</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase block mb-1">ဦးစားပေးအဆင့်</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button type="button" key={p} onClick={() => setPriority(p)} className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all border ${priority === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">ပယ်ဖျက်မည်</button>
            <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-sm transition-colors">{editData ? 'သိမ်းဆည်းမည်' : 'ဖန်တီးမည်'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeadlineModal;