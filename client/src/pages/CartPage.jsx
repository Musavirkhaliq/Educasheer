import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, BookOpen, FileText, Award, GraduationCap } from 'lucide-react';
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
        const browseOptions = [
            {
                title: 'Courses',
                description: 'Comprehensive video courses with expert instructors',
                icon: BookOpen,
                path: '/courses',
                color: 'bg-blue-600 hover:bg-blue-700'
            },
            {
                title: 'Test Series',
                description: 'Practice tests and mock exams to assess your knowledge',
                icon: FileText,
                path: '/test-series',
                color: 'bg-green-600 hover:bg-green-700'
            },
            {
                title: 'Programs',
                description: 'Structured learning programs for career advancement',
                icon: GraduationCap,
                path: '/programs',
                color: 'bg-purple-600 hover:bg-purple-700'
            },
            {
                title: 'Exams',
                description: 'Exam preparation materials and study guides',
                icon: Award,
                path: '/exams',
                color: 'bg-orange-600 hover:bg-orange-700'
            }
        ];

        return (
            <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-8 sm:py-12 lg:py-16">
                        <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4 sm:mb-6 sm:w-16 sm:h-16" />
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6 sm:mb-8 lg:mb-12 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                            Start your learning journey by exploring our comprehensive collection of educational content.
                        </p>

                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
                            {browseOptions.map((option) => {
                                const IconComponent = option.icon;
                                return (
                                    <div
                                        key={option.title}
                                        onClick={() => navigate(option.path)}
                                        className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 cursor-pointer group border border-gray-100 hover:border-gray-200"
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${option.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                                            <IconComponent size={20} className="text-white sm:w-6 sm:h-6" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{option.title}</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 px-1">{option.description}</p>
                                        <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium text-xs sm:text-sm">
                                            Browse {option.title}
                                            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-200 sm:w-4 sm:h-4" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 sm:mt-8 lg:mt-12">
                            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Or explore everything at once</p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="bg-blue-600 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base lg:text-lg font-medium inline-flex items-center gap-2"
                            >
                                <BookOpen size={18} className="sm:w-5 sm:h-5" />
                                Start Learning Today
                                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
                    {/* Cart Items */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Cart Items</h2>
                                <button
                                    onClick={handleClearCart}
                                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={`${item.itemType}-${item.itemId}`} className="p-3 sm:p-4 lg:p-6">
                                        <div className="flex flex-col xs:flex-row items-start gap-3 sm:gap-4">
                                            <div className="w-full xs:w-16 sm:w-20 lg:w-24 flex-shrink-0">
                                                <img
                                                    src={item.thumbnail || '/api/placeholder/80/60'}
                                                    alt={item.title}
                                                    className="w-full h-24 xs:h-12 sm:h-15 lg:h-18 object-cover rounded-lg"
                                                />
                                            </div>

                                            <div className="flex-1 w-full min-w-0">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg leading-tight truncate pr-2">
                                                            {item.title}
                                                        </h3>
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                            {getItemTypeLabel(item.itemType)}
                                                        </span>

                                                        <div className="mt-2 sm:mt-3 flex items-center gap-2">
                                                            <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">₹{item.price}</span>
                                                            {item.originalPrice > item.price && (
                                                                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item.itemType, item.itemId)}
                                                        className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 xl:sticky xl:top-8">
                            <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>

                            {/* Promo Code Section */}
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Promo Code
                                </label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={promoDiscount}
                                    />
                                    <div className="flex gap-2">
                                        {promoDiscount ? (
                                            <button
                                                onClick={removePromoCode}
                                                className="flex-1 px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={validatePromoCode}
                                                disabled={promoLoading}
                                                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                            >
                                                {promoLoading ? 'Checking...' : 'Apply'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {promoError && (
                                    <p className="text-red-600 text-xs sm:text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">{promoError}</p>
                                )}

                                {promoDiscount && (
                                    <div className="mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <Tag size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="font-medium text-xs sm:text-sm">{promoDiscount.code} Applied!</span>
                                        </div>
                                        <p className="text-green-700 text-xs sm:text-sm mt-1">{promoDiscount.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Subtotal</span>
                                    <span className="font-medium text-sm">₹{totalAmount}</span>
                                </div>

                                {savings > 0 && (
                                    <div className="flex justify-between items-center text-green-600">
                                        <span className="text-sm">Discount</span>
                                        <span className="text-sm font-medium">-₹{savings}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base sm:text-lg font-semibold">Total</span>
                                        <div className="text-right">
                                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">₹{finalAmount}</span>
                                            {savings > 0 && (
                                                <p className="text-xs sm:text-sm text-green-600">You save ₹{savings}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base shadow-sm hover:shadow-md"
                            >
                                Proceed to Checkout
                                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 leading-relaxed">
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