import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import customFetch from '../utils/customFetch';
import SeatBookingForm from '../components/seat/SeatBookingForm';

const SeatBookingPage = () => {
    const navigate = useNavigate();
    const { centerId } = useParams();
    const [searchParams] = useSearchParams();
    const seatId = searchParams.get('seatId');
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        if (centerId && centers.length > 0) {
            const center = centers.find(c => c._id === centerId);
            if (center) {
                setSelectedCenter(center);
            } else {
                toast.error('Center not found');
                navigate('/seat-booking');
            }
        }
    }, [centerId, centers, navigate]);

    const fetchCenters = async () => {
        setLoading(true);
        try {
            const response = await customFetch('/centers?limit=100');
            setCenters(response.data.data.centers || []);
        } catch (error) {
            console.error('Error fetching centers:', error);
            toast.error('Failed to fetch centers');
        } finally {
            setLoading(false);
        }
    };

    const handleCenterSelect = (center) => {
        setSelectedCenter(center);
        navigate(`/seat-booking/${center._id}`);
    };

    const handleBookingSuccess = (booking) => {
        toast.success('Seat booked successfully!');
        navigate('/my-bookings');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Book a Seat</h1>
                    <p className="mt-2 text-gray-600">
                        Select a center and book your preferred seat for study or work.
                    </p>
                </div>

                {!selectedCenter ? (
                    // Center Selection
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Select a Center</h2>
                        
                        {centers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No centers available for booking
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {centers.map(center => (
                                    <div
                                        key={center._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleCenterSelect(center)}
                                    >
                                        <div className="aspect-w-16 aspect-h-9 mb-4">
                                            <img
                                                src={center.image}
                                                alt={center.name}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {center.name}
                                        </h3>
                                        
                                        <p className="text-gray-600 mb-2">
                                            📍 {center.location}
                                        </p>
                                        
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                            {center.description}
                                        </p>
                                        
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Capacity: {center.capacity}</span>
                                            <span>Students: {center.enrolledStudents?.length || 0}</span>
                                        </div>
                                        
                                        {center.facilities && center.facilities.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {center.facilities.slice(0, 3).map((facility, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                        >
                                                            {facility}
                                                        </span>
                                                    ))}
                                                    {center.facilities.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{center.facilities.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                                            Select Center
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Booking Form
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <SeatBookingForm
                                center={selectedCenter}
                                onBookingSuccess={handleBookingSuccess}
                                preSelectedSeatId={seatId}
                            />
                        </div>
                        
                        <div className="lg:col-span-1">
                            {/* Center Info Sidebar */}
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                                <div className="mb-4">
                                    <button
                                        onClick={() => {
                                            setSelectedCenter(null);
                                            navigate('/seat-booking');
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        ← Change Center
                                    </button>
                                </div>
                                
                                <img
                                    src={selectedCenter.image}
                                    alt={selectedCenter.name}
                                    className="w-full h-32 object-cover rounded-lg mb-4"
                                />
                                
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {selectedCenter.name}
                                </h3>
                                
                                <p className="text-gray-600 mb-4">
                                    📍 {selectedCenter.location}
                                </p>
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Capacity:</span>
                                        <span className="font-medium">{selectedCenter.capacity}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contact:</span>
                                        <span className="font-medium">{selectedCenter.contactPhone}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium text-xs">{selectedCenter.contactEmail}</span>
                                    </div>
                                </div>
                                
                                {selectedCenter.facilities && selectedCenter.facilities.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-800 mb-2">Facilities</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCenter.facilities.map((facility, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                >
                                                    {facility}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatBookingPage;
