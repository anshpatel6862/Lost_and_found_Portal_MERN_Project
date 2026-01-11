import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Password Match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 2. Backend Call
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      alert("Registration Successful! Please Login.");
      navigate("/login"); // Register ke baad Login page par bhejo

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
            <input 
              type="text" name="name" required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Email Address</label>
            <input 
              type="email" name="email" required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Mobile Number</label>
            <input 
              type="text" name="phone" required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter mobile number"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
            <input 
              type="password" name="password" required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="******"
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Confirm Password</label>
            <input 
              type="password" name="confirmPassword" required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="******"
              onChange={handleChange}
            />
          </div>

          <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;