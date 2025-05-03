import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CenterCard = ({ center, showControls = false, onDelete }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <Link to={`/centers/${center._id}`} className="block relative">
        <div className="overflow-hidden">
          <img
            src={center.image}
            alt={center.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              View Center
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-[#00bcd4] transition-colors duration-300">
            <Link to={`/centers/${center._id}`}>{center.name}</Link>
          </h3>
          {center.isActive ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Inactive</span>
          )}
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-1 text-[#00bcd4]" />
          <span className="text-sm">{center.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{center.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <FaUsers className="mr-1 text-[#00bcd4]" />
            <span className="text-sm">{center.enrolledStudents?.length || 0} Students</span>
          </div>
          
          {showControls && currentUser?.role === 'admin' && (
            <div className="flex space-x-2">
              <Link
                to={`/centers/${center._id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit Center"
              >
                <FaEdit />
              </Link>
              <button
                onClick={() => onDelete(center._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Center"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterCard;
