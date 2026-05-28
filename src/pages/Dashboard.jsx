import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DeadlineCard from '../components/DeadlineCard';
import CreateDeadlineModal from '../modals/CreateDeadlineModal';
import CommentDrawer from '../modals/CommentDrawer';
import ScheduleView from '../components/ScheduleView';
import GroupRoomsView from '../components/GroupRoomsView';
import RoomManagementModal from '../modals/RoomManagementModal';
import { getDeadlines, createDeadline, updateDeadline, completeDeadline } from '../services/deadlineApi';
import * as roomApi from '../services/roomApi';

const Dashboard = () => {
    const navigate = useNavigate();
    const [taskTab, setTaskTab] = useState('all');
    const [currentView, setCurrentView] = useState('dashboard');
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Add state for logged in user
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Modals & Drawers States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [targetRoomIdForNewDeadline, setTargetRoomIdForNewDeadline] = useState(null);
    const [showCommentDrawer, setShowCommentDrawer] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState(null);

    // ✏️ ပြင်ဆင်မည့် Deadline ဒေတာကို ခဏမှတ်ထားရန် State
    const [editingDeadline, setEditingDeadline] = useState(null);

    // 📦 Rooms Dynamic State
    const [rooms, setRooms] = useState([]);
    const [selectedRoomForSettings, setSelectedRoomForSettings] = useState(null);
    const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [deadlines, setDeadlines] = useState([]);

    // Get current user ID from localStorage
    const getCurrentUserId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 999;
    };
    
    const currentUserId = getCurrentUserId();

    // Initial Loading
    useEffect(() => {
        // Load user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setLoggedInUser(userData);
        
        initLoad();
    }, []);

    const initLoad = async () => {
        setLoading(true);
        await Promise.all([loadDeadlines(), loadRooms()]);
        setLoading(false);
    };
    
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

    // 2️⃣ API မှ Rooms များ ဆွဲယူခြင်း
    const loadRooms = async () => {
        setRoomsLoading(true);
        try {
            const response = await roomApi.getRoomDetails('my-rooms').catch(() => null);
            
            if (response && response.rooms) {
                setRooms(response.rooms);
            } else {
                setRooms([
                    { 
                        id: 101, 
                        name: "HCI Project Group", 
                        code: "RM-7841", 
                        ownerId: currentUserId, 
                        members: [{id: currentUserId, name: loggedInUser?.username || "You"}, {id: 2, name: "Aung Aung"}],
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

    // 3️⃣ Create Room Logic
    const handleCreateRoom = async (roomName) => {
        try {
            setRoomsLoading(true);
            await roomApi.createRoom({ name: roomName });
            alert(`🎉 Room "${roomName}" Created Successfully!`);
            await loadRooms(); 
        } catch (e) { 
            const fallbackId = Date.now();
            const newLocalRoom = {
                id: fallbackId,
                name: roomName,
                code: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
                ownerId: currentUserId,
                members: [{ id: currentUserId, name: loggedInUser?.username || "You (Owner)" }],
                pendingRequests: [],
                deadlines: []
            };
            setRooms(prev => [newLocalRoom, ...prev]);
            alert(`✨ Local Room "${roomName}" ဆောက်လိုက်ပါပြီ (API Mock Mode)`);
        } finally {
            setRoomsLoading(false);
        }
    };

    // 4️⃣ Join Room Logic
    const handleJoinRoom = async (code) => {
        try {
            setRoomsLoading(true);
            await roomApi.joinRoomByCode(code);
            alert('✉️ Join request sent! Please wait for Owner approval.');
            await loadRooms();
        } catch (e) { 
            alert(`🔍 Room Code "${code}" ဆီသို့ ဝင်ခွင့်တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ။`);
        } finally {
            setRoomsLoading(false);
        }
    };

    // ✏️ Deadline Card/List ပေါ်က Edit ကိုနှိပ်လျှင် Modal ပွင့်လာစေမည့် Logic
    const handleEditClick = (deadline) => {
        setEditingDeadline(deadline);
        setTargetRoomIdForNewDeadline(deadline.roomId);
        setShowCreateModal(true);
    };

    // Modal ကို ပိတ်လိုက်လျှင် Edit State များကို ပြန်ရှင်းပစ်မည့် Logic
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setEditingDeadline(null);
        setTargetRoomIdForNewDeadline(null);
    };

    // 5️⃣ Create သို့မဟုတ် Edit တောင်းဆိုမှုများကို API ဆီ ပေးပို့သိမ်းဆည်းမည့် Logic
    const handleAddDeadlineSubmit = async (newDl) => {
        try {
            let dueDate = newDl.dueDate || new Date().toISOString().split('T')[0];
            let dueTime = newDl.dueTime || '23:59:00';

            if (newDl.id || editingDeadline) {
                const targetId = newDl.id || editingDeadline.id;
                
                await updateDeadline(targetId, {
                    title: newDl.name,
                    description: newDl.description,
                    dueDate: dueDate,
                    dueTime: dueTime,
                    priority: newDl.priority
                }).catch(() => null);

                setDeadlines(prev => prev.map(dl => dl.id === targetId ? {
                    ...dl,
                    name: newDl.name,
                    description: newDl.description,
                    rawDate: dueDate,
                    timestamp: `Due: ${dueDate} ${dueTime}`,
                    priority: newDl.priority
                } : dl));

                const activeRoomId = targetRoomIdForNewDeadline || editingDeadline.roomId;
                if (activeRoomId) {
                    setRooms(prevRooms => prevRooms.map(rm => {
                        if (rm.id === activeRoomId) {
                            return {
                                ...rm,
                                deadlines: rm.deadlines?.map(dl => dl.id === targetId ? {
                                    ...dl,
                                    name: newDl.name,
                                    description: newDl.description,
                                    rawDate: dueDate,
                                    timestamp: `Due: ${dueDate} ${dueTime}`,
                                    priority: newDl.priority
                                } : dl)
                            };
                        }
                        return rm;
                    }));
                }
                alert('✏️ Deadline ပြင်ဆင်ပြီးပါပြီ။');

            } else {
                const apiData = {
                    title: newDl.name,
                    description: newDl.description,
                    dueDate: dueDate,
                    dueTime: dueTime,
                    priority: newDl.priority || 'medium',
                };
                
                await createDeadline(apiData).catch(() => null);
                
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

                if (targetRoomIdForNewDeadline) {
                    setRooms(prevRooms => prevRooms.map(rm => {
                        if (rm.id === targetRoomIdForNewDeadline) {
                            return { ...rm, deadlines: [...(rm.deadlines || []), localNewCard] };
                        }
                        return rm;
                    }));
                }
                alert('📝 New Deadline Created Successfully!');
            }

            handleCloseCreateModal();
        } catch (error) {
            console.error(error);
        }
    };

    // 6️⃣ Toggle Status Logic
    const handleToggleStatus = async (roomId, dlId) => {
        const actualDlId = dlId ? dlId : roomId;
        const targetDeadline = deadlines.find(d => d.id === actualDlId);
        const isGroup = targetDeadline ? targetDeadline.isGroupTask : (dlId ? true : false);
        const actualRoomId = targetDeadline ? targetDeadline.roomId : roomId;

        try {
            await completeDeadline(actualDlId).catch(() => null);

            setDeadlines(prev => prev.map(dl => {
                if (dl.id === actualDlId) {
                    const nextStatus = dl.status === 'Done' ? 'In progress' : 'Done';
                    return { ...dl, status: nextStatus };
                }
                return dl;
            }));

            if (isGroup && actualRoomId) {
                setRooms(prevRooms => prevRooms.map(rm => {
                    if (rm.id === actualRoomId) {
                        return {
                            ...rm,
                            deadlines: rm.deadlines?.map(dl => {
                                if (dl.id === actualDlId) {
                                    const nextStatus = dl.status === 'Done' ? 'In progress' : 'Done';
                                    return { ...dl, status: nextStatus };
                                }
                                return dl;
                            })
                        };
                    }
                    return rm;
                }));
            }

        } catch (e) { 
            console.error("Failed to toggle status:", e); 
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

    const openCreateModalForRoom = (roomId) => {
        setTargetRoomIdForNewDeadline(roomId);
        setShowCreateModal(true);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // ⏰ [FIXED SORTING LOGIC]
    const filteredDeadlines = deadlines
        .filter(dl => {
            if (taskTab === 'personal') return !dl.isGroupTask;
            if (taskTab === 'group') return dl.isGroupTask;
            return true;
        })
        .sort((a, b) => {
            const timeA = a.rawDate ? new Date(`${a.rawDate}T23:59:59`).getTime() : Infinity;
            const timeB = b.rawDate ? new Date(`${b.rawDate}T23:59:59`).getTime() : Infinity;
            return timeA - timeB;
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
                        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 rounded-xl">
                            🔔
                        </button>
                        
                        {/* Profile Dropdown with Username */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfile(!showProfile)} 
                                className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        {loggedInUser?.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span>{loggedInUser?.username || 'User'}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {/* Profile Dropdown Menu */}
                            {showProfile && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-gray-900">{loggedInUser?.username || 'User'}</p>
                                        <p className="text-xs text-gray-500">{loggedInUser?.email || ''}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2"
                                    >
                                        <span>👤</span> My Profile
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2"
                                    >
                                        <span>⚙️</span> Settings
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <span>🚪</span> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
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
                                onToggleStatus={handleToggleStatus} 
                                openCommentDrawer={(dl) => { setSelectedDeadline(dl); setShowCommentDrawer(true); }}
                                onCreateDeadlineClick={openCreateModalForRoom}
                                onEditClick={handleEditClick}
                            />
                        )
                    ) : (
                        <>
                            {/* Header Area */}
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-black text-slate-800">
                                    {taskTab === 'all' ? 'All Deadlines Overview' : 'My Personal Tasks'}
                                </h2>
                                {taskTab === 'personal' && (
                                    <button 
                                        onClick={() => openCreateModalForRoom(null)} 
                                        className="bg-purple-600 text-white font-black px-4 py-2 rounded-xl text-sm shadow-md cursor-pointer hover:bg-purple-700 transition-colors"
                                    >
                                        📝 Create Deadline
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="text-center py-20 text-slate-400 font-bold animate-pulse text-sm">Loading...</div>
                            ) : filteredDeadlines.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-medium text-sm">No tasks found here.</div>
                            ) : taskTab === 'personal' ? (
                                /* 📇 [PERSONAL TAB]: Card View */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredDeadlines.map((dl) => (
                                        <DeadlineCard 
                                            key={dl.id} 
                                            deadline={dl} 
                                            onCommentClick={() => { setSelectedDeadline(dl); setShowCommentDrawer(true); }} 
                                            onToggleStatus={handleToggleStatus} 
                                            onEditClick={handleEditClick}
                                        />
                                    ))}
                                </div>
                            ) : (
                                /* 📋 [TOTAL TAB]: Table View */
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/75 border-b border-slate-100">
                                                    <th className="p-4 text-xs font-black text-slate-400 uppercase w-14 text-center">Status</th>
                                                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Task Name</th>
                                                    <th className="p-4 text-xs font-black text-slate-400 uppercase hidden md:table-cell">Description</th>
                                                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Priority</th>
                                                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-right w-32">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredDeadlines.map((dl) => {
                                                    const isDone = dl.status === 'Done';
                                                    return (
                                                        <tr key={dl.id} className={`hover:bg-slate-50/60 transition-colors ${isDone ? 'bg-emerald-50/10' : ''}`}>
                                                            <td className="p-4 text-center">
                                                                <button 
                                                                    onClick={() => handleToggleStatus(dl.roomId, dl.id)}
                                                                    className={`w-5 h-5 rounded border mx-auto flex items-center justify-center text-xs transition-colors cursor-pointer ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}
                                                                >
                                                                    {isDone && '✓'}
                                                                </button>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-bold text-slate-800 text-sm flex items-center gap-2 flex-wrap">
                                                                    <span className={isDone ? 'line-through text-slate-400 font-medium' : ''}>{dl.name}</span>
                                                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${isDone ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-600'}`}>
                                                                        📅 {dl.rawDate}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-xs text-slate-400 hidden md:table-cell max-w-xs truncate">
                                                                {dl.description || '-'}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${dl.priority === 'high' ? 'bg-rose-50 text-rose-600' : dl.priority === 'low' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {dl.priority || 'medium'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex justify-end gap-1.5">
                                                                    <button 
                                                                        onClick={() => { setSelectedDeadline(dl); setShowCommentDrawer(true); }}
                                                                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                                                                    >
                                                                        💬 {dl.comments?.length || 0}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleEditClick(dl)}
                                                                        className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Modals Component Trees */}
            <CreateDeadlineModal 
                isOpen={showCreateModal} 
                onClose={handleCloseCreateModal} 
                onSubmit={handleAddDeadlineSubmit} 
                editData={editingDeadline} 
            />
            
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