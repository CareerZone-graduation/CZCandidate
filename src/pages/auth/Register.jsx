import { useState } from "react";
import { Link } from "react-router-dom";
import { register as registerService } from "../../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "candidate"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerService(formData);
      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setFormData({ fullname: "", email: "", password: "", role: "candidate" });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng ký thất bại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Đăng ký</h2>
          <p className="text-gray-600">Tạo tài khoản mới trên CareerZone</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium mb-2">Họ và tên</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Nguyen Van A"
                value={formData.fullname}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
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
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary font-medium hover:text-primary/90">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
