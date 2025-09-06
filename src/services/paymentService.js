import apiClient from './apiClient';

/**
 * Creates a new payment order to recharge coins.
 * @param {object} orderData - The data for the payment order.
 * @param {number} orderData.coins - The number of coins to purchase.
 * @param {string} orderData.paymentMethod - The payment method (e.g., 'ZALOPAY').
 * @returns {Promise<object>} The response from the server, containing the payment URL.
 */
export const createPaymentOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/payments/create-order', orderData);
    return response.data; // Trả về response.data để hook xử lý
  } catch (error) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Queries the result of a payment transaction from the server.
 * @param {string} queryString - The query string from the payment gateway's return URL.
 * @returns {Promise<object>} The response from the server, containing the new coin balance.
 */
export const getPaymentResult = async (queryString) => {
  try {
    const response = await apiClient.get(`/payments/vnpay_return?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error querying payment result:', error.response?.data || error.message);
    throw error;
  }
};