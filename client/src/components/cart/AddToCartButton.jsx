import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const AddToCartButton = ({ itemType, itemId, className = '', size = 'md' }) => {
    const { addToCart, removeFromCart, isInCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const inCart = isInCart(itemType, itemId);

    const handleClick = async () => {
        // If item is in cart, navigate to checkout
        if (inCart) {
            navigate('/checkout');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await addToCart(itemType, itemId);

            if (result.success) {
                setMessage(result.message);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message);
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            setMessage('Something went wrong');
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
        md: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
        lg: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg'
    };

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 20
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={loading}
                className={`
                    ${sizeClasses[size]}
                    ${inCart 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                    ${loading ? 'opacity-75 cursor-not-allowed' : ''}
                    rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                    ${className}
                `}
            >
                {loading ? (
                    <Loader2 size={iconSizes[size]} className="animate-spin" />
                ) : inCart ? (
                    <ArrowRight size={iconSizes[size]} />
                ) : (
                    <ShoppingCart size={iconSizes[size]} />
                )}
                {loading ? 'Processing...' : inCart ? 'Checkout' : 'Add to Cart'}
            </button>
            
            {message && (
                <div className={`
                    absolute top-full left-0 mt-2 p-2 rounded-md text-xs sm:text-sm z-10 whitespace-nowrap max-w-xs
                    ${message.includes('success') || message.includes('added') || message.includes('removed')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }
                `}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AddToCartButton;