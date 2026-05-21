import React, { useState, useRef } from 'react';

const CreateDeadlineModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); // ရွေးလိုက်တဲ့ ဖိုင်ကို State ထဲသိမ်းမယ်
    }
  };

  /*const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) return alert("Please fill all fields");

    onSubmit({
      id: Date.now(),
    name: name,
    description: description,
    timestamp: date ? `Due: ${date.replace('T', ' ')}` : "Due: Not Set",
    status: "In progress",
    
    // စာသားသက်သက်တင် မဟုတ်ဘဲ တကယ့် File object ကိုပါ ပို့လိုက်မယ်
    fileObject: selectedFile ? selectedFile : null, 
    fileName: selectedFile ? selectedFile.name : null 
    });

    // Reset fields
    setName('');
    setDescription('');
    setDate('');
    setSelectedFile(null);
    onClose();
  };*/

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!name || !description) return alert("Please fill all fields");

  // Format date correctly for API
  let dueDate = '';
  let dueTime = '';
  let timestamp = '';
  
  if (date) {
    const dateObj = new Date(date);
    dueDate = dateObj.toISOString().split('T')[0];
    dueTime = dateObj.toLocaleTimeString();
    timestamp = `Due: ${dateObj.toLocaleString()}`;
  } else {
    // Default: 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    dueDate = defaultDate.toISOString().split('T')[0];
    dueTime = '23:59:00';
    timestamp = `Due: ${defaultDate.toLocaleString()}`;
  }

  onSubmit({
    id: Date.now(),
    name: name,
    description: description,
    title: name,
    dueDate: dueDate,
    dueTime: dueTime,
    timestamp: timestamp,
    status: "pending",
    priority: "medium",
    fileObject: selectedFile,
    fileName: selectedFile ? selectedFile.name : null,
    file: selectedFile
  });

  // Reset fields
  setName('');
  setDescription('');
  setDate('');
  setSelectedFile(null);
  onClose();
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-purple-600 p-5 text-white text-center">
          <h3 className="text-xl font-black">📝 Create New Deadline</h3>
          <p className="text-purple-100 text-xs mt-0.5">Add a new task to your schedule</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deadline Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HCI Final Project"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 transition-all text-sm text-slate-800"
            />
          </div>

          {/* 2. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 transition-all text-sm resize-none text-slate-800"
            ></textarea>
          </div>

          {/* 3. Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
            <input 
              type="datetime-local" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 transition-all text-sm text-slate-800"
            />
          </div>

          {/* 4. Attach File */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attachments</label>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />

            {/* ဖိုင်ရွေးပြီးရင် ဖိုင်နာမည် အရှည်ကြီးဖြစ်နေရင် အစက်လေးတွေနဲ့ ဖြတ်ပြပေးမယ့် ပုံစံကို လုံခြုံအောင် ပြင်ထားပါတယ် */}
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={`w-full px-4 py-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                selectedFile 
                  ? 'border-green-400 bg-green-50 text-green-600' 
                  : 'border-slate-200 text-slate-400 hover:border-purple-400 hover:text-purple-500'
              }`}
            >
              {selectedFile ? (
                <span className="truncate max-w-[250px]">📎 {selectedFile.name}</span>
              ) : (
                <span>📎 Attach File / Pic</span>
              )}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="flex-[2] bg-purple-600 text-white font-bold py-3 rounded-xl shadow-md shadow-purple-100 active:scale-95 transition-all text-sm">
              Create Deadline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeadlineModal;