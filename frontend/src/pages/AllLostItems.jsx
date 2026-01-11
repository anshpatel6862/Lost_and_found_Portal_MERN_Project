import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const AllLostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/lost/all");
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching lost items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
          🔴 All Lost Items <span className="text-sm bg-gray-200 text-gray-600 px-3 py-1 rounded-full">{items.length}</span>
        </h2>

        {loading ? (
          <p className="text-center text-xl mt-10">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No lost items reported yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                <div className="h-56 bg-gray-100 relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">LOST</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm">📍 {item.location}</p>
                  <p className="text-gray-500 text-sm">📅 {new Date(item.dateLost).toLocaleDateString()}</p>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllLostItems;