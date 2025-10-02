import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Tag, Percent } from 'lucide-react';
import axios from 'axios';

const PromoCodeManagement = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscount: '',
        minOrderAmount: '',
        applicableItems: 'all',
        usageLimit: '',
        userLimit: '1',
        validFrom: '',
        validUntil: '',
        isActive: true
    });

    useEffect(() => {
        fetchPromoCodes();
    }, [currentPage, searchTerm]);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('/api/v1/promocodes', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchTerm
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPromoCodes(response.data.data.promoCodes);
                setTotalPages(response.data.data.totalPages);
            }
        } catch (error) {
            console.error('Fetch promo codes error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingCode 
                ? `/api/v1/promocodes/${editingCode._id}`
                : '/api/v1/promocodes';
            
            const method = editingCode ? 'put' : 'post';
            
            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                fetchPromoCodes();
                resetForm();
                alert(editingCode ? 'Promo code updated successfully!' : 'Promo code created successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save promo code');
        }
    };

    const handleEdit = (promoCode) => {
        setEditingCode(promoCode);
        setFormData({
            code: promoCode.code,
            description: promoCode.description,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue.toString(),
            maxDiscount: promoCode.maxDiscount?.toString() || '',
            minOrderAmount: promoCode.minOrderAmount.toString(),
            applicableItems: promoCode.applicableItems,
            usageLimit: promoCode.usageLimit?.toString() || '',
            userLimit: promoCode.userLimit.toString(),
            validFrom: new Date(promoCode.validFrom).toISOString().slice(0, 16),
            validUntil: new Date(promoCode.validUntil).toISOString().slice(0, 16),
            isActive: promoCode.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`/api/v1/promocodes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchPromoCodes();
            alert('Promo code deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete promo code');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            maxDiscount: '',
            minOrderAmount: '',
            applicableItems: 'all',
            usageLimit: '',
            userLimit: '1',
            validFrom: '',
            validUntil: '',
            isActive: true
        });
        setEditingCode(null);
        setShowForm(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (promoCode) => {
        const now = new Date();
        const validFrom = new Date(promoCode.validFrom);
        const validUntil = new Date(promoCode.validUntil);

        if (!promoCode.isActive) {
            return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
        }
        
        if (now < validFrom) {
            return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Scheduled</span>;
        }
        
        if (now > validUntil) {
            return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Expired</span>;
        }
        
        if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
            return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Limit Reached</span>;
        }
        
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Promo Code Management</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Promo Code
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search promo codes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Promo Codes List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading promo codes...</p>
                    </div>
                ) : promoCodes.length === 0 ? (
                    <div className="p-8 text-center">
                        <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No promo codes found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valid Until
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {promoCodes.map((promoCode) => (
                                    <tr key={promoCode._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{promoCode.code}</div>
                                                <div className="text-sm text-gray-500">{promoCode.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {promoCode.discountType === 'percentage' ? (
                                                    <Percent size={16} className="text-green-600 mr-1" />
                                                ) : (
                                                    <span className="text-green-600 mr-1">₹</span>
                                                )}
                                                <span className="text-sm font-medium">
                                                    {promoCode.discountValue}
                                                    {promoCode.discountType === 'percentage' ? '%' : ''}
                                                </span>
                                            </div>
                                            {promoCode.maxDiscount && (
                                                <div className="text-xs text-gray-500">
                                                    Max: ₹{promoCode.maxDiscount}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {promoCode.usedCount}
                                            {promoCode.usageLimit && ` / ${promoCode.usageLimit}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(promoCode.validUntil)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(promoCode)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(promoCode)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promoCode._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingCode ? 'Edit Promo Code' : 'Create New Promo Code'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Promo Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={editingCode}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type *
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        max={formData.discountType === 'percentage' ? '100' : undefined}
                                    />
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Discount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Order Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Applicable Items
                                    </label>
                                    <select
                                        value={formData.applicableItems}
                                        onChange={(e) => setFormData({...formData, applicableItems: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Items</option>
                                        <option value="courses">Courses Only</option>
                                        <option value="testSeries">Test Series Only</option>
                                        <option value="programs">Programs Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Limit *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.userLimit}
                                        onChange={(e) => setFormData({...formData, userLimit: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valid From *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valid Until *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingCode ? 'Update' : 'Create'} Promo Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCodeManagement;