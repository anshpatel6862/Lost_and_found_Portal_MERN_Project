import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home"; 
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import MatchItems from "./pages/MatchItems";
import AllLostItems from "./pages/AllLostItems";
import AllFoundItems from "./pages/AllFoundItems";
import MyClaims from "./pages/MyClaims";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 🔥 FIX: Pehle yahan Login tha, ab Home kar diya hai */}
        <Route path="/" element={<Home />} />
        
        {/* Main Dashboard Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        
        {/* Feature Routes */}
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/view-matches" element={<MatchItems />} />
        
        {/* New Pages */}
        <Route path="/all-lost" element={<AllLostItems/>} />
        <Route path="/all-found" element={<AllFoundItems/>} />
        
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Admin Route */}
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </div>
  );
}

export default App;