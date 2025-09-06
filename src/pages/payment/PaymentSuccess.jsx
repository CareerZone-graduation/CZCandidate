import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { updateCoinBalance } from '../../redux/authSlice';
import { getMyCoinBalance } from '../../services/profileService';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchCoinBalance = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const response = await getMyCoinBalance();
        if (response.success && response.data?.coins !== undefined) {
          dispatch(updateCoinBalance(response.data.coins));
          toast.success("Nạp xu thành công! Số dư đã được cập nhật.");
        } else {
          toast.error(response.message || "Không thể cập nhật số dư.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lấy số dư xu.");
      }
    };

    fetchCoinBalance();
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4">Thanh toán thành công!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Giao dịch nạp xu của bạn đã được hoàn tất. Số dư đã được cập nhật vào tài khoản của bạn.
          </p>
          <Button asChild>
            <Link to="/dashboard">Về trang tổng quan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;