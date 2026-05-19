import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DeadlineCard from '../components/DeadlineCard';
import CreateDeadlineModal from '../modals/CreateDeadlineModal';
import CommentDrawer from '../modals/CommentDrawer';

const Dashboard = () => {
  const [activeChat, setActiveChat] = useState('personal');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);

  // Default Deadlines Data List
  const [deadlines, setDeadlines] = useState([
    { id: 1, name: "HCI Assignment 1", description: "Figma UI Design ဆွဲရန်။", timestamp: "Due: 2026-05-25 12:00", status: "In progress", comments: [] },
    { id: 2, name: "OS Project", description: "Shell Script ရေးပြီး တင်ရန်။", timestamp: "Due: 2026-06-01 23:59", status: "Done", comments: [] }
  ]);

  // Card ရဲ့ Status (Done / In progress) ပြောင်းလဲပေးမည့် Function
  const handleToggleStatus = (id) => {
    const updatedDeadlines = deadlines.map((dl) => {
      if (dl.id === id) {
        return {
          ...dl,
          status: dl.status === 'Done' ? 'In progress' : 'Done'
        };
      }
      return dl;
    });
    setDeadlines(updatedDeadlines);
  };

  // Deadline အသစ်ထည့်ပေးမည့် Function
  const handleAddDeadline = (newDl) => {
    setDeadlines([{ ...newDl, comments: [] }, ...deadlines]);
  };

  // Comment အသစ်ထည့်ပေးမည့် Function
  const handleAddComment = (deadlineId, newComment) => {
    const updatedDeadlines = deadlines.map((dl) => {
      if (dl.id === deadlineId) {
        const updatedComments = dl.comments ? [...dl.comments, newComment] : [newComment];
        const updatedDl = { ...dl, comments: updatedComments };
        setSelectedDeadline(updatedDl); 
        return updatedDl;
      }
      return dl;
    });
    setDeadlines(updatedDeadlines);
  };

  const openCommentDrawer = (deadline) => {
    setSelectedDeadline(deadline);
    setShowCommentDrawer(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ဘယ်ဘက်ခြမ်း Sidebar */}
      <Sidebar />
      
      {/* ညာဘက်ခြမ်း Main Content */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* Header Area */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveChat('personal')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeChat === 'personal' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>👤 Personal Chat</button>
            <button onClick={() => setActiveChat('group')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeChat === 'group' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>👥 Group Chats</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 rounded-xl">🔔</button>
            <button onClick={() => setShowProfile(!showProfile)} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">⚙️ Profile</button>
          </div>
        </header>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800">
              {activeChat === 'personal' ? 'My Personal Space' : 'Study Group Alpha 🎒'}
            </h2>
            <button onClick={() => setShowCreateModal(true)} className="bg-purple-600 text-white font-black px-4 py-2 rounded-xl text-sm shadow-md">
              📝 Create Deadline
            </button>
          </div>

          {/* ✨ ပြင်ဆင်ပြီးသား နေရာဖြစ်ပါတယ်- ဒုတိယထပ်နေတဲ့ အကွက်ကြီးကို ရှင်းထုတ်ပြီး တစ်ခုတည်းပဲ ချန်ထားပါတယ်ဗျာ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deadlines.map((dl) => (
              <DeadlineCard 
                key={dl.id} 
                deadline={dl} 
                onCommentClick={() => openCommentDrawer(dl)} 
                onToggleStatus={handleToggleStatus} 
              />
            ))}
          </div>
        </main>
      </div>

      {/* Create Deadline ပေါ့ပ်အပ် */}
      <CreateDeadlineModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleAddDeadline} />
      
      {/* Comment ပေးရန် Slide Drawer */}
      <CommentDrawer 
        isOpen={showCommentDrawer} 
        onClose={() => setShowCommentDrawer(false)} 
        deadline={selectedDeadline}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default Dashboard;