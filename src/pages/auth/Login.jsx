import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { login as loginService } from "../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginService({ email, password });
      const userData = response.data;
      const accessToken = response.data.accessToken;

      if (!userData) {
        setError("Đăng nhập thất bại: user không tồn tại");
        return;
      }

      const successLogin = login(userData, accessToken);
      if (!successLogin) {
        setError("Chỉ ứng viên mới được đăng nhập");
        return;
      }

      navigate("/dashboard"); // Chuyển đến trang chính candidate
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

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
