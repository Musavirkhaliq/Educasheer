import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const AddToCartButton = ({ itemType, itemId, className = '', size = 'md' }) => {
    const { addToCart, removeFromCart, isInCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const inCart = isInCart(itemType, itemId);

    const handleClick = async () => {
        setLoading(true);
        setMessage('');

        try {
            let result;
            if (inCart) {
                result = await removeFromCart(itemType, itemId);
            } else {
                result = await addToCart(itemType, itemId);
            }

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
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={loading}
                className={`
                    ${sizeClasses[size]}
                    ${inCart 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
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
                    <Check size={iconSizes[size]} />
                ) : (
                    <ShoppingCart size={iconSizes[size]} />
                )}
                {loading ? 'Processing...' : inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            
            {message && (
                <div className={`
                    absolute top-full left-0 mt-2 p-2 rounded-md text-sm z-10 whitespace-nowrap
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