import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaRobot, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

const MatchItems = () => {
  const [matches, setMatches] = useState([]);
  const [claimStatusMap, setClaimStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState({}); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const matchRes = await axios.get("http://localhost:5000/api/items/match-results", { headers: { "x-auth-token": token } });
        const claimsRes = await axios.get("http://localhost:5000/api/claims/my-claims", { headers: { "x-auth-token": token } });

        setMatches(Array.isArray(matchRes.data) ? matchRes.data : []);
        
        const statusMap = {};
        claimsRes.data.forEach(claim => {
            const itemId = claim.foundItem?._id || claim.foundItem;
            if (itemId) statusMap[itemId.toString()] = claim.status;
        });
        setClaimStatusMap(statusMap);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleClaim = async (lostItemId, foundItemId) => {
    try {
        setProcessingItems(prev => ({ ...prev, [foundItemId]: true }));
        const token = localStorage.getItem("token");
        
        await axios.post("http://localhost:5000/api/claims/create", 
            { lostItemId, foundItemId }, 
            { headers: { "x-auth-token": token } }
        );

        setClaimStatusMap(prev => ({ ...prev, [foundItemId]: 'Pending' }));
        alert("✅ Claim Request Sent!");

    } catch (err) {
        // 🔥 Error Alert Show karo
        alert(err.response?.data?.message || "Error claiming item");
    } finally {
        setProcessingItems(prev => ({ ...prev, [foundItemId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-600"><FaRobot /> AI Magic Matches</h2>
        {loading ? <p className="text-center">Loading...</p> : matches.length === 0 ? (
            <div className="text-center bg-white p-10"><FaExclamationTriangle className="mx-auto text-4xl text-yellow-400"/> No matches found.</div>
        ) : (
            <div className="grid grid-cols-1 gap-8">
                {matches.map((match, index) => {
                    if (!match.lostItem || !match.foundItem) return null;
                    const foundItemId = match.foundItem._id.toString();
                    const status = claimStatusMap[foundItemId]; 
                    const isProcessing = processingItems[foundItemId];

                    return (
                        <div key={index} className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row p-6 border">
                            <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                                <img src={match.lostItem.imageUrl} className="w-full h-32 object-cover rounded" alt="Lost"/>
                                <img src={match.foundItem.imageUrl} className="w-full h-32 object-cover rounded" alt="Found"/>
                            </div>
                            <div className="md:w-1/3 flex flex-col justify-center items-center pl-6 border-l">
                                <h3 className="font-bold mb-4 text-purple-800">Match: {match.score}%</h3>
                                {status === 'Accepted' ? (
                                    <button disabled className="w-full bg-green-500 text-white py-2 rounded cursor-default"><FaCheckCircle /> Claim Accepted</button>
                                ) : status === 'Pending' ? (
                                    <button disabled className="w-full bg-yellow-500 text-white py-2 rounded cursor-not-allowed"><FaClock /> Pending Approval</button>
                                ) : (
                                    <button 
                                        onClick={() => handleClaim(match.lostItem._id, foundItemId)}
                                        disabled={isProcessing}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">
                                        {isProcessing ? 'Sending...' : 'Yes, Claim This'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default MatchItems;