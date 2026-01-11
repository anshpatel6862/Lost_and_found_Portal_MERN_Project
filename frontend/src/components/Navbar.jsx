import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBoxOpen, FaKey, FaSignOutAlt, FaRobot } from "react-icons/fa"; // FaExchangeAlt hata diya

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Logo Area */}
      <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
        🔍 Lost & Found
      </Link>

      {/* Right Side Menu */}
      <div className="flex items-center gap-6">
        
        {user ? (
          <>
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
            <Link to="/report-lost" className="text-gray-600 hover:text-blue-600 font-medium transition">Lost Item</Link>
            <Link to="/report-found" className="text-gray-600 hover:text-blue-600 font-medium transition">Found Item</Link>
            
            {/* ✨ AI Matches Link */}
            <Link to="/view-matches" className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 transition">
                <FaRobot /> AI Matches
            </Link>

            {/* 📦 Claims Section (Incoming Removed) */}
            <div className="hidden md:flex items-center gap-4 border-l pl-4 border-gray-300">
                <Link to="/my-claims" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium" title="My Sent Requests">
                  <FaBoxOpen /> My Claims
                </Link>
            </div>

            {/* 👤 User Profile & Settings */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
              
              {/* Change Password Icon */}
              <Link to="/change-password" className="text-gray-400 hover:text-orange-500 transition" title="Change Password">
                 <FaKey size={18} />
              </Link>

              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role || "User"}</p>
              </div>

              <button 
                onClick={handleLogout} 
                className="text-red-500 hover:text-red-700 font-bold transition flex items-center gap-1"
                title="Logout"
              >
                <FaSignOutAlt size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
             <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
             <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;