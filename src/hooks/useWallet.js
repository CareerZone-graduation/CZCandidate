import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  getWalletInfo, 
  getTransactionHistory, 
  rechargeWallet, 
  spendCoins, 
  getRechargePackages 
} from '../services/walletService';

/**
 * Custom hook để quản lý wallet functionality
 * @returns {Object} Wallet state và functions
 */
export const useWallet = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // State
  const [walletInfo, setWalletInfo] = useState({
    balance: 0,
    totalSpent: 0,
    totalRecharged: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [rechargePackages, setRechargePackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wallet info
  const fetchWalletInfo = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getWalletInfo();
      
      if (response.success) {
        setWalletInfo(response.data);
      } else {
        throw new Error(response.message || 'Không thể tải thông tin ví');
      }
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setError(err.response?.data?.message || err.message);
      toast.error('Không thể tải thông tin ví');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await getTransactionHistory(params);
      
      if (response.success) {
        setTransactions(response.data.transactions || []);
      } else {
        throw new Error(response.message || 'Không thể tải lịch sử giao dịch');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || err.message);
      toast.error('Không thể tải lịch sử giao dịch');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch recharge packages
  const fetchRechargePackages = useCallback(async () => {
    try {
      const response = await getRechargePackages();
      
      if (response.success) {
        setRechargePackages(response.data || []);
      } else {
        throw new Error(response.message || 'Không thể tải gói nạp xu');
      }
    } catch (err) {
      console.error('Error fetching recharge packages:', err);
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  // Recharge wallet
  const handleRecharge = useCallback(async (rechargeData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để nạp xu');
      return false;
    }

    try {
      setIsRecharging(true);
      setError(null);
      
      const response = await rechargeWallet(rechargeData);
      
      if (response.success) {
        toast.success('Nạp xu thành công!');
        // Refresh wallet info
        await fetchWalletInfo();
        return true;
      } else {
        throw new Error(response.message || 'Nạp xu thất bại');
      }
    } catch (err) {
      console.error('Error recharging wallet:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsRecharging(false);
    }
  }, [isAuthenticated, fetchWalletInfo]);

  // Spend coins
  const handleSpend = useCallback(async (spendData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return false;
    }

    // Check balance
    if (walletInfo.balance < spendData.amount) {
      toast.error('Số xu không đủ. Vui lòng nạp thêm xu.');
      return false;
    }

    try {
      setIsSpending(true);
      setError(null);
      
      const response = await spendCoins(spendData);
      
      if (response.success) {
        toast.success(`Đã tiêu ${spendData.amount} xu thành công!`);
        // Update balance immediately
        setWalletInfo(prev => ({
          ...prev,
          balance: prev.balance - spendData.amount,
          totalSpent: prev.totalSpent + spendData.amount
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể thực hiện giao dịch');
      }
    } catch (err) {
      console.error('Error spending coins:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSpending(false);
    }
  }, [isAuthenticated, walletInfo.balance]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletInfo();
      fetchRechargePackages();
    }
  }, [isAuthenticated, fetchWalletInfo, fetchRechargePackages]);

  return {
    // State
    walletInfo,
    transactions,
    rechargePackages,
    isLoading,
    isRecharging,
    isSpending,
    error,
    
    // Actions
    fetchWalletInfo,
    fetchTransactions,
    fetchRechargePackages,
    handleRecharge,
    handleSpend,
    
    // Computed
    hasEnoughBalance: (amount) => walletInfo.balance >= amount,
    formatBalance: (amount = walletInfo.balance) => amount.toLocaleString('vi-VN'),
  };
};

export default useWallet;