import React, { useState, useEffect } from 'react';
import DeadlineCard from './DeadlineCard';

const GroupRoomsView = ({ 
  rooms = [], currentUserId, onCreateRoom, onJoinRoom, onOpenSettings, onToggleStatus, openCommentDrawer, onCreateDeadlineClick 
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  
  // 📦 ရွေးချယ်ထားသော (ဝင်ရောက်ကြည့်ရှုနေသော) Room ID အား သတ်မှတ်ရန် State
  const [activeRoomId, setActiveRoomId] = useState(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    let cleanCode = searchCode.trim();
    if (!cleanCode) return;

    if (!cleanCode.toUpperCase().startsWith('RM-')) {
      cleanCode = `RM-${cleanCode}`;
    } else {
      cleanCode = `RM-${cleanCode.substring(3)}`;
    }

    onJoinRoom(cleanCode);
    setSearchCode('');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName.trim());
    setNewRoomName('');
  };

  return (
    <div className="space-y-6">
      
      {/* -------------------------------------------------------------------------- */}
      {/* ၁။ ROOM ထဲသို့ မဝင်ရသေးခင် ပြသမည့် Dashboard Area (စစချင်းမြင်ရမည့်အပိုင်း) */}
      {/* -------------------------------------------------------------------------- */}
      {!activeRoom ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Action Bars: Search Box & Create Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🔍 Search Bar to Join Room */}
            <form onSubmit={handleJoinSubmit} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Room Code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              />
              <button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0">
                🚪 Join Room
              </button>
            </form>

            {/* ➕ Create Room Bar */}
            <form onSubmit={handleCreateSubmit} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Room Name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              />
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0">
                ➕ Create Room
              </button>
            </form>
          </div>

          {/* Room Lists Display Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">📦 My Group Rooms ({rooms.length})</h3>
            
            {rooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl text-slate-400 text-sm font-medium border border-dashed">
                လက်ရှိတွင် မည်သည့် Group Room မျှ မရှိသေးပါ။ အထက်တွင် အခန်းသစ်ဆောက်နိုင် သို့မဟုတ် ဝင်ရောက်နိုင်ပါသည်။
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-slate-800 text-lg group-hover:text-purple-600 transition-colors">{room.name}</h4>
                        <span className="text-[10px] bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-500 shrink-0">#{room.code?.replace('RM-', '')}</span>
                      </div>  
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
                      <span className="text-xs text-purple-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-6">
                        <span>👪 Members: <b>{room.members?.length || 0}</b></span>
                        <span>•</span>
                        <span>📌 Tasks: <b>{room.deadlines?.length || 0}</b></span>
                      </p>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        
        // --------------------------------------------------------------------------
        // ၂။ ROOM တစ်ခုချင်းစီထဲသို့ ဝင်ရောက်ကြည့်ရှုနေသည့် အခင်းအကျင်း (Inside Room View)
        // --------------------------------------------------------------------------
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-200">
          
          {/* Back Button & Room Navigation Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-4">
              {/* အပြင်ပြန်ထွက်မည့် ခလုတ်လေး */}
              <button 
                onClick={() => setActiveRoomId(null)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                ◀ Back 
              </button>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black text-slate-800">{activeRoom.name}</h3>
                  <span className="text-[10px] bg-purple-50 text-purple-600 font-mono px-2 py-0.5 rounded font-bold">Code: {activeRoom.code}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">👪 အဖွဲ့ဝင်: {activeRoom.members?.length || 0} ဦး | 📌 လုပ်ဆောင်ရန် deadline: {activeRoom.deadlines?.length || 0} ခု</p>
              </div>
            </div>
            
            {/* Manage & Create Actions inside Room */}
            <div className="flex gap-2 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
              <button 
                onClick={() => onOpenSettings(activeRoom)}
                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                ⚙️ Manage Room
              </button>
              <button 
                onClick={() => onCreateDeadlineClick(activeRoom.id)}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                📝 Create Room Deadline
              </button>
            </div>
          </div>

          {/* Room Specific Deadlines Grid */}
          {!activeRoom.deadlines || activeRoom.deadlines.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl text-slate-400 text-sm font-medium border border-dashed">
              ဤအခန်းထဲတွင် သတ်မှတ်ထားသော Deadline Tasks များ မရှိသေးပါ။
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRoom.deadlines.map(dl => (
                <DeadlineCard 
                  key={dl.id} 
                  deadline={dl} 
                  onCommentClick={() => openCommentDrawer(dl)} 
                  onToggleStatus={(id) => onToggleStatus(activeRoom.id, id)} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupRoomsView;