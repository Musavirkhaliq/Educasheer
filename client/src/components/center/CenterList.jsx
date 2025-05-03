import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CenterCard from './CenterCard';

const CenterList = ({
  limit,
  showControls = false,
  showCreateButton = false,
  title = "Centers",
  search = ""
}) => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/v1/centers', {
          params: {
            limit: limit || 100,
            search: search || undefined
          }
        });
        
        setCenters(response.data.data.centers);
      } catch (err) {
        console.error('Error fetching centers:', err);
        setError('Failed to load centers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCenters();
  }, [limit, search]);
  
  const handleDeleteCenter = async (centerId) => {
    if (!window.confirm('Are you sure you want to delete this center?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/v1/centers/${centerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Remove the deleted center from the state
      setCenters(centers.filter(center => center._id !== centerId));
    } catch (err) {
      console.error('Error deleting center:', err);
      alert('Failed to delete center. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00bcd4]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg hover:bg-[#01427a] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {showCreateButton && currentUser?.role === 'admin' && (
          <Link
            to="/centers/create"
            className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
          >
            <FaPlus className="h-4 w-4" />
            Create New Center
          </Link>
        )}
      </div>
      
      {centers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Centers Found</h3>
          <p className="text-gray-500 mb-6">
            {showCreateButton ? "You haven't created any centers yet." : "There are no centers available at the moment."}
          </p>
          {showCreateButton && currentUser?.role === 'admin' && (
            <Link
              to="/centers/create"
              className="inline-block bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
            >
              Create Your First Center
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <CenterCard
              key={center._id}
              center={center}
              showControls={showControls}
              onDelete={handleDeleteCenter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterList;
