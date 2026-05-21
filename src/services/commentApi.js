const API_URL = 'http://localhost:5000/api/comments';

const getToken = () => localStorage.getItem('token');

// Get comments for a deadline
export const getComments = async (deadlineId) => {
    const token = getToken();
        const response = await fetch(`${API_URL}/deadline/${deadlineId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get comments');
    return data;
};

// Add comment (with optional file)
export const addComment = async (deadlineId, content, file = null) => {
    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('file', file);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/deadline/${deadlineId}/comment`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add comment');
    return data;
};

// Add reply to a comment
export const addReply = async (deadlineId, commentId, content, file = null) => {
    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('file', file);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/deadline/${deadlineId}/comment/${commentId}/reply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add reply');
    return data;
};

// Delete comment
export const deleteComment = async (commentId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/comment/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete');
    return data;
};