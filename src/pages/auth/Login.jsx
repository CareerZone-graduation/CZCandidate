import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { loginSuccess, fetchUser } from '../../redux/authSlice';
import * as authService from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      const loginData = await authService.login({ email, password });
      if (loginData && loginData.data.accessToken) {
        dispatch(loginSuccess({ accessToken: loginData.data.accessToken }));
        await dispatch(fetchUser());
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard', { replace: true });
      } else {  
        throw new Error('Phản hồi đăng nhập không hợp lệ.');
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, dispatch, navigate]);

  // Nút quay về trang chủ
  const handleBackHome = () => {
    navigate("/"); // chuyển về trang chủ
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Đăng nhập</h2>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Nút quay về trang chủ */}
          <button
            onClick={handleBackHome}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            Quay về trang chủ
          </button>

          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary font-medium hover:text-primary/90">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
