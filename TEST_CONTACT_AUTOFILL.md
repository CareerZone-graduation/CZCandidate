# Test Contact Form Auto-fill

## Cách test tính năng tự động điền form

### 1. Test với user chưa đăng nhập

**Bước 1:** Đảm bảo bạn chưa đăng nhập (logout nếu cần)

**Bước 2:** Truy cập: `http://localhost:3000/contact`

**Kết quả mong đợi:**
- ✅ Tất cả các trường đều trống
- ✅ Tất cả các trường đều có thể nhập (không bị disable)
- ✅ Không có thông báo màu xanh "Thông tin đã được tự động điền"

**Bước 3:** Nhập đầy đủ thông tin:
- Họ và tên: Nguyễn Văn A
- Email: test@example.com
- Số điện thoại: 0123456789
- Chủ đề: Chọn một option
- Nội dung: Nhập tin nhắn (tối thiểu 10 ký tự)

**Bước 4:** Click "Gửi tin nhắn"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo thành công màu xanh
- ✅ Form được reset về trống
- ✅ Backend tạo support request với `userId: null`

---

### 2. Test với user đã đăng nhập

**Bước 1:** Đăng nhập vào hệ thống
- Truy cập: `http://localhost:3000/auth/login`
- Đăng nhập với tài khoản candidate

**Bước 2:** Kiểm tra Redux store (mở DevTools)
```javascript
// Trong Console, chạy:
window.__REDUX_DEVTOOLS_EXTENSION__ && console.log(store.getState().auth)

// Hoặc dùng Redux DevTools extension
// Kiểm tra state.auth.user có cấu trúc:
{
  user: {
    fullName: "...",
    email: "...",
    phone: "..."
  },
  profile: {
    // ... profile data
  }
}
```

**Bước 3:** Truy cập: `http://localhost:3000/contact`

**Kết quả mong đợi:**
- ✅ Thấy thông báo màu xanh: "Thông tin của bạn đã được tự động điền từ tài khoản"
- ✅ Trường "Họ và tên" đã được điền và bị disable (màu xám)
- ✅ Trường "Email" đã được điền và bị disable (màu xám)
- ✅ Trường "Số điện thoại" đã được điền và bị disable (màu xám)
- ✅ Trường "Chủ đề" vẫn trống và có thể chọn
- ✅ Trường "Nội dung" vẫn trống và có thể nhập

**Bước 4:** Chỉ cần:
- Chọn chủ đề
- Nhập nội dung tin nhắn

**Bước 5:** Click "Gửi tin nhắn"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo thành công
- ✅ Form được reset (chỉ reset category và message, name/email/phone vẫn giữ nguyên)
- ✅ Backend tạo support request với `userId: <user_id>`

---

### 3. Kiểm tra Backend

**Mở MongoDB Compass hoặc mongosh:**

```javascript
// Tìm support request vừa tạo
db.supportrequests.find().sort({ createdAt: -1 }).limit(1).pretty()

// Kiểm tra:
// 1. User chưa đăng nhập:
{
  requester: {
    userId: null,
    name: "Nguyễn Văn A",
    email: "test@example.com",
    phone: "0123456789",
    userType: "candidate"
  }
}

// 2. User đã đăng nhập:
{
  requester: {
    userId: ObjectId("..."), // ← Có userId
    name: "Tên từ database",
    email: "email từ database",
    phone: "phone từ database",
    userType: "candidate"
  }
}
```

---

### 4. Kiểm tra Network Request

**Mở DevTools → Network tab:**

**Request khi chưa đăng nhập:**
```
POST http://localhost:5000/api/contact
Headers:
  Content-Type: application/json
  (Không có Authorization header)

Body:
{
  "name": "Nguyễn Văn A",
  "email": "test@example.com",
  "phone": "0123456789",
  "category": "job_search",
  "message": "Test message",
  "userType": "candidate"
}
```

**Request khi đã đăng nhập:**
```
POST http://localhost:5000/api/contact
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGc... ← Có JWT token

Body:
{
  "category": "job_search",
  "message": "Test message",
  "userType": "candidate"
  // name, email, phone được backend lấy từ req.user
}
```

---

### 5. Debug nếu không hoạt động

**Vấn đề: Form không tự động điền**

1. Kiểm tra Redux store:
```javascript
// Trong ContactPage.jsx, thêm console.log:
useEffect(() => {
  console.log('Auth state:', { isAuthenticated, user });
  if (isAuthenticated && user) {
    const userData = user.user || user;
    const profileData = user.profile || {};
    console.log('User data:', userData);
    console.log('Profile data:', profileData);
    // ...
  }
}, [isAuthenticated, user]);
```

2. Kiểm tra user có đầy đủ thông tin:
- `user.user.fullName` hoặc `user.user.name`
- `user.user.email`
- `user.user.phone` hoặc `user.profile.phone`

3. Nếu thiếu thông tin, cập nhật profile trước:
- Vào trang profile
- Điền đầy đủ thông tin
- Lưu lại
- Quay lại trang contact

**Vấn đề: Backend không nhận userId**

1. Kiểm tra JWT token có được gửi:
```javascript
// Trong contactService.js
export const submitContactForm = async (contactData) => {
  console.log('Submitting with token:', localStorage.getItem('accessToken'));
  const response = await apiClient.post('/contact', contactData);
  return response.data;
};
```

2. Kiểm tra backend logs:
```
📥 Received contact form data: {...}
👤 User from auth: { _id: '...', email: '...', ... }
```

3. Nếu không thấy user, kiểm tra:
- `optionalAuth` middleware có được apply không
- JWT token có hợp lệ không
- Passport JWT strategy có hoạt động không

---

### 6. Expected Behavior Summary

| Trạng thái | Name/Email/Phone | Category/Message | Submit |
|-----------|------------------|------------------|--------|
| Chưa đăng nhập | Trống, editable | Trống, editable | Gửi tất cả fields |
| Đã đăng nhập | Auto-fill, disabled | Trống, editable | Chỉ gửi category + message |

---

### 7. Screenshots để so sánh

**Chưa đăng nhập:**
- Không có thông báo xanh
- Tất cả trường màu trắng
- Tất cả có thể nhập

**Đã đăng nhập:**
- Có thông báo xanh ở đầu form
- Name/Email/Phone màu xám (disabled)
- Name/Email/Phone đã có giá trị
- Category/Message vẫn trắng và editable
