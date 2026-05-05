import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* စစချင်းဖွင့်လိုက်ရင် Login Page ပေါ်မယ် */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Register Page လမ်းကြောင်း */}
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard လမ်းကြောင်း */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;