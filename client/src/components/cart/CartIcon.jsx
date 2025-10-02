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
            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartIcon;