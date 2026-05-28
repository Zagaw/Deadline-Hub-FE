import React, { useState, useRef, useEffect } from 'react';
import { getComments, addComment, addReply } from '../services/commentApi';

// You'll need to create this API function to get user by ID
const getUserById = async (userId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.user?.username || 'User';
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return 'User';
  }
};

const CommentDrawer = ({ isOpen, onClose, deadline, onAddComment, onUpdateDeadline }) => {
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userNames, setUserNames] = useState({}); // Cache for user names
  const fileRef = useRef(null);

  // Load current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  // Load comments when drawer opens
  useEffect(() => {
    if (isOpen && deadline?.id) {
      loadComments();
    }
  }, [isOpen, deadline?.id]);

  // Helper function to fetch username for a userId
  const fetchUsername = async (userId) => {
    if (!userId) return 'User';
    
    // Check cache first
    if (userNames[userId]) {
      return userNames[userId];
    }
    
    try {
      // Try to get from localStorage current user first
      if (currentUser && currentUser.id === userId) {
        return currentUser.username;
      }
      
      // Fallback to using userId as display
      // Ideally you'd have an API endpoint to get user by ID
      return `User ${userId}`;
    } catch (error) {
      console.error('Error getting username:', error);
      return 'User';
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      const data = await getComments(deadline.id);
      console.log('Raw API response:', data);
      
      // Manually fetch usernames for each comment
      const formattedComments = await Promise.all(data.comments.map(async (c) => {
        let authorName = 'User';
        
        // Try to get username
        if (c.username) {
          authorName = c.username;
        } else if (c.user?.username) {
          authorName = c.user.username;
        } else if (c.userId) {
          // If we have userId but no username, try to get from current user or cache
          if (currentUser && currentUser.id === c.userId) {
            authorName = currentUser.username;
          } else {
            authorName = `User ${c.userId}`; // Temporary fallback
          }
        }
        
        // Process replies
        const replies = await Promise.all((c.replies || []).map(async (r) => {
          let replyAuthorName = 'User';
          if (r.username) {
            replyAuthorName = r.username;
          } else if (r.user?.username) {
            replyAuthorName = r.user.username;
          } else if (r.userId) {
            if (currentUser && currentUser.id === r.userId) {
              replyAuthorName = currentUser.username;
            } else {
              replyAuthorName = `User ${r.userId}`;
            }
          }
          
          return {
            id: r.id,
            author: replyAuthorName,
            authorId: r.userId,
            text: r.content,
            fileName: r.fileName,
            fileUrl: r.fileUrl,
            time: new Date(r.createdAt).toLocaleString()
          };
        }));
        
        return {
          id: c.id,
          author: authorName,
          authorId: c.userId,
          text: c.content,
          fileName: c.fileName,
          fileUrl: c.fileUrl,
          time: new Date(c.createdAt).toLocaleString(),
          replies: replies
        };
      }));

      console.log('Formatted comments with usernames:', formattedComments);
      setComments(formattedComments);
      
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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      const response = await addComment(deadline.id, commentText, commentFile);
      console.log('Comment added response:', response);
      
      await loadComments();
      
      setCommentText('');
      setCommentFile(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await addReply(deadline.id, commentId, replyText);
      console.log('Reply added response:', response);

      await loadComments();
      
      setReplyText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('Failed to add reply: ' + error.message);
    }
  };

  const openFile = (fileUrl) => {
    if (fileUrl) {
      const fullUrl = `http://localhost:3000${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  if (!isOpen || !deadline) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[120] flex justify-end">
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
          {loading ? (
            <div className="text-center text-slate-400 text-sm pt-10">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-400 text-sm pt-10">No comments yet. Start the conversation!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">
                        {comment.author?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-purple-600">{comment.author}</span>
                    {comment.authorId === currentUser?.id && (
                      <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{comment.time}</span>
                </div>
                
                {comment.text && <p className="text-xs text-slate-700 leading-relaxed ml-8">{comment.text}</p>}  
                
                {comment.fileName && (
                  <button 
                    onClick={() => openFile(comment.fileUrl)}
                    className="text-[10px] bg-slate-50 text-slate-500 hover:text-purple-600 border font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer truncate max-w-full ml-8"
                  >
                    📄 {comment.fileName}
                  </button>
                )}

                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-[10px] text-purple-600 hover:text-purple-700 font-medium ml-8 mt-1"
                >
                  {replyTo === comment.id ? 'Cancel Reply' : '💬 Reply'}
                </button>

                {replyTo === comment.id && (
                  <div className="ml-8 mt-2 pl-3 border-l-2 border-purple-200">
                    <div className="flex gap-2 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">
                            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.author}...`}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                          rows="2"
                        />
                        <div className="flex justify-end mt-1 gap-2">
                          <button
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText('');
                            }}
                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(comment.id)}
                            disabled={!replyText.trim()}
                            className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            Post Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 mt-3 pl-3 border-l-2 border-purple-200 space-y-3">
                    <p className="text-[10px] font-semibold text-purple-600 mb-2">
                      {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                    </p>
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-purple-50 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">
                                {reply.author?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-purple-600">{reply.author}</span>
                            {reply.authorId === currentUser?.id && (
                              <span className="text-[8px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400">{reply.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 ml-7">{reply.text}</p>
                        {reply.fileName && (
                          <button 
                            onClick={() => openFile(reply.fileUrl)}
                            className="text-[9px] bg-white text-slate-500 hover:text-purple-600 border font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer ml-7 mt-1"
                          >
                            📄 {reply.fileName}
                          </button>
                        )}
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
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs text-gray-500">Commenting as <span className="font-semibold text-purple-600">{currentUser?.username || 'User'}</span></span>
          </div>

          {commentFile && (
            <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-100">
              <span className="truncate max-w-[300px]">📎 {commentFile.name}</span>
              <button type="button" onClick={() => setCommentFile(null)} className="text-red-500 font-bold ml-2">✕</button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />
            
            <button 
              type="button" 
              onClick={() => fileRef.current.click()}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer text-sm"
              title="Attach File"
            >
              📎
            </button>

            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Write a comment as ${currentUser?.username || 'User'}...`}
              className="flex-1 bg-slate-50 px-4 py-3 rounded-xl text-xs outline-none border border-transparent focus:border-purple-500 focus:bg-white text-slate-800 transition-all"
            />

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