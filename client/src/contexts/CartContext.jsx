import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return {
                ...state,
                items: action.payload.items || [],
                totalAmount: action.payload.totalAmount || 0,
                totalItems: action.payload.totalItems || 0,
                loading: false
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'ADD_ITEM':
            return {
                ...state,
                items: [...state.items, action.payload],
                totalItems: state.totalItems + 1,
                totalAmount: state.totalAmount + action.payload.price
            };
        case 'REMOVE_ITEM':
            const filteredItems = state.items.filter(
                item => !(item.itemId === action.payload.itemId && item.itemType === action.payload.itemType)
            );
            const removedItem = state.items.find(
                item => item.itemId === action.payload.itemId && item.itemType === action.payload.itemType
            );
            return {
                ...state,
                items: filteredItems,
                totalItems: state.totalItems - 1,
                totalAmount: state.totalAmount - (removedItem?.price || 0)
            };
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                totalAmount: 0,
                totalItems: 0
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
};

const initialState = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    loading: false,
    error: null
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Get cart data
    const fetchCart = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                dispatch({ type: 'SET_CART', payload: { items: [], totalAmount: 0, totalItems: 0 } });
                return;
            }

            const response = await axios.get('/api/v1/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                dispatch({ type: 'SET_CART', payload: response.data.data });
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch cart' });
        }
    }, []); // Empty dependency array since we don't depend on any props or state

    // Add item to cart
    const addToCart = async (itemType, itemId) => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                throw new Error('Please login to add items to cart');
            }

            const response = await axios.post('/api/v1/cart/add', {
                itemType,
                itemId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                dispatch({ type: 'SET_CART', payload: response.data.data });
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item to cart';
            dispatch({ type: 'SET_ERROR', payload: message });
            return { success: false, message };
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemType, itemId) => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                throw new Error('Please login to manage cart');
            }

            const response = await axios.post('/api/v1/cart/remove', {
                itemType,
                itemId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                dispatch({ type: 'SET_CART', payload: response.data.data });
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item from cart';
            dispatch({ type: 'SET_ERROR', payload: message });
            return { success: false, message };
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                throw new Error('Please login to manage cart');
            }

            const response = await axios.post('/api/v1/cart/clear', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                dispatch({ type: 'CLEAR_CART' });
                return { success: true, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear cart';
            dispatch({ type: 'SET_ERROR', payload: message });
            return { success: false, message };
        }
    };

    // Check if item is in cart
    const isInCart = (itemType, itemId) => {
        return state.items.some(item => item.itemType === itemType && item.itemId === itemId);
    };

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, []);

    const value = {
        ...state,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};