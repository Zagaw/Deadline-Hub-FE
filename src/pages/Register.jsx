// Register.jsx - Updated version
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { registerUser, saveToken, saveUser } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 6 characters and include at least one letter and one number');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await registerUser({ username, email, password });
            
            // Save token
            if (response.token) {
                saveToken(response.token);
            }
            
            // Make sure we save the user data with username
            const userData = {
                id: response.user?.id || response.id,
                username: response.user?.username || response.username || username,
                email: response.user?.email || response.email || email,
                role: response.user?.role || response.role || 'user'
            };
            
            saveUser(userData);
            console.log('Saved user data:', userData); // Debug log
            
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="h-16 w-16 bg-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-200">
                        <span className="text-white text-3xl font-black">!</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                    <p className="text-slate-500 mt-2">Join Deadline Hub to stay organized</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Choose a username"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password (min 6 characters)"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 mt-4 transition-all active:scale-95"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-slate-600 mt-6 text-sm">
                    Already have an account? 
                    <Link to="/login" className="text-purple-600 font-bold ml-1 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;