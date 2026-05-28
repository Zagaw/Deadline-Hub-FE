import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/protectedRoute";
import Profile from './pages/Profile';


function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
   
        <Route path="/register" element={<Register />} />
        
      
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route 
            path="/profile" 
            element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } 
        />
      </Routes>
    </Router>
  );
}

export default App;