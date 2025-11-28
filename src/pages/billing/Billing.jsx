import { useState } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { CreditCard, History, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import RechargeHistory from '../../components/billing/RechargeHistory';

// Helper function
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const coinPackages = [
  { amount: 100, price: 10000, popular: false },
  { amount: 150, price: 15000, popular: false },
  { amount: 200, price: 20000, popular: true },
  { amount: 500, price: 50000, popular: false },
  { amount: 1000, price: 100000, popular: false },
];

const BillingPage = () => {
  const [selectedOption, setSelectedOption] = useState(coinPackages.find(p => p.popular).amount);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ZALOPAY');
  const { isProcessing, handlePayment } = usePayment();

  const getPackageDetails = () => {
    if (selectedOption === 'custom') {
      const amount = parseInt(customAmount, 10);
      if (!isNaN(amount) && amount > 0) {
        return { amount, price: amount * 100 };
      }
      return { amount: 0, price: 0 };
    }
    return coinPackages.find(p => p.amount === selectedOption);
  };

  const selectedPackage = getPackageDetails();
  const finalAmount = selectedPackage?.amount || 0;

  const handleSubmit = () => {
    if (finalAmount > 0) {
      handlePayment({ coins: finalAmount, paymentMethod });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8 bg-muted/30">
      <Card className="w-full max-w-6xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý Xu</CardTitle>
              <CardDescription>Nạp xu và xem lịch sử giao dịch để sử dụng các tính năng cao cấp.</CardDescription>
            </div>
            <Link to="/dashboard/credit-history">
              <Button variant="outline" className="gap-2">
                <Receipt className="h-4 w-4" />
                Lịch sử chi tiết
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="recharge" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recharge" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Nạp Xu
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recharge" className="mt-6">
              {/* Gợi ý tiêu xu */}
              <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  💡 Bạn có thể sử dụng xu để:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span><strong>Xem số lượng ứng viên đã ứng tuyển công việc</strong> - 10 xu/lần xem</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Coin Packages */}
                <div className="md:col-span-2 space-y-4">
                  <Label className="text-lg font-semibold">Chọn gói xu</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {coinPackages.map((pkg) => (
                      <div
                        key={pkg.amount}
                        className={cn(
                          "relative rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-28",
                          selectedOption === pkg.amount ? "border-primary ring-2 ring-primary" : "hover:border-gray-400"
                        )}
                        onClick={() => setSelectedOption(pkg.amount)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold rounded-full">
                            Phổ biến
                          </div>
                        )}
                        <div className="text-2xl font-bold">{pkg.amount} xu</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(pkg.price)}</div>
                      </div>
                    ))}
                    {/* Custom Amount Option */}
                    <div
                      className={cn(
                        "relative rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-28",
                        selectedOption === 'custom' ? "border-primary ring-2 ring-primary" : "hover:border-gray-400"
                      )}
                      onClick={() => setSelectedOption('custom')}
                    >
                      <div className="text-lg font-semibold">Tùy chỉnh</div>
                      <div className="text-sm text-muted-foreground">Nhập số xu</div>
                    </div>
                  </div>
                   {selectedOption === 'custom' && (
                    <div className="pt-4">
                      <Label htmlFor="custom-amount">Nhập số xu bạn muốn nạp</Label>
                      <Input
                         id="custom-amount"
                         type="number"
                         placeholder="Ví dụ: 150"
                         value={customAmount}
                         onChange={(e) => setCustomAmount(e.target.value)}
                         className="mt-2"
                         min="1"
                      />
                    </div>
                  )}

                  {/* Gợi ý sử dụng xu động */}
                  {finalAmount > 0 && (
                    <div className="pt-4 text-center text-sm text-muted-foreground italic border-t mt-4">
                      <p className="mt-3">
                        Với <strong className="text-primary">{finalAmount} xu</strong>, bạn có thể xem được{' '}
                        <strong className="text-primary">{Math.floor(finalAmount / 10)} lần</strong> số lượng ứng viên đã ứng tuyển công việc.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Payment Method & Summary */}
                <div className="md:col-span-1 space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Chọn phương thức thanh toán</Label>
                    <div className="mt-2 flex flex-col gap-4">
                       <label htmlFor="ZALOPAY" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                        <input type="radio" name="paymentMethod" value="ZALOPAY" id="ZALOPAY" checked={paymentMethod === 'ZALOPAY'} onChange={() => setPaymentMethod('ZALOPAY')} />
                         <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="h-8 w-8" />
                         <span>ZaloPay</span>
                       </label>
                       <label htmlFor="VNPAY" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                         <input type="radio" name="paymentMethod" value="VNPAY" id="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                         <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPAY" className="h-8 w-8" />
                         <span>VNPAY</span>
                       </label>
                       <label htmlFor="MOMO" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                         <input type="radio" name="paymentMethod" value="MOMO" id="MOMO" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} />
                         <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" alt="MoMo" className="h-8 w-8" />
                         <span>MoMo</span>
                       </label>
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  <div className="space-y-4">
                      <div className="text-lg font-semibold">Tổng thanh toán</div>
                      <div className="text-3xl font-bold text-primary">
                          {selectedPackage ? formatCurrency(selectedPackage.price) : '0 VNĐ'}
                      </div>
                  </div>

                  {/* Submit Button */}
                  <Button onClick={handleSubmit} disabled={isProcessing || finalAmount <= 0} size="lg" className="w-full">
                      {isProcessing ? 'Đang xử lý...' : `Thanh toán với ${paymentMethod}`}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <RechargeHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;