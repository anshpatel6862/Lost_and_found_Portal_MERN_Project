import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaClock, FaCheckCircle, FaTimesCircle, FaPhoneAlt, FaEnvelope, FaBoxOpen } from "react-icons/fa";

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/claims/my-claims", {
          headers: { "x-auth-token": token }
        });
        setClaims(res.data);
      } catch (err) {
        console.error("Error fetching claims:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Status Badge Logic
  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><FaCheckCircle /> Approved</span>;
      case "Rejected":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><FaClock /> Pending Admin Approval</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4 flex items-center gap-2">
           <FaBoxOpen className="text-blue-600" /> My Claim Requests
        </h2>

        {loading ? (
          <div className="flex justify-center mt-10">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow border border-dashed border-gray-300">
            <p className="text-gray-500 text-xl">You haven't claimed any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row border border-gray-100">
                
                {/* 1. Item Image */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative flex-shrink-0">
                  {claim.foundItem?.imageUrl ? (
                    <img src={claim.foundItem.imageUrl} alt="Item" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                </div>

                {/* 2. Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{claim.foundItem?.name || "Unknown Item"}</h3>
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="text-gray-500 text-sm mb-4">📅 Claimed on: {new Date(claim.createdAt).toLocaleDateString()}</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border-l-4 border-blue-400 mb-4">
                      "{claim.message}"
                    </div>
                  </div>

                  {/* 3. Finder Contact (Only if Approved) */}
                  {claim.status === "Accepted" ? (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">🎉 Contact the Finder:</h4>
                      <p className="text-gray-700"><b>Name:</b> {claim.foundItem?.contactName}</p>
                      <p className="flex items-center gap-2 text-gray-700"><FaPhoneAlt className="text-green-600"/> {claim.foundItem?.contactPhone || "N/A"}</p>
                      <p className="flex items-center gap-2 text-gray-700"><FaEnvelope className="text-green-600"/> {claim.foundItem?.contactEmail || "N/A"}</p>
                    </div>
                  ) : (
                    <div className="mt-4 text-gray-400 text-sm flex items-center gap-1">
                      🔒 Finder details visible after approval.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;