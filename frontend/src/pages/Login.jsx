import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "user" });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Page khulte hi purana login data hata do (Clean Start)
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Backend ko request bhejo
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      // Login Context update karo
      login(res.data.token, res.data.user);

      // 🔥 REDIRECT LOGIC (Admin -> Admin Panel, User -> Home)
      if (formData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center mt-10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Dropdown */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">Select Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 ring-blue-500 outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">Email Address</label>
              <input 
                type="email" name="email" placeholder="Enter your email" required
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 ring-blue-500"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">Password</label>
              <input 
                type="password" name="password" placeholder="Enter your password" required
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 ring-blue-500"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition active:scale-95"
            >
              Login as {formData.role === 'admin' ? 'Admin' : 'User'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;