import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
    const { items, totalAmount, totalItems, removeFromCart, clearCart } = useCart();
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const navigate = useNavigate();

    const handleRemoveItem = async (itemType, itemId) => {
        await removeFromCart(itemType, itemId);
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            await clearCart();
        }
    };

    const validatePromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        setPromoLoading(true);
        setPromoError('');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('/api/v1/promocodes/validate', {
                code: promoCode,
                cartItems: items
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPromoDiscount(response.data.data);
                setPromoError('');
            }
        } catch (error) {
            setPromoError(error.response?.data?.message || 'Invalid promo code');
            setPromoDiscount(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const removePromoCode = () => {
        setPromoCode('');
        setPromoDiscount(null);
        setPromoError('');
    };

    const handleCheckout = () => {
        navigate('/checkout', { 
            state: { 
                promoCode: promoDiscount ? promoCode : null,
                discount: promoDiscount?.discountAmount || 0
            }
        });
    };

    const getItemTypeLabel = (itemType) => {
        switch (itemType) {
            case 'course': return 'Course';
            case 'testSeries': return 'Test Series';
            case 'program': return 'Program';
            default: return 'Item';
        }
    };

    const finalAmount = promoDiscount ? promoDiscount.finalAmount : totalAmount;
    const savings = promoDiscount ? promoDiscount.savings : 0;

    if (totalItems === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-16">
                        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Start learning by adding courses, test series, or programs to your cart.</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Cart Items</h2>
                                <button
                                    onClick={handleClearCart}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Clear Cart
                                </button>
                            </div>
                            
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={`${item.itemType}-${item.itemId}`} className="p-6 flex items-start gap-4">
                                        <img
                                            src={item.thumbnail || '/api/placeholder/80/60'}
                                            alt={item.title}
                                            className="w-20 h-15 object-cover rounded-lg"
                                        />
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {getItemTypeLabel(item.itemType)}
                                                    </span>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleRemoveItem(item.itemType, item.itemId)}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                                                {item.originalPrice > item.price && (
                                                    <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            
                            {/* Promo Code Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={promoDiscount}
                                    />
                                    {promoDiscount ? (
                                        <button
                                            onClick={removePromoCode}
                                            className="px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-md"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={validatePromoCode}
                                            disabled={promoLoading}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            {promoLoading ? 'Checking...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                
                                {promoError && (
                                    <p className="text-red-600 text-sm mt-1">{promoError}</p>
                                )}
                                
                                {promoDiscount && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <Tag size={16} />
                                            <span className="font-medium">{promoDiscount.code} Applied!</span>
                                        </div>
                                        <p className="text-green-700 text-sm mt-1">{promoDiscount.description}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{totalAmount}</span>
                                </div>
                                
                                {savings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{savings}</span>
                                    </div>
                                )}
                                
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gray-900">₹{finalAmount}</span>
                                            {savings > 0 && (
                                                <p className="text-sm text-green-600">You save ₹{savings}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </button>
                            
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Secure checkout powered by industry-standard encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;