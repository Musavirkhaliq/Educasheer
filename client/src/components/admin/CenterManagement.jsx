import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaUsers, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const CenterManagement = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchCenters();
  }, []);
  
  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/centers?limit=100', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
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
  
  const filteredCenters = centers.filter(center => 
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
          onClick={fetchCenters}
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Centers</h2>
        <Link
          to="/centers/create"
          className="bg-[#00bcd4] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
        >
          <FaPlus className="h-4 w-4" />
          Create New Center
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search centers by name or location..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>
      
      {filteredCenters.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Centers Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? "No centers match your search criteria." : "You haven't created any centers yet."}
          </p>
          {!searchQuery && (
            <Link
              to="/centers/create"
              className="inline-block bg-[#00bcd4] text-white px-6 py-3 rounded-lg hover:bg-[#01427a] transition-all duration-300 shadow-sm hover:shadow"
            >
              Create Your First Center
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Center
                </th>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Location
                </th>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Students
                </th>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCenters.map((center) => (
                <tr key={center._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={center.image}
                          alt={center.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {center.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {center.contactEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-1 text-[#00bcd4]" />
                      {center.location}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-1 text-[#00bcd4]" />
                      {center.enrolledStudents?.length || 0} / {center.capacity}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {center.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/centers/${center._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Center"
                      >
                        View
                      </Link>
                      <Link
                        to={`/centers/${center._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCenter(center._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Center"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CenterManagement;
