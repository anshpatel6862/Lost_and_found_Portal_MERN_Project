import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaCheckCircle, FaGavel, FaKey, FaSignOutAlt, FaTrash, FaCheck, FaTimes, FaLock } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ counts: {}, activity: [] });
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  
  // 🔥 New Password State (Robust)
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchStats();
  }, []);

  // --- API Functions ---
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/stats", { headers: { "x-auth-token": token } });
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/users", { headers: { "x-auth-token": token } });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchItems = async (type) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items/${type}/all`);
      if (type === 'lost') setLostItems(res.data);
      else setFoundItems(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/claims/admin/all", { headers: { "x-auth-token": token } });
      setClaims(res.data);
    } catch (err) { console.error(err); }
  };

  // --- Handlers ---
  const handleDeleteUser = async (id) => {
    if(!confirm("Are you sure? This will delete the user permanently.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/user/${id}`, { headers: { "x-auth-token": token } });
      alert("User Deleted Successfully");
      fetchUsers();
    } catch (err) { alert("Failed to delete user"); }
  };

  const handleDeleteItem = async (id, type) => {
    if(!confirm("Delete this item permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/items/delete/${id}`, { headers: { "x-auth-token": token } });
      alert("Item Deleted!");
      fetchItems(type);
    } catch (err) { alert("Failed to delete item"); }
  };

  // 🔥 UPDATED: Secure Password Change
  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
        return alert("New Passwords do not match!");
    }
    
    try {
        const token = localStorage.getItem("token");
        // User wali same API use kar rahe hain kyunki Admin bhi ek User hi hai
        const res = await axios.put("http://localhost:5000/api/auth/change-password", 
            { 
                oldPassword: passData.oldPassword, 
                newPassword: passData.newPassword 
            }, 
            { headers: { "x-auth-token": token } }
        );
        alert("✅ " + res.data.message);
        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { 
        alert("❌ Error: " + (err.response?.data?.message || "Failed to update password")); 
    }
  };

  const handleClaimStatus = async (id, status) => {
    if(!confirm(`Are you sure you want to ${status} this claim?`)) return;
    try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:5000/api/claims/update-status/${id}`, 
            { status }, 
            { headers: { "x-auth-token": token } }
        );
        alert(`Claim ${status} Successfully! Emails sent.`);
        fetchClaims(); 
    } catch (err) {
        alert("Action failed");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if(tab === 'users') fetchUsers();
    if(tab === 'lost_items') fetchItems('lost');
    if(tab === 'found_items') fetchItems('found');
    if(tab === 'claims') fetchClaims();
    if(tab === 'dashboard') fetchStats();
  };

  const SidebarItem = ({ id, icon, label }) => (
    <button 
      onClick={() => handleTabChange(id)}
      className={`w-full flex items-center gap-3 px-6 py-4 text-left transition ${
        activeTab === id ? "bg-blue-600 text-white border-r-4 border-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}>
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* 1. SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold tracking-wider text-blue-400">Admin Panel</h2>
        </div>
        <nav className="flex-1 mt-4">
          <SidebarItem id="dashboard" icon={<FaTachometerAlt />} label="Dashboard" />
          <SidebarItem id="users" icon={<FaUsers />} label="Manage Users" />
          <SidebarItem id="found_items" icon={<FaCheckCircle />} label="Found Items" />
          <SidebarItem id="lost_items" icon={<FaBoxOpen />} label="Lost Items" />
          <SidebarItem id="claims" icon={<FaGavel />} label="Claims" />
          <SidebarItem id="password" icon={<FaKey />} label="Change Password" />
        </nav>
        <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="p-4 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 transition">
            <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 ml-64 p-8 overflow-hidden">
        
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('_', ' ')}</h1>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Welcome, Admin</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
            </div>
        </header>

        {/* --- DYNAMIC CONTENT --- */}

        {/* A. DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <DashboardCard title="Total Users" count={stats.counts?.totalUsers || 0} color="bg-blue-500" />
                    <DashboardCard title="Lost Items" count={stats.counts?.lostCount || 0} color="bg-yellow-500" />
                    <DashboardCard title="Found Items" count={stats.counts?.foundCount || 0} color="bg-green-500" />
                    <DashboardCard title="Pending Claims" count={stats.counts?.pendingClaims || 0} color="bg-red-500" />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Recent Activities</h3>
                    <ul className="space-y-3">
                        {stats.activity?.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                                <span className="text-gray-700">
                                    <span className="font-bold">{item.name}</span> marked as 
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${item.dateLost ? 'bg-red-500' : 'bg-green-500'}`}>
                                        {item.dateLost ? 'Lost' : 'Found'}
                                    </span>
                                </span>
                                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* B. USERS TABLE */}
        {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 border-b">ID</th>
                                <th className="p-4 border-b">Name</th>
                                <th className="p-4 border-b">Email</th>
                                <th className="p-4 border-b">Phone</th>
                                <th className="p-4 border-b">Role</th>
                                <th className="p-4 border-b">Created At</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user, index) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-500 text-xs">#{index + 1}</td>
                                    <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="p-4 text-sm text-gray-600">{user.phone || "-"}</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{user.role || 'User'}</span></td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDeleteUser(user._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs flex items-center gap-1 mx-auto"><FaTrash /> Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* C. FOUND ITEMS TABLE */}
        {activeTab === 'found_items' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4 border-b">ID</th>
                                <th className="p-4 border-b">Name</th>
                                <th className="p-4 border-b">Category</th>
                                <th className="p-4 border-b">Description</th>
                                <th className="p-4 border-b">Location</th>
                                <th className="p-4 border-b">Date Found</th>
                                <th className="p-4 border-b">Image</th>
                                <th className="p-4 border-b">Contact Name</th>
                                <th className="p-4 border-b">Phone</th>
                                <th className="p-4 border-b">Email</th>
                                <th className="p-4 border-b">Created At</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {foundItems.length === 0 ? (
                                <tr><td colSpan="12" className="p-6 text-center text-gray-500">No Found Items Data</td></tr>
                            ) : foundItems.map((item, index) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-500">{index + 1}</td>
                                    <td className="p-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="p-4 text-gray-600">{item.category}</td>
                                    <td className="p-4 text-gray-500 max-w-xs truncate" title={item.description}>{item.description}</td>
                                    <td className="p-4 text-gray-600">{item.location}</td>
                                    <td className="p-4 text-gray-600">{new Date(item.dateFound).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {item.imageUrl ? <img src={item.imageUrl} alt="Item" className="w-10 h-10 rounded object-cover border" /> : <span className="text-xs text-gray-400">No Img</span>}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{item.contactName}</td>
                                    <td className="p-4 text-gray-600">{item.contactPhone}</td>
                                    <td className="p-4 text-blue-600 hover:underline"><a href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a></td>
                                    <td className="p-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleDeleteItem(item._id, 'found')} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* D. LOST ITEMS TABLE */}
        {activeTab === 'lost_items' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4 border-b">ID</th>
                                <th className="p-4 border-b">Image</th>
                                <th className="p-4 border-b">Name</th>
                                <th className="p-4 border-b">Category</th>
                                <th className="p-4 border-b">Description</th>
                                <th className="p-4 border-b">Location</th>
                                <th className="p-4 border-b">Date Lost</th>
                                <th className="p-4 border-b">Posted By</th>
                                <th className="p-4 border-b">User Email</th>
                                <th className="p-4 border-b">User Phone</th>
                                <th className="p-4 border-b">Created At</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {lostItems.length === 0 ? (
                                <tr><td colSpan="12" className="p-6 text-center text-gray-500">No Lost Items Reported</td></tr>
                            ) : lostItems.map((item, index) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-500">{index + 1}</td>
                                    <td className="p-4">
                                        {item.imageUrl ? <img src={item.imageUrl} alt="Item" className="w-10 h-10 rounded object-cover border" /> : <span className="text-xs text-gray-400">No Img</span>}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="p-4 text-gray-600">{item.category}</td>
                                    <td className="p-4 text-gray-500 max-w-xs truncate" title={item.description}>{item.description}</td>
                                    <td className="p-4 text-gray-600">{item.location}</td>
                                    <td className="p-4 text-red-500 font-medium">{new Date(item.dateLost).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium text-gray-800">{item.createdBy?.name || "Unknown"}</td>
                                    <td className="p-4 text-blue-600 hover:underline"><a href={`mailto:${item.createdBy?.email}`}>{item.createdBy?.email || "N/A"}</a></td>
                                    <td className="p-4 text-gray-600">{item.createdBy?.phone || "N/A"}</td>
                                    <td className="p-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleDeleteItem(item._id, 'lost')} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* E. CLAIMS TABLE */}
        {activeTab === 'claims' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 border-b">Item Name</th>
                                <th className="p-4 border-b">Claimer</th>
                                <th className="p-4 border-b">Message</th>
                                <th className="p-4 border-b">Status</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {claims.length === 0 ? (
                                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No Pending Claims</td></tr>
                            ) : claims.map(claim => (
                                <tr key={claim._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-800">{claim.foundItem?.name || "Deleted Item"}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{claim.claimer?.name}</div>
                                        <div className="text-xs text-blue-500">{claim.claimer?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 italic">"{claim.message}"</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            claim.status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                                            claim.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {claim.status === 'Pending' ? (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleClaimStatus(claim._id, 'Accepted')} className="bg-green-500 text-white p-2 rounded hover:bg-green-600" title="Approve"><FaCheck /></button>
                                                <button onClick={() => handleClaimStatus(claim._id, 'Rejected')} className="bg-red-500 text-white p-2 rounded hover:bg-red-600" title="Reject"><FaTimes /></button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* F. CHANGE PASSWORD (🔥 ROBUST UI) */}
        {activeTab === 'password' && (
            <div className="flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <FaLock className="text-blue-500" /> Update Admin Password
                    </h3>
                    
                    <form onSubmit={handleSubmitPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                name="oldPassword"
                                placeholder="Enter current password" 
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={passData.oldPassword}
                                onChange={handlePassChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                name="newPassword"
                                placeholder="Enter new password" 
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={passData.newPassword}
                                onChange={handlePassChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                placeholder="Repeat new password" 
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={passData.confirmPassword}
                                onChange={handlePassChange}
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

// Helper Stats Card
const DashboardCard = ({ title, count, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
            <h3 className={`text-4xl font-bold mt-2 text-gray-800`}>{count}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} opacity-20`}></div>
    </div>
);

export default AdminDashboard;