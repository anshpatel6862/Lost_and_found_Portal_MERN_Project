import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaPlusCircle, FaListUl, FaMagic, FaClipboardList, FaBoxOpen, FaCheckCircle } from "react-icons/fa"; 

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Login status track karne ke liye
  
  // Stats ke liye State
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    claims: 0,
    matches: 0
  });

  // 🔥 SECURITY CHECK (Sabse Pehle)
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Agar token nahi hai, to turant Login page par bhejo
    if (!token) {
        navigate("/login");
    } else {
        setIsAuthenticated(true); // Token hai, matlab user login hai
        fetchStats(token); // Tabhi data fetch karo
    }
  }, [navigate]);

  // --- Live Counts Fetch Karna ---
  const fetchStats = async (token) => {
      try {
        const headers = { "x-auth-token": token };

        const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.all([
            axios.get("http://localhost:5000/api/items/lost/all"),
            axios.get("http://localhost:5000/api/items/found/all"),
            axios.get("http://localhost:5000/api/claims/my-claims", { headers }),
            axios.get("http://localhost:5000/api/items/match-results", { headers })
        ]);

        setStats({
            lost: lostRes.data.length,
            found: foundRes.data.length,
            claims: claimsRes.data.length,
            matches: matchesRes.data.length
        });

      } catch (err) {
        console.error("Error fetching stats:", err);
        // Agar token expire ho gaya ho, to logout kar do
        if(err.response && err.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
      }
    };

  // 🔥 Agar login check nahi hua hai, to kuch mat dikhao (Blank screen ya Loading)
  if (!isAuthenticated) {
      return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">User Dashboard</h2>
            <p className="text-gray-500 mt-1">Welcome back! Here is what's happening.</p>
          </div>
          <button 
            onClick={() => navigate("/report-lost")}
            className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition font-bold">
            + New Report
          </button>
        </div>

        {/* --- 1. STATS CARDS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<FaBoxOpen />} title="Total Lost Items" count={stats.lost} color="red" />
          <StatCard icon={<FaCheckCircle />} title="Total Found Items" count={stats.found} color="green" />
          <StatCard icon={<FaClipboardList />} title="My Claims" count={stats.claims} color="yellow" />
          <StatCard icon={<FaMagic />} title="Potential Matches" count={stats.matches} color="purple" />
        </div>

        {/* --- 2. QUICK ACTIONS --- */}
        <h3 className="text-xl font-bold text-gray-700 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            <MenuButton 
                onClick={() => navigate("/report-lost")} 
                icon={<FaPlusCircle />} 
                title="Report Lost Item" 
                color="bg-red-500" 
            />

            <MenuButton 
                onClick={() => navigate("/report-found")} 
                icon={<FaPlusCircle />} 
                title="Report Found Item" 
                color="bg-green-500" 
            />

            <MenuButton 
                onClick={() => navigate("/view-matches")} 
                icon={<FaMagic />} 
                title="View Matched Items" 
                color="bg-purple-600" 
            />

            <MenuButton 
                onClick={() => navigate("/all-lost")} 
                icon={<FaListUl />} 
                title="View All Lost Items" 
                color="bg-blue-600" 
            />

            <MenuButton 
                onClick={() => navigate("/all-found")} 
                icon={<FaListUl />} 
                title="View All Found Items" 
                color="bg-teal-600" 
            />

            <MenuButton 
                onClick={() => navigate("/my-claims")} 
                icon={<FaClipboardList />} 
                title="View My Claims" 
                color="bg-orange-500" 
            />
        </div>

      </div>
    </div>
  );
};

// --- Reusable Components ---
const StatCard = ({ icon, title, count, color }) => {
  const colorClasses = {
    red: "text-red-500 bg-red-50",
    green: "text-green-500 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-500 bg-purple-50"
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{count}</h3>
      </div>
      <div className={`p-4 rounded-full text-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
    </div>
  );
};

const MenuButton = ({ onClick, icon, title, color }) => (
    <button 
        onClick={onClick}
        className={`${color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center gap-3`}
    >
        <div className="text-4xl bg-white/20 p-3 rounded-full">{icon}</div>
        <span className="font-bold text-lg tracking-wide">{title}</span>
    </button>
);

export default Home;