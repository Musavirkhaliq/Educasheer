import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, 
    Download, 
    Eye, 
    Calendar, 
    CreditCard, 
    CheckCircle, 
    Clock, 
    XCircle,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OrdersProfile = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentOrders();
    }, []);

    const fetchRecentOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/v1/payments/orders?page=1&limit=5', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data.orders);
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (orderId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/v1/payments/orders/${orderId}/receipt`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Receipt downloaded successfully');
            } else {
                toast.error('Failed to download receipt');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            toast.error('Failed to download receipt');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                    View All Orders
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                    <p className="text-gray-600 mb-4">Start exploring our courses and test series</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-gray-900">
                                            Order #{order.orderId}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(order.paymentStatus)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {order.items.slice(0, 1).map(item => item.title).join(', ')}
                                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                    </div>
                                </div>

                                <div className="text-right ml-4">
                                    <div className="text-lg font-semibold text-gray-900 mb-2">
                                        {order.totalAmount === 0 ? 'Free' : `₹${order.totalAmount}`}
                                    </div>
                                    
                                    <div className="flex gap-1">
                                        {order.paymentStatus === 'completed' && (
                                            <button
                                                onClick={() => handleDownloadReceipt(order.orderId)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Download Receipt"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate('/orders')}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length >= 5 && (
                        <div className="text-center pt-4">
                            <button
                                onClick={() => navigate('/orders')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View All Orders →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersProfile;