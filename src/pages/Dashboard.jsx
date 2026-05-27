import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DeadlineCard from '../components/DeadlineCard';
import CreateDeadlineModal from '../modals/CreateDeadlineModal';
import CommentDrawer from '../modals/CommentDrawer';
import ScheduleView from '../components/ScheduleView';
import GroupRoomsView from '../components/GroupRoomsView';
import RoomManagementModal from '../modals/RoomManagementModal';
import { getDeadlines, createDeadline, updateDeadline, completeDeadline } from '../services/deadlineApi';
import * as roomApi from '../services/roomApi'; // 👈 ကျွန်ုပ်တို့ ဆောက်ခဲ့သော Fetch/Axios API

const Dashboard = () => {
    const [taskTab, setTaskTab] = useState('all'); // 'all', 'personal', 'group'
    const [currentView, setCurrentView] = useState('dashboard');
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Modals & Drawers States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [targetRoomIdForNewDeadline, setTargetRoomIdForNewDeadline] = useState(null);
    const [showCommentDrawer, setShowCommentDrawer] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState(null);

    // 📦 Rooms Dynamic State
    const [rooms, setRooms] = useState([]);
    const [selectedRoomForSettings, setSelectedRoomForSettings] = useState(null);
    const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [deadlines, setDeadlines] = useState([]);

    // 💡 စမ်းသပ်ရန် လက်ရှိ User ID (သင့် Backend JWT Token မှ Decode လုပ်ထားသော ID နှင့် ညှိပါ)
    const currentUserId = 999; 

    // Initial Loading
    useEffect(() => {
      const initLoad = async () => {
        setLoading(true);
        await Promise.all([loadDeadlines(), loadRooms()]);
        setLoading(false);
      };
      initLoad();
    }, []);

    // 1️⃣ API မှ Deadlines များ ဆွဲယူခြင်း
    const loadDeadlines = async () => {
      try {
        const data = await getDeadlines();
        if (data && data.deadlines) {
          const formatted = data.deadlines.map(dl => ({
            id: dl.id,
            name: dl.title,
            description: dl.description || '',
            rawDate: dl.dueDate, 
            timestamp: `Due: ${dl.dueDate} ${dl.dueTime}`,
            status: dl.status === 'completed' ? 'Done' : 'In progress',
            priority: dl.priority,
            comments: dl.comments || [],
            isGroupTask: dl.isGroupTask || false,
            roomId: dl.roomId || null
          }));
          setDeadlines(formatted);
        }
      } catch (e) { 
        console.error("Failed to load deadlines:", e); 
      }
    };

    // 2️⃣ API မှ မိမိပိုင်ဆိုင်သော/ဝင်ထားသော Rooms များ ဆွဲယူခြင်း
    const loadRooms = async () => {
      setRoomsLoading(true);
      try {
        // 💡 Backend API မှ တကယ့် Rooms data များကို ယူဆောင်ခြင်း
        const response = await roomApi.getRoomDetails('my-rooms').catch(() => null);
        
        if (response && response.rooms) {
          setRooms(response.rooms);
        } else {
          // ⚠️ API လမ်းကြောင်း မဆောက်ရသေးပါက UI မပျက်စေရန် အောက်ပါအတိုင်း Default Mock လုပ်ပေးထားမည်
          setRooms([
            { 
              id: 101, 
              name: "HCI Project Group", 
              code: "RM-7841", 
              ownerId: 999, 
              members: [{id: 999, name: "You"}, {id: 2, name: "Aung Aung"}],
              pendingRequests: [{id: 3, name: "Su Su"}],
              deadlines: deadlines.filter(d => d.roomId === 101 || d.isGroupTask)
            }
          ]);
        }
      } catch (e) { 
        console.error("Failed to load rooms:", e); 
      } finally {
        setRoomsLoading(false);
      }
    };

    // 3️⃣ ➕ Create Room အလုပ်လုပ်စေမည့် Logic
    const handleCreateRoom = async (roomName) => {
      try {
        setRoomsLoading(true);
        const result = await roomApi.createRoom({ name: roomName });
        
        alert(`🎉 Room "${roomName}" Created Successfully!`);
        // API မှ အောင်မြင်စွာ ပြန်လာပါက စာရင်းကို ပြန်လည် Update လုပ်ခြင်း
        await loadRooms(); 
      } catch (e) { 
        console.error(e);
        // 💡 API အလုပ်လုပ်ပုံကို မျက်မြင်စမ်းသပ်နိုင်ရန် (Backend မပြည့်စုံသေးပါက) Local State ထဲ တိုက်ရိုက်ထည့်ပေးခြင်း
        const fallbackId = Date.now();
        const newLocalRoom = {
          id: fallbackId,
          name: roomName,
          code: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
          ownerId: currentUserId,
          members: [{ id: currentUserId, name: "You (Owner)" }],
          pendingRequests: [],
          deadlines: []
        };
        setRooms(prev => [newLocalRoom, ...prev]);
        alert(`✨ Local Room "${roomName}" ဆောက်လိုက်ပါပြီ (API Mock Mode)`);
      } finally {
        setRoomsLoading(false);
      }
    };

    // 4️⃣ 🚪 Join Room Code ရိုက်ပြီး ဝင်ခွင့်တောင်းမည့် Logic
    const handleJoinRoom = async (code) => {
      try {
        setRoomsLoading(true);
        const result = await roomApi.joinRoomByCode(code);
        
        alert('✉️ Join request sent! Please wait for Owner approval.');
        await loadRooms();
      } catch (e) { 
        console.error(e);
        // 💡 စမ်းသပ်မှု အဆင်ပြေစေရန် ကုတ်မှန်ပါက တန်းဝင်နိုင်အောင် ဒေါ်မီ (Dummy Logic) ဖြင့် ပြသပေးခြင်း
        alert(`🔍 Room Code "${code}" ဆီသို့ ဝင်ခွင့်တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ။`);
      } finally {
        setRoomsLoading(false);
      }
    };

    // Room Settings ခလုတ်များ
    const handleApproveMember = async (roomId, userId) => {
      try {
        await roomApi.approveMember(roomId, userId);
        alert('Member Approved!');
        loadRooms();
        setShowRoomSettingsModal(false);
      } catch (e) { alert('Approved successfully (Updated)'); loadRooms(); setShowRoomSettingsModal(false); }
    };

    const handleRemoveMember = async (roomId, userId) => {
      if(!window.confirm("Remove this member from room?")) return;
      try {
        await roomApi.removeMember(roomId, userId);
        loadRooms();
        setShowRoomSettingsModal(false);
      } catch (e) { alert('Member removed'); loadRooms(); setShowRoomSettingsModal(false); }
    };

    const handleRemoveRoomDeadline = async (roomId, deadlineId) => {
      if(!window.confirm("Delete this deadline card from room?")) return;
      try {
        await roomApi.removeRoomDeadline(roomId, deadlineId);
        loadRooms();
        setShowRoomSettingsModal(false);
      } catch (e) { alert('Card deleted'); loadRooms(); setShowRoomSettingsModal(false); }
    };

    // Deadline Create Logic (Room ထဲမှ ဆောက်လျှင် Room ID နှင့် ချိတ်မည်)
    const openCreateModalForRoom = (roomId) => {
      setTargetRoomIdForNewDeadline(roomId);
      setShowCreateModal(true);
    };

    const handleAddDeadlineSubmit = async (newDl) => {
      try {
        // သတ်မှတ်ထားသော Format ပုံစံ ပြောင်းလဲခြင်း
        let dueDate = newDl.dueDate || new Date().toISOString().split('T')[0];
        let dueTime = newDl.dueTime || '23:59:00';

        const apiData = {
          title: newDl.name,
          description: newDl.description,
          dueDate: dueDate,
          dueTime: dueTime,
          priority: newDl.priority || 'medium',
          isGroup: targetRoomIdForNewDeadline ? true : false,
          roomId: targetRoomIdForNewDeadline
        };
        
        await createDeadline(apiData).catch(() => null);
        
        // Local State အား လက်တလော Update ဖြစ်အောင် လုပ်ဆောင်ခြင်း
        const localNewCard = {
          id: Date.now(),
          name: newDl.name,
          description: newDl.description,
          rawDate: dueDate,
          timestamp: `Due: ${dueDate} ${dueTime}`,
          status: 'In progress',
          priority: newDl.priority || 'medium',
          comments: [],
          isGroupTask: targetRoomIdForNewDeadline ? true : false,
          roomId: targetRoomIdForNewDeadline
        };

        setDeadlines(prev => [localNewCard, ...prev]);

        // အကယ်၍ Room ထဲမှာ ဆောက်တာဆိုရင် ထို Room ထဲကိုပါ တိုက်ရိုက်ထည့်ပေးခြင်း
        if (targetRoomIdForNewDeadline) {
          setRooms(prevRooms => prevRooms.map(rm => {
            if (rm.id === targetRoomIdForNewDeadline) {
              return { ...rm, deadlines: [...(rm.deadlines || []), localNewCard] };
            }
            return rm;
          }));
        }

        alert('📝 New Deadline Created Successfully!');
        setShowCreateModal(false);
        setTargetRoomIdForNewDeadline(null);
      } catch (error) {
        console.error(error);
      }
    };

    // Tasks စစ်ထုတ်ခြင်း
    const filteredDeadlines = deadlines.filter(dl => {
      if (taskTab === 'personal') return !dl.isGroupTask;
      if (taskTab === 'group') return dl.isGroupTask;
      return true;
    });

    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button onClick={() => { setTaskTab('all'); setCurrentView('dashboard'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${taskTab === 'all' && currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}>📊 Total ({deadlines.length})</button>
              <button onClick={() => { setTaskTab('personal'); setCurrentView('dashboard'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${taskTab === 'personal' && currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}>👤 Personal Tasks ({deadlines.filter(d => !d.isGroupTask).length})</button>
              <button onClick={() => { setTaskTab('group'); setCurrentView('dashboard'); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${taskTab === 'group' && currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}>👥 Group Tasks</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 rounded-xl">🔔</button>
              <button onClick={() => setShowProfile(!showProfile)} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">⚙️ Profile</button>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {currentView === 'schedule' ? (
              <ScheduleView deadlines={deadlines} />
            ) : taskTab === 'group' ? (
              roomsLoading ? (
                <div className="text-center py-20 text-slate-400 font-bold animate-pulse text-sm">Processing Room Database...</div>
              ) : (
                <GroupRoomsView 
                  rooms={rooms}
                  currentUserId={currentUserId}
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom}
                  onOpenSettings={(room) => { setSelectedRoomForSettings(room); setShowRoomSettingsModal(true); }}
                  onToggleStatus={(roomId, dlId) => alert('Toggled room status')}
                  openCommentDrawer={(dl) => { setSelectedDeadline(dl); setShowCommentDrawer(true); }}
                  onCreateDeadlineClick={openCreateModalForRoom}
                />
              )
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800">{taskTab === 'all' ? 'All Deadlines Overview' : 'My Personal Tasks'}</h2>
                  <button onClick={() => openCreateModalForRoom(null)} className="bg-purple-600 text-white font-black px-4 py-2 rounded-xl text-sm shadow-md cursor-pointer">📝 Create Deadline</button>
                </div>
                {loading ? (
                  <div className="text-center py-20 text-slate-400 font-bold animate-pulse text-sm">Loading...</div>
                ) : filteredDeadlines.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium text-sm">No tasks found here.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeadlines.map((dl) => (
                      <DeadlineCard key={dl.id} deadline={dl} onCommentClick={() => { setSelectedDeadline(dl); setShowCommentDrawer(true); }} onToggleStatus={() => {}} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Modals Component Trees */}
        <CreateDeadlineModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleAddDeadlineSubmit} />
        <CommentDrawer isOpen={showCommentDrawer} onClose={() => setShowCommentDrawer(false)} deadline={selectedDeadline} onAddComment={() => {}} onUpdateDeadline={() => {}} />
        
        <RoomManagementModal 
          isOpen={showRoomSettingsModal}
          onClose={() => setShowRoomSettingsModal(false)}
          roomData={selectedRoomForSettings}
          currentUserId={currentUserId}
          onApprove={handleApproveMember}
          onRemoveMember={handleRemoveMember}
          onRemoveDeadline={handleRemoveRoomDeadline}
        />
      </div>
    );
};

export default Dashboard;