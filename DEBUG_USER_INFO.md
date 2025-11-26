# Debug User Info trong Contact Form

## Cách kiểm tra thông tin user

### Bước 1: Mở DevTools Console

Khi bạn đang ở trang Contact (`http://localhost:3000/contact`), mở Console (F12)

### Bước 2: Chạy lệnh này để xem Redux state

```javascript
// Xem toàn bộ auth state
console.log('Auth State:', window.__REDUX_DEVTOOLS_EXTENSION__ ? 
  window.store.getState().auth : 
  'Redux DevTools not available'
);
```

### Bước 3: Hoặc thêm console.log vào code

Mở file `fe-candidate/src/pages/contact/ContactPage.jsx` và thêm:

```javascript
useEffect(() => {
  console.log('=== DEBUG USER INFO ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user object:', user);
  
  if (isAuthenticated && user) {
    const userData = user.user || user;
    const profileData = user.profile || {};
    
    console.log('userData:', userData);
    console.log('profileData:', profileData);
    console.log('fullName:', userData.fullName);
    console.log('name:', userData.name);
    console.log('email:', userData.email);
    console.log('phone:', userData.phone);
    console.log('phoneNumber:', userData.phoneNumber);
    console.log('profile.fullName:', profileData.fullName);
    console.log('profile.phone:', profileData.phone);
    
    setFormData((prev) => ({
      ...prev,
      name: userData.fullName || userData.name || profileData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || userData.phoneNumber || profileData.phone || '',
    }));
  }
}, [isAuthenticated, user]);
```

### Bước 4: Reload trang và xem Console

Bạn sẽ thấy output như:
```
=== DEBUG USER INFO ===
isAuthenticated: true
user object: { user: {...}, profile: {...} }
userData: { _id: '...', email: 'c1@gmail.com', ... }
profileData: { fullName: 'Liên Huệ Tiên', ... }
fullName: undefined
name: undefined
email: 'c1@gmail.com'
phone: undefined
phoneNumber: '+84987654321'
profile.fullName: 'Liên Huệ Tiên'  ← Tên có thể ở đây!
profile.phone: undefined
```

### Bước 5: Cập nhật code dựa trên kết quả

Nếu tên nằm trong `profile.fullName`, code hiện tại đã xử lý đúng rồi:
```javascript
name: userData.fullName || userData.name || profileData.fullName || ''
```

Nhưng nếu vẫn không hiển thị, có thể do:
1. Profile chưa được load
2. Tên lưu ở field khác (firstName + lastName?)
3. Cần fetch profile riêng

### Bước 6: Kiểm tra API response

Xem API `/api/auth/me` trả về gì:

```javascript
// Trong Console
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(data => console.log('User API response:', data));
```

### Các trường hợp có thể xảy ra:

**Case 1: Tên trong user.user**
```javascript
{
  user: {
    fullName: "Liên Huệ Tiên",
    email: "c1@gmail.com"
  }
}
```

**Case 2: Tên trong user.profile**
```javascript
{
  user: { email: "c1@gmail.com" },
  profile: {
    fullName: "Liên Huệ Tiên"
  }
}
```

**Case 3: Tên tách ra firstName + lastName**
```javascript
{
  user: {
    firstName: "Liên Huệ",
    lastName: "Tiên"
  }
}
```

**Case 4: Tên trong nested object**
```javascript
{
  user: {
    candidateProfile: {
      fullName: "Liên Huệ Tiên"
    }
  }
}
```

### Giải pháp tùy theo case:

Sau khi biết tên nằm ở đâu, cập nhật code:

```javascript
// Case 1 & 2: Code hiện tại đã OK
name: userData.fullName || userData.name || profileData.fullName || ''

// Case 3: Cần combine firstName + lastName
name: userData.fullName || 
      (userData.firstName && userData.lastName ? 
        `${userData.firstName} ${userData.lastName}` : '') ||
      profileData.fullName || ''

// Case 4: Cần access nested object
name: userData.fullName || 
      userData.candidateProfile?.fullName ||
      profileData.fullName || ''
```

---

## Quick Fix

Nếu bạn muốn test nhanh, thêm vào useEffect:

```javascript
useEffect(() => {
  if (isAuthenticated && user) {
    const userData = user.user || user;
    const profileData = user.profile || {};
    
    // Try all possible name fields
    const possibleNames = [
      userData.fullName,
      userData.name,
      profileData.fullName,
      profileData.name,
      userData.candidateProfile?.fullName,
      (userData.firstName && userData.lastName) ? 
        `${userData.firstName} ${userData.lastName}` : null,
      'Liên Huệ Tiên' // Fallback for testing
    ];
    
    const name = possibleNames.find(n => n) || '';
    
    console.log('Selected name:', name);
    
    setFormData((prev) => ({
      ...prev,
      name,
      email: userData.email || '',
      phone: userData.phone || userData.phoneNumber || profileData.phone || '',
    }));
  }
}, [isAuthenticated, user]);
```
