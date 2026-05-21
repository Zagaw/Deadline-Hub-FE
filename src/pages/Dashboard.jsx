import React, { useState ,useEffect  } from 'react';
import Sidebar from '../components/Sidebar';
import DeadlineCard from '../components/DeadlineCard';
import CreateDeadlineModal from '../modals/CreateDeadlineModal';
import CommentDrawer from '../modals/CommentDrawer';
import { getDeadlines, createDeadline, updateDeadline, completeDeadline } from '../services/deadlineApi';

const Dashboard = () => {
    const [activeChat, setActiveChat] = useState('personal');
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const [showCommentDrawer, setShowCommentDrawer] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState(null);

    //add these lines 
    const [loading, setLoading] = useState(true);

    // Replace this Deadlines Data List
    const [deadlines, setDeadlines] = useState([]);

    // 👇 ADD THIS useEffect to load deadlines from API
    useEffect(() => {
      loadDeadlines();
    }, []);

      // 👇 ADD THIS NEW FUNCTION to load deadlines from API
    const loadDeadlines = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, user not logged in');
          setLoading(false);
          return;
        }
      
      const data = await getDeadlines();
      console.log('Loaded deadlines:', data);

      // Transform API data to match your component's expected format
      const formattedDeadlines = data.deadlines.map(dl => ({
        id: dl.id,
        name: dl.title,
        description: dl.description || '',
        timestamp: `Due: ${new Date(dl.dueDate).toLocaleDateString()} ${dl.dueTime}`,
        status: dl.status === 'completed' ? 'Done' : (dl.status === 'overdue' ? 'Overdue' : 'In progress'),
        priority: dl.priority,
        fileUrl: dl.fileUrl,
        fileName: dl.fileName,
        comments: dl.comments || []
      }));
      setDeadlines(formattedDeadlines);
      } catch (error) {
        console.error('Failed to load deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    // Card ရဲ့ Status (Done / In progress) ပြောင်းလဲပေးမည့် Function
    /*const handleToggleStatus = (id) => {
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
    };*/

      // 👇 REPLACE this handleToggleStatus function
    const handleToggleStatus = async (id) => {
      const deadline = deadlines.find(dl => dl.id === id);
      if (!deadline) return;
      try {
        if (deadline.status === 'Done') {
          // Reactivate - update status to pending
          await updateDeadline(id, { status: 'pending' });
        } else {
          // Mark as completed
          await completeDeadline(id);
        }
        await loadDeadlines(); // Reload the list
      } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update deadline status');
      }
    };

  // Deadline အသစ်ထည့်ပေးမည့် Function
  /*const handleAddDeadline = (newDl) => {
    setDeadlines([{ ...newDl, comments: [] }, ...deadlines]);
  };*/

    // 👇 REPLACE this handleAddDeadline function
      const handleAddDeadline = async (newDl) => {
        try {
          // Format date properly for API
          let dueDate, dueTime;
          if (newDl.timestamp && newDl.timestamp.includes('Due:')) {
            const dateStr = newDl.timestamp.replace('Due: ', '');
            const dateObj = new Date(dateStr);
            dueDate = dateObj.toISOString().split('T')[0];
            dueTime = dateObj.toLocaleTimeString();
          } else if (newDl.dueDate && newDl.dueTime) {
            dueDate = newDl.dueDate;
            dueTime = newDl.dueTime;
          } else {
            // Default: 7 days from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            dueDate = defaultDate.toISOString().split('T')[0];
            dueTime = '23:59:00';
          }
      
      const apiData = {
        title: newDl.name,
        description: newDl.description,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: newDl.priority || 'medium',
        file: newDl.fileObject || null,
      };
      await createDeadline(apiData);
      await loadDeadlines(); // Reload the list
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create deadline:', error);
      alert('Failed to create deadline: ' + error.message);
    }
  };

  // 👇 ADD THIS NEW FUNCTION for updating deadline (for comments)
  const handleUpdateDeadline = (updatedDeadline) => {
    const updatedDeadlines = deadlines.map(dl => 
      dl.id === updatedDeadline.id ? updatedDeadline : dl
    );
    setDeadlines(updatedDeadlines);
    setSelectedDeadline(updatedDeadline);
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

            {/* Loading indicator */}
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading deadlines...</div>
          ) : deadlines.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No deadlines yet. Create your first deadline!</div>
          ) : (
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
          )}
        </main>
      </div>

      {/* Create Deadline ပေါ့ပ်အပ် */}
      <CreateDeadlineModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSubmit={handleAddDeadline} />
      
      {/* Comment ပေးရန် Slide Drawer */}
      <CommentDrawer 
        isOpen={showCommentDrawer} 
        onClose={() => setShowCommentDrawer(false)} 
        deadline={selectedDeadline}
        onAddComment={handleAddComment}
        onUpdateDeadline={handleUpdateDeadline}
      />
    </div>
  );
};

export default Dashboard;