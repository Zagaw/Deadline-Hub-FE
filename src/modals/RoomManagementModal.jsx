import React from 'react';

const RoomManagementModal = ({ isOpen, onClose, roomData, currentUserId, onApprove, onRemoveMember, onRemoveDeadline }) => {
  if (!isOpen || !roomData) return null;

  const isOwner = roomData.ownerId === currentUserId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black">⚙️ {roomData.name} Settings</h3>
            <p className="text-xs text-blue-400 font-mono mt-0.5">Code: {roomData.code}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">Close</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Pending Join Requests (Owner သာ မြင်ရမည်) */}
          {isOwner && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">⏳ Join Requests ({roomData.pendingRequests?.length || 0})</h4>
              {roomData.pendingRequests?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No pending requests.</p>
              ) : (
                <div className="space-y-2">
                  {roomData.pendingRequests?.map(user => (
                    <div key={user.id} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <span className="text-sm font-bold text-slate-700">👤 {user.name}</span>
                      <button onClick={() => onApprove(roomData.id, user.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-lg transition-all">Approve</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Current Members */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">👥 Active Members ({roomData.members?.length || 0})</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {roomData.members?.map(member => (
                <div key={member.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <span className="text-sm font-bold text-slate-700">
                    👤 {member.name} {member.id === roomData.ownerId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-black">OWNER</span>}
                  </span>
                  {isOwner && member.id !== roomData.ownerId && (
                    <button onClick={() => onRemoveMember(roomData.id, member.id)} className="text-red-500 hover:bg-red-50 font-bold text-xs px-2 py-1 rounded-lg transition-colors">Kick</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Manage Deadlines */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">📝 Room Deadlines ({roomData.deadlines?.length || 0})</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {roomData.deadlines?.map(dl => (
                <div key={dl.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[250px]">📌 {dl.name || dl.title}</span>
                  {isOwner && (
                    <button onClick={() => onRemoveDeadline(roomData.id, dl.id)} className="text-red-600 font-bold text-xs hover:bg-red-50 p-1.5 rounded-lg transition-colors">Delete Card</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagementModal;