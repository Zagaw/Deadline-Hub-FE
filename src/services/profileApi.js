// src/services/profileApi.js
const API_URL = 'http://localhost:3000/api/profile';

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
            'Content-Type': 'application/json'
        },
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
};

// Get user profile
export const getProfile = async () => {
    return authFetch(`${API_URL}/profile`);
};

// Update username
export const updateUsername = async (username) => {
    return authFetch(`${API_URL}/username`, {
        method: 'PUT',
        body: JSON.stringify({ username })
    });
};

// Update email
export const updateEmail = async (email) => {
    return authFetch(`${API_URL}/email`, {
        method: 'PUT',
        body: JSON.stringify({ email })
    });
};

// Update password
export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    return authFetch(`${API_URL}/password`, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
};

// Update full profile (username + email together)
export const updateFullProfile = async (username, email) => {
    return authFetch(`${API_URL}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ username, email })
    });
};

// Delete account
export const deleteAccount = async (password) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete account');
    return data;
};

// Logout
export const logout = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};