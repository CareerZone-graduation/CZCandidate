import apiClient from './apiClient';

/**
 * Lấy thông tin ví của user
 */
export const getWalletInfo = async () => {
  try {
    const response = await apiClient.get('/wallet');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử giao dịch
 * @param {Object} params - Tham số query (page, limit, type)
 */
export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/wallet/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

/**
 * Nạp xu vào ví
 * @param {Object} rechargeData - Dữ liệu nạp xu (amount, paymentMethod)
 */
export const rechargeWallet = async (rechargeData) => {
  try {
    const response = await apiClient.post('/wallet/recharge', rechargeData);
    return response.data;
  } catch (error) {
    console.error('Error recharging wallet:', error);
    throw error;
  }
};

/**
 * Chi tiêu xu (xem số ứng viên, mở khóa tính năng, etc.)
 * @param {Object} spendData - Dữ liệu chi tiêu (amount, purpose, targetId)
 */
export const spendCoins = async (spendData) => {
  try {
    const response = await apiClient.post('/wallet/spend', spendData);
    return response.data;
  } catch (error) {
    console.error('Error spending coins:', error);
    throw error;
  }
};

/**
 * Lấy các gói nạp xu có sẵn
 */
export const getRechargePackages = async () => {
  try {
    const response = await apiClient.get('/wallet/packages');
    return response.data;
  } catch (error) {
    console.error('Error fetching recharge packages:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử nạp xu
 * @param {Object} params - Tham số query (page, limit)
 */
export const getRechargeHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/users/me/recharge-history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recharge history:', error);
    throw error;
  }
};