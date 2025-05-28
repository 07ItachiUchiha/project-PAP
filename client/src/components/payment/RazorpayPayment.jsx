import React, { useState } from 'react';
import axios from 'axios';
import './RazorpayPayment.css';

const RazorpayPayment = ({ amount, orderId, customerName, customerEmail, onSuccess, onFailure }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
                setError('Failed to load Razorpay SDK');
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Razorpay SDK failed to load');
            }            // Create order on your backend
            const response = await axios.post('/api/payment/create-order', {
                amount,
                orderId,
            });

            const { data } = response;            // Configure Razorpay options
            const options = {
                key: data.keyId, // Use the key from backend response
                amount: data.amount, // Amount in paisa from backend
                currency: data.currency,
                name: 'Plant Ecommerce',
                description: `Payment for Order #${orderId}`,
                order_id: data.orderId,
                handler: function (response) {
                    // Handle successful payment
                    const paymentData = {
                        orderCreationId: data.orderId,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                    };
                    
                    // Verify payment on your backend
                    verifyPayment(paymentData);
                },
                prefill: {
                    name: customerName || '',
                    email: customerEmail || '',
                },
                theme: {
                    color: '#3399cc',
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            
            razorpay.on('payment.failed', function (response) {
                setError(`Payment failed: ${response.error.description}`);
                if (onFailure) onFailure(response.error);
            });
            
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || 'Something went wrong');
            if (onFailure) onFailure(error);
        } finally {
            setLoading(false);
        }
    };    const verifyPayment = async (paymentData) => {
        try {
            const response = await axios.post('/api/payment/verify-payment', {
                razorpay_order_id: paymentData.razorpayOrderId,
                razorpay_payment_id: paymentData.razorpayPaymentId,
                razorpay_signature: paymentData.razorpaySignature,
                orderId: orderId
            });
            if (response.data.success) {
                if (onSuccess) onSuccess(response.data);
            } else {
                setError('Payment verification failed');
                if (onFailure) onFailure(new Error('Payment verification failed'));
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('Payment verification failed');
            if (onFailure) onFailure(error);
        }
    };    return (
        <div className="razorpay-payment-container">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <button 
                onClick={handlePayment} 
                disabled={loading}
                className="razorpay-payment-button"
            >
                {loading ? 'Processing...' : `Pay ₹${amount}`}
            </button>
        </div>
    );
};

export default RazorpayPayment;