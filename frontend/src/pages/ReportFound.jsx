import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ReportFound = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    description: "",
    location: "",
    dateFound: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    image: null, // File Object yahan store hoga
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
      
      // 🔥 CHANGE: JSON ki jagah 'FormData' use karenge
      // Taki Image aur Data ek sath Backend par jaye
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("dateFound", formData.dateFound);
      data.append("contactName", formData.contactName);
      data.append("contactPhone", formData.contactPhone);
      data.append("contactEmail", formData.contactEmail);
      
      // Image file append karo (Agar user ne select ki hai)
      if (formData.image) {
        data.append("file", formData.image); 
      }

      // Backend API Call (Content-Type header zaroori hai)
      await axios.post("http://localhost:5000/api/items/report-found", data, {
        headers: { 
          "x-auth-token": token,
          "Content-Type": "multipart/form-data" 
        }
      });

      alert("✅ Item Reported Successfully!");
      navigate("/home");

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
        <div className="bg-white p-8 rounded-xl shadow-lg mt-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Report a Found Item</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Form Fields Same as Before */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Item Name</label>
                <input type="text" name="name" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="e.g. Mobile Phone" />
            </div>

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

            <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea name="description" onChange={handleChange} rows="3" className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="Item details..."></textarea>
            </div>

            <div>
                <label className="block font-bold text-gray-700 mb-1">Location Found</label>
                <input type="text" name="location" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required placeholder="e.g. Library" />
            </div>

            <div>
                <label className="block font-bold text-gray-700 mb-1">Date Found</label>
                <input type="date" name="dateFound" onChange={handleChange} className="w-full bg-gray-50 border p-3 rounded-lg" required />
            </div>

            {/* Image Input */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Upload Image</label>
                <input type="file" onChange={handleImageChange} className="w-full bg-gray-50 border p-3 rounded-lg" />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Contact Details */}
            <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Name</label>
                <input type="text" name="contactName" onChange={handleChange} className="w-full bg-blue-50 border border-blue-200 p-3 rounded-lg" required placeholder="Your Full Name" />
            </div>

            <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                <input type="tel" name="contactPhone" onChange={handleChange} className="w-full bg-blue-50 border border-blue-200 p-3 rounded-lg" required placeholder="Mobile No." />
            </div>

            <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Email</label>
                <input type="email" name="contactEmail" onChange={handleChange} className="w-full bg-blue-50 border border-blue-200 p-3 rounded-lg" required placeholder="Email Address" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mt-6 text-lg shadow-md">
                {loading ? "Submitting..." : "Submit Report"}
            </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFound;