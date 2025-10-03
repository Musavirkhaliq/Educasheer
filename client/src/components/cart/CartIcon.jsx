import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
    const { totalItems } = useCart();
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/cart')}
            className="relative p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
            {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartIcon;