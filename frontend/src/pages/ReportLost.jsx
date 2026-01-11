import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ReportLost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    description: "",
    location: "",
    dateLost: "",
    image: null, // File object yahan ayega
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 🔥 FIX 1: Use FormData (Backend expects file + text data together)
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("dateLost", formData.dateLost);
      
      if (formData.image) {
        data.append("file", formData.image); // Field name must be 'file'
      }

      // 🔥 FIX 2: Correct URL '/report-lost' (Matches backend route)
      await axios.post("http://localhost:5000/api/items/report-lost", data, {
        headers: { 
          "x-auth-token": token,
          "Content-Type": "multipart/form-data" 
        }
      });

      alert("✅ Lost Item Reported Successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.error("Error:", err);
      alert(err.response?.data?.message || "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white p-8 rounded-xl shadow-lg mt-4 border-t-4 border-red-500">
            <h2 className="text-2xl font-bold text-center mb-6 text-red-600">Report Lost Item</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Item Name */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Item Name</label>
                <input type="text" name="name" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="e.g. Black Wallet" />
            </div>

            {/* Category */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select name="category" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg">
                    <option>Electronics</option>
                    <option>Documents</option>
                    <option>Wallet/Bag</option>
                    <option>Jewelry</option>
                    <option>Others</option>
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea name="description" onChange={handleChange} rows="3" className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="Describe the item..."></textarea>
            </div>

            {/* Location */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Location Lost</label>
                <input type="text" name="location" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="e.g. Canteen area" />
            </div>

            {/* Date Lost */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Date Lost</label>
                <input type="date" name="dateLost" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required />
            </div>

            {/* Upload Image */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <label className="block font-bold text-gray-700 mb-1">Upload Image (Required for AI Match)</label>
                <input type="file" onChange={handleImageChange} className="w-full bg-white border p-2 rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Upload a photo similar to what you lost (e.g. from Google) for better AI matching.</p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition mt-6 text-lg shadow-md">
                {loading ? "Submitting..." : "Submit Report"}
            </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default ReportLost;