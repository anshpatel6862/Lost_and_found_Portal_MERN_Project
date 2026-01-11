import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa"; // Eye Icons added
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/auth/change-password", 
        { 
          oldPassword: formData.oldPassword, 
          newPassword: formData.newPassword 
        }, 
        { headers: { "x-auth-token": token } }
      );

      setMessage("✅ " + res.data.message);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      setTimeout(() => navigate("/"), 2000);

    } catch (err) {
      setError("❌ " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center mt-10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex justify-center items-center gap-2">
            <FaLock className="text-purple-600" /> Change Password
          </h2>

          {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center text-sm font-bold">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center text-sm font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Old Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">Old Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 ring-purple-400">
                <FaKey className="text-gray-400 mr-2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="oldPassword" 
                  placeholder="Current Password" 
                  required
                  className="w-full bg-transparent outline-none text-gray-700"
                  value={formData.oldPassword} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">New Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 ring-purple-400">
                <FaLock className="text-gray-400 mr-2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="newPassword" 
                  placeholder="New Password" 
                  required
                  className="w-full bg-transparent outline-none text-gray-700"
                  value={formData.newPassword} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-sm">Confirm New Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 ring-purple-400">
                <FaLock className="text-gray-400 mr-2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  placeholder="Repeat New Password" 
                  required
                  className="w-full bg-transparent outline-none text-gray-700"
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center gap-2 cursor-pointer w-fit" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                <span className="text-sm text-gray-600 select-none">Show Passwords</span>
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg transition shadow-md hover:shadow-lg">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;