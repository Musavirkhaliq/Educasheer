import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Package,
    Download,
    Eye,
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Filter,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [filters.status, pagination.currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(
                `/api/v1/payments/orders?page=${pagination.currentPage}&limit=10&status=${filters.status}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data.orders);
                setPagination({
                    currentPage: data.data.currentPage,
                    totalPages: data.data.totalPages,
                    total: data.data.total
                });
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

    const handleOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/v1/payments/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedOrder(data.data);
                setShowOrderDetails(true);
            } else {
                toast.error('Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to fetch order details');
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

    const handlePreviewReceipt = (orderId) => {
        const token = localStorage.getItem('accessToken');
        const url = `/api/v1/payments/orders/${orderId}/receipt/preview`;

        // Create a temporary form to send the token in the header
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write('<html><head><title>Loading Receipt...</title></head><body><div style="text-align: center; padding: 50px;">Loading receipt preview...</div></body></html>');

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.text())
            .then(html => {
                previewWindow.document.open();
                previewWindow.document.write(html);
                previewWindow.document.close();
            })
            .catch(error => {
                console.error('Error loading receipt preview:', error);
                previewWindow.document.write('<html><body><div style="text-align: center; padding: 50px; color: red;">Error loading receipt preview</div></body></html>');
            });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
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

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
            order.items.some(item => item.title.toLowerCase().includes(filters.search.toLowerCase()));
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-lg p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">View and manage your purchase history</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Orders</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status !== 'all'
                                ? 'Try adjusting your filters'
                                : 'You haven\'t made any purchases yet'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order.orderId}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(order.paymentStatus)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CreditCard className="w-4 h-4" />
                                                {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Items: </span>
                                            {order.items.slice(0, 2).map(item => item.title).join(', ')}
                                            {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                        </div>
                                    </div>

                                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                                        <div className="text-2xl font-bold text-gray-900 mb-3">
                                            {order.totalAmount === 0 ? 'Free' : `₹${order.totalAmount}`}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOrderDetails(order.orderId)}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Details
                                            </button>

                                            {order.paymentStatus === 'completed' && (
                                                <>
                                                    <button
                                                        onClick={() => handlePreviewReceipt(order.orderId)}
                                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadReceipt(order.orderId)}
                                                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Receipt
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Order Details
                                </h2>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Order ID</label>
                                        <p className="text-gray-900">{selectedOrder.orderId}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Date</label>
                                        <p className="text-gray-900">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(selectedOrder.paymentStatus)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                                                {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                        <p className="text-gray-900">
                                            {selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1)}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Items Purchased</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-600 capitalize">{item.itemType}</p>
                                                </div>
                                                <div className="text-right">
                                                    {item.originalPrice !== item.price && (
                                                        <p className="text-sm text-gray-500 line-through">₹{item.originalPrice}</p>
                                                    )}
                                                    <p className="font-semibold text-gray-900">₹{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="text-gray-900">₹{selectedOrder.subtotal}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Discount {selectedOrder.promoCode?.code && `(${selectedOrder.promoCode.code})`}
                                                </span>
                                                <span className="text-green-600">-₹{selectedOrder.discount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-gray-900">₹{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {selectedOrder.paymentStatus === 'completed' && (
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => handlePreviewReceipt(selectedOrder.orderId)}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview Receipt
                                        </button>
                                        <button
                                            onClick={() => handleDownloadReceipt(selectedOrder.orderId)}
                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Receipt
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;