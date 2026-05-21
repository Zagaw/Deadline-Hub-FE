import React, { useState, useRef ,useEffect  } from 'react';
import { getComments, addComment, addReply } from '../services/commentApi';

const CommentDrawer = ({ isOpen, onClose, deadline, onAddComment , onUpdateDeadline  }) => {
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const fileRef = useRef(null);

  //if (!isOpen || !deadline) return null;
  // Load comments when drawer opens
  useEffect(() => {
    if (isOpen && deadline?.id) {
      loadComments();
    }
  }, [isOpen, deadline?.id]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      const data = await getComments(deadline.id);
      console.log('Loaded comments:', data);
      
      // Transform API comments to match component format
      const formattedComments = data.comments.map(c => ({
        id: c.id,
        author: c.user?.username || 'User',
        text: c.content,
        fileName: c.fileName,
        fileUrl: c.fileUrl,
        fileObject: c.fileUrl, // For file download
        time: new Date(c.createdAt).toLocaleString(),
        replies: c.replies || []
      }));

      setComments(formattedComments);
      
      // Update parent component with comments
      if (onUpdateDeadline) {
        const updatedDeadline = { ...deadline, comments: formattedComments };
        onUpdateDeadline(updatedDeadline);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCommentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentFile) return;

    // Comment Data အသစ်ကို Dashboard ဆီ ပို့မယ်
    /*onAddComment(deadline.id, {
      id: Date.now(),
      author: "Mg Mg (You)",
      text: commentText,
      fileName: commentFile ? commentFile.name : null,
      fileObject: commentFile ? commentFile : null,
      time: "Just now"
    });*/

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      // Add comment via API
      const response = await addComment(deadline.id, commentText, commentFile);
      console.log('Comment added:', response);

       // Reload comments to get the updated list
      await loadComments();
      
      // Also update parent via onAddComment for local state
      if (onAddComment) {
        onAddComment(deadline.id, {
          id: response.comment?.id || Date.now(),
          author: response.comment?.user?.username || 'You',
          text: commentText,
          fileName: commentFile ? commentFile.name : null,
          fileObject: commentFile,
          time: "Just now"
        });
      }
    // Form ရှင်းထုတ်မယ်
    setCommentText('');
    setCommentFile(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  /*const openFile = (fileObj) => {
    if (fileObj) {
      const url = URL.createObjectURL(fileObj);
      window.open(url, '_blank');
    }
  };*/

  const openFile = (fileUrl) => {
    if (fileUrl) {
      // Construct full URL for file download
      const fullUrl = `http://localhost:5000${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

    if (!isOpen || !deadline) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[120] flex justify-end">
      {/* ညာဘက်ခြမ်းအပြည့် Slide ထွက်လာမည့် Panel */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800 truncate max-w-[280px]">💬 Comments</h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">on {deadline.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-white border p-2 rounded-xl">✕ Close</button>
        </div>

        {/* Comment Lists Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {/*{(!deadline.comments || deadline.comments.length === 0) ? (
            <div className="text-center text-slate-400 text-sm pt-10">No comments yet. Start the conversation!</div>
          ) : (
            deadline.comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-purple-600">{comment.author}</span>
                  <span className="text-[10px] text-slate-400">{comment.time}</span>
                </div>
                {comment.text && <p className="text-xs text-slate-700 leading-relaxed">{comment.text}</p>}
          */} 

          {loading ? (
            <div className="text-center text-slate-400 text-sm pt-10">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-400 text-sm pt-10">No comments yet. Start the conversation!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-purple-600">{comment.author}</span>
                  <span className="text-[10px] text-slate-400">{comment.time}</span>
                </div>
                {comment.text && <p className="text-xs text-slate-700 leading-relaxed">{comment.text}</p>}  
                
                {/* Comment ထဲက Attached File နှိပ်ရင် ပွင့်ရမည့်နေရာ */}
                {comment.fileName && (
                  <button 
                    onClick={() => openFile(comment.fileUrl)}
                    className="text-[10px] bg-slate-50 text-slate-500 hover:text-purple-600 border font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer truncate max-w-full"
                  >
                    📄 {comment.fileName}
                  </button>
                )}

                {/* Replies - simple display for now */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-4 mt-2 pl-3 border-l-2 border-purple-200 space-y-2">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-purple-50 p-2 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-purple-600">{reply.user?.username || 'User'}</span>
                          <span className="text-[9px] text-slate-400">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Box Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white space-y-3">
          
          {/* ရွေးထားတဲ့ Comment File အခြေအနေပြရန် */}
          {commentFile && (
            <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-100">
              <span className="truncate max-w-[300px]">📎 {commentFile.name}</span>
              <button type="button" onClick={() => setCommentFile(null)} className="text-red-500 font-bold ml-2">✕</button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden Input for File */}
            <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />
            
            {/* Attachment Button */}
            <button 
              type="button" 
              onClick={() => fileRef.current.click()}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer text-sm"
              title="Attach File"
            >
              📎
            </button>

            {/* Input Box */}
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-50 px-4 py-3 rounded-xl text-xs outline-none border border-transparent focus:border-purple-500 focus:bg-white text-slate-800 transition-all"
            />

            {/* Send Button */}
            <button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              Send
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CommentDrawer;