import { useState } from 'react';
import { toast } from 'sonner';
import { createPaymentOrder } from '../services/paymentService';

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async (values) => {
        setIsProcessing(true);
        try {
            const response = await createPaymentOrder(values);
            console.log('Payment Response:', response);
            
            // Extract payment URL from different response structures
            let paymentUrl = null;
            
            if (response?.success && response?.data) {
                // VNPay: { success: true, data: { paymentUrl: "..." } }
                if (response.data.paymentUrl) {
                    paymentUrl = response.data.paymentUrl;
                }
                // Momo: { success: true, data: "https://..." } (string)
                else if (typeof response.data === 'string' && response.data.startsWith('http')) {
                    paymentUrl = response.data;
                }
                // ZaloPay: { success: true, data: { order_url: "..." } }
                else if (response.data.order_url) {
                    paymentUrl = response.data.order_url;
                }
            }
            
            if (paymentUrl) {
                console.log('Redirecting to payment gateway:', paymentUrl);
                window.location.href = paymentUrl;
            } else {
                console.error('No payment URL found in response:', response);
                toast.error(response?.message || 'Failed to create payment order. Please try again.');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred during payment.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return { isProcessing, handlePayment };
};