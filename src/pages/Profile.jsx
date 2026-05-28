// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getProfile,
    updateUsername,
    updateEmail,
    updatePassword,
    updateFullProfile,
    deleteAccount,
    logout
} from '../services/profileApi';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form states
    const [editMode, setEditMode] = useState({
        username: false,
        email: false,
        password: false
    });
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    
    // Fetch user profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);
    
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            setUser(response);
            setFormData({
                username: response.username,
                email: response.email,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
            // If unauthorized, redirect to login
            if (err.message.includes('token') || err.message.includes('auth')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Update Username
    const handleUpdateUsername = async () => {
        if (!formData.username || formData.username.trim() === '') {
            setError('Username is required');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            setLoading(true);
            const response = await updateUsername(formData.username);
            setUser(response.user);
            setSuccess('Username updated successfully!');
            setEditMode({ ...editMode, username: false });
            
            // Update stored user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.username = response.user.username;
            localStorage.setItem('user', JSON.stringify(storedUser));
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update username');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Update Email
    const handleUpdateEmail = async () => {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Invalid email format');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            setLoading(true);
            const response = await updateEmail(formData.email);
            setUser(response.user);
            
            // Update token if provided
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            
            // Update stored user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.email = response.user.email;
            localStorage.setItem('user', JSON.stringify(storedUser));
            
            setSuccess('Email updated successfully!');
            setEditMode({ ...editMode, email: false });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update email');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Update Password
    const handleUpdatePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        if (!formData.currentPassword) {
            setError('Current password is required');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            setLoading(true);
            await updatePassword(
                formData.currentPassword,
                formData.newPassword,
                formData.confirmPassword
            );
            
            setSuccess('Password updated successfully!');
            setEditMode({ ...editMode, password: false });
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Update Full Profile (Combined)
    const handleUpdateFullProfile = async () => {
        try {
            setLoading(true);
            const response = await updateFullProfile(formData.username, formData.email);
            
            setUser(response.user);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            
            // Update stored user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            storedUser.username = response.user.username;
            storedUser.email = response.user.email;
            localStorage.setItem('user', JSON.stringify(storedUser));
            
            setSuccess(response.message);
            setEditMode({ username: false, email: false, password: false });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Delete Account
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setError('Password is required to delete account');
            return;
        }
        
        if (!window.confirm('⚠️ WARNING: This action is permanent and cannot be undone. All your deadlines, comments, and rooms will be deleted. Are you absolutely sure?')) {
            return;
        }
        
        try {
            setLoading(true);
            await deleteAccount(deletePassword);
            
            // Clear all local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            setSuccess('Account deleted successfully. Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to delete account');
            setTimeout(() => setError(null), 3000);
            setShowDeleteConfirm(false);
            setDeletePassword('');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle Logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
            navigate('/login');
        }
    };
    
    if (loading && !user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                    ← Back to Dashboard
                </button>
                
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                            <p className="text-gray-500 mt-1">Manage your account information</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}
                
                {/* Profile Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                            <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-3xl font-bold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{user?.username}</h3>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            {editMode.username ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter username"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateUsername}
                                            disabled={loading}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode({ ...editMode, username: false });
                                                setFormData({ ...formData, username: user?.username });
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900">{user?.username}</p>
                                    <button
                                        onClick={() => setEditMode({ ...editMode, username: true })}
                                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            {editMode.email ? (
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter email"
                                        autoFocus
                                    />
                                    <p className="text-xs text-amber-600">
                                        ⚠️ Changing email will require you to login again with new token
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateEmail}
                                            disabled={loading}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode({ ...editMode, email: false });
                                                setFormData({ ...formData, email: user?.email });
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900">{user?.email}</p>
                                    <button
                                        onClick={() => setEditMode({ ...editMode, email: true })}
                                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Role Field (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Change Password Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                        <p className="text-sm text-gray-500 mt-1">Change your password</p>
                    </div>
                    
                    <div className="p-6">
                        {editMode.password ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={loading}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode({ ...editMode, password: false });
                                            setFormData({
                                                ...formData,
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode({ ...editMode, password: true })}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Change Password
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Quick Update Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Update</h2>
                        <p className="text-sm text-gray-500 mt-1">Update username and email together</p>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Username
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter new username"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter new email"
                                />
                            </div>
                            
                            <button
                                onClick={handleUpdateFullProfile}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                Update Both
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Danger Zone - Delete Account */}
                <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-200 bg-red-100">
                        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                        <p className="text-sm text-red-600 mt-1">Permanent actions - proceed with caution</p>
                    </div>
                    
                    <div className="p-6">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-red-700 font-medium">
                                    ⚠️ Warning: This action cannot be undone. All your deadlines, comments, and rooms will be permanently deleted.
                                </p>
                                
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-2">
                                        Confirm Password to Delete Account
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Enter your password"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        Permanently Delete Account
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeletePassword('');
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;