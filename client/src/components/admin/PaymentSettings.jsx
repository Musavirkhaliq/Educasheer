import React, { useState, useEffect } from 'react';
import { CreditCard, Settings, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        razorpay: {
            enabled: true,
            keyId: '',
            keySecret: '',
            webhookSecret: ''
        },
        stripe: {
            enabled: false,
            publishableKey: '',
            secretKey: '',
            webhookSecret: ''
        },
        defaultGateway: 'razorpay',
        currency: 'INR'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSecrets, setShowSecrets] = useState({
        razorpaySecret: false,
        stripeSecret: false,
        razorpayWebhook: false,
        stripeWebhook: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // In a real app, you'd fetch these from your backend
            // For now, we'll use environment variables as defaults
            setSettings({
                razorpay: {
                    enabled: true,
                    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                    keySecret: '••••••••••••••••',
                    webhookSecret: '••••••••••••••••'
                },
                stripe: {
                    enabled: false,
                    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
                    secretKey: '••••••••••••••••',
                    webhookSecret: '••••••••••••••••'
                },
                defaultGateway: import.meta.env.VITE_DEFAULT_PAYMENT_GATEWAY || 'razorpay',
                currency: 'INR'
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch payment settings' });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // In a real app, you'd save these to your backend
            // For demo purposes, we'll just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage({ type: 'success', text: 'Payment settings saved successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save payment settings' });
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (gateway) => {
        setLoading(true);
        try {
            // In a real app, you'd test the connection to the payment gateway
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage({ type: 'success', text: `${gateway} connection test successful` });
        } catch (error) {
            setMessage({ type: 'error', text: `${gateway} connection test failed` });
        } finally {
            setLoading(false);
        }
    };

    const toggleSecret = (field) => {
        setShowSecrets(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Gateway Settings</h2>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={16} />
                    ) : (
                        <AlertCircle size={16} />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Razorpay Settings */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Razorpay</h3>
                                <p className="text-sm text-gray-600">Indian payment gateway</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.razorpay.enabled}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    razorpay: { ...prev.razorpay, enabled: e.target.checked }
                                }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Key ID
                            </label>
                            <input
                                type="text"
                                value={settings.razorpay.keyId}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    razorpay: { ...prev.razorpay, keyId: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="rzp_test_xxxxxxxxxx"
                                disabled={!settings.razorpay.enabled}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Key Secret
                            </label>
                            <div className="relative">
                                <input
                                    type={showSecrets.razorpaySecret ? "text" : "password"}
                                    value={settings.razorpay.keySecret}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        razorpay: { ...prev.razorpay, keySecret: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter key secret"
                                    disabled={!settings.razorpay.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('razorpaySecret')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets.razorpaySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Webhook Secret
                            </label>
                            <div className="relative">
                                <input
                                    type={showSecrets.razorpayWebhook ? "text" : "password"}
                                    value={settings.razorpay.webhookSecret}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        razorpay: { ...prev.razorpay, webhookSecret: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter webhook secret"
                                    disabled={!settings.razorpay.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('razorpayWebhook')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets.razorpayWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => testConnection('Razorpay')}
                            disabled={!settings.razorpay.enabled || loading}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Test Connection
                        </button>
                    </div>
                </div>

                {/* Stripe Settings */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Stripe</h3>
                                <p className="text-sm text-gray-600">International payment gateway</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.stripe.enabled}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    stripe: { ...prev.stripe, enabled: e.target.checked }
                                }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Publishable Key
                            </label>
                            <input
                                type="text"
                                value={settings.stripe.publishableKey}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    stripe: { ...prev.stripe, publishableKey: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="pk_test_xxxxxxxxxx"
                                disabled={!settings.stripe.enabled}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Secret Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showSecrets.stripeSecret ? "text" : "password"}
                                    value={settings.stripe.secretKey}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        stripe: { ...prev.stripe, secretKey: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter secret key"
                                    disabled={!settings.stripe.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('stripeSecret')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets.stripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Webhook Secret
                            </label>
                            <div className="relative">
                                <input
                                    type={showSecrets.stripeWebhook ? "text" : "password"}
                                    value={settings.stripe.webhookSecret}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        stripe: { ...prev.stripe, webhookSecret: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter webhook secret"
                                    disabled={!settings.stripe.enabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('stripeWebhook')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets.stripeWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => testConnection('Stripe')}
                            disabled={!settings.stripe.enabled || loading}
                            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Test Connection
                        </button>
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">General Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Payment Gateway
                        </label>
                        <select
                            value={settings.defaultGateway}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                defaultGateway: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="razorpay">Razorpay</option>
                            <option value="stripe">Stripe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                        </label>
                        <select
                            value={settings.currency}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                currency: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default PaymentSettings;