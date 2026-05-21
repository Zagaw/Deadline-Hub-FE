
const API_URL = 'http://localhost:5000/api/deadlines';

// Get auth token
const getToken = () => localStorage.getItem('token');

// Helper for fetch with auth
const authFetch = async (url, options = {}) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');
    
    const response = await fetch(url, {
        ...options,
        headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    },
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
};

// Get all deadlines
export const getDeadlines = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return authFetch(`${API_URL}/?${params}`);
};

// Get single deadline
export const getDeadlineById = async (id) => {
    return authFetch(`${API_URL}/${id}`);
};

// Create deadline (with file)
export const createDeadline = async (deadlineData) => {
    const formData = new FormData();
    formData.append('title', deadlineData.title);
    formData.append('description', deadlineData.description || '');
    formData.append('dueDate', deadlineData.dueDate);
    formData.append('dueTime', deadlineData.dueTime);
    formData.append('priority', deadlineData.priority || 'medium');
    if (deadlineData.file) {
        formData.append('file', deadlineData.file);
    }
    
    const token = getToken();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Create failed');
    return data;
};

// Update deadline (with optional file)
export const updateDeadline = async (id, deadlineData) => {
    const formData = new FormData();
    if (deadlineData.title) formData.append('title', deadlineData.title);
    if (deadlineData.description) formData.append('description', deadlineData.description);
    if (deadlineData.dueDate) formData.append('dueDate', deadlineData.dueDate);
    if (deadlineData.dueTime) formData.append('dueTime', deadlineData.dueTime);
    if (deadlineData.priority) formData.append('priority', deadlineData.priority);
    if (deadlineData.status) formData.append('status', deadlineData.status);
    if (deadlineData.file) formData.append('file', deadlineData.file);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Update failed');
    return data;
};

// Delete deadline
export const deleteDeadline = async (id) => {
    return authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
};

// Mark deadline as complete
export const completeDeadline = async (id) => {
    return authFetch(`${API_URL}/${id}/complete`, { method: 'PATCH' });
};

// Get upcoming deadlines
export const getUpcomingDeadlines = async () => {
    return authFetch(`${API_URL}/upcoming`);
};

// Get statistics
export const getDeadlineStats = async () => {
    return authFetch(`${API_URL}/stats`);
};

