# 🚀 Quick Start - Xem Preview Onboarding Mới

## Cách 1: Xem Preview (Không cần đăng nhập)

1. **Chạy dev server:**
```bash
cd fe
npm run dev
```

2. **Truy cập URL:**
```
http://localhost:5173/onboarding-preview
```

Bạn sẽ thấy giao diện onboarding mới với:
- ✅ Modal trung tâm màn hình
- ✅ Backdrop làm mờ
- ✅ Animated background
- ✅ Smooth animations
- ✅ Interactive buttons

## Cách 2: Xem Onboarding thật (Cần đăng nhập)

1. **Đăng nhập vào ứng dụng**

2. **Truy cập:**
```
http://localhost:5173/onboarding
```

Hoặc tạo tài khoản mới - onboarding sẽ tự động hiển thị.

## 🎯 Tính năng để test

### Preview Page
- [ ] Click "Tiếp tục" để chuyển step
- [ ] Click "Quay lại" để về step trước
- [ ] Click "Bỏ qua bước này" (không có effect trong preview)
- [ ] Click nút X để đóng (không có effect trong preview)
- [ ] Scroll content area
- [ ] Resize window để test responsive

### Real Onboarding
- [ ] Điền form và submit
- [ ] Validation errors
- [ ] Skip step confirmation
- [ ] Skip all confirmation
- [ ] Progress save
- [ ] Complete onboarding

## 📱 Test Responsive

### Desktop
```
Resize browser > 1024px
```

### Tablet
```
Resize browser 768px - 1024px
```

### Mobile
```
Resize browser < 768px
hoặc mở DevTools > Toggle device toolbar
```

## 🎨 Customization Test

### Thay đổi màu primary
Trong `fe/tailwind.config.js`:
```js
primary: {
  DEFAULT: 'hsl(221.2 83.2% 53.3%)', // Thay đổi giá trị này
}
```

### Thay đổi kích thước modal
Trong `fe/src/components/onboarding/OnboardingWrapper.jsx`:
```jsx
// Tìm dòng này và thay đổi max-w-4xl
<div className="relative w-full max-w-4xl max-h-[90vh]">
```

Options:
- `max-w-3xl` - Nhỏ hơn (768px)
- `max-w-4xl` - Mặc định (896px)
- `max-w-5xl` - Lớn hơn (1024px)
- `max-w-6xl` - Rất lớn (1152px)

### Tắt background animation
Trong `fe/src/components/onboarding/OnboardingWrapper.jsx`:
```jsx
// Comment dòng này:
{/* <OnboardingBackground /> */}
```

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Kill process trên port 5173
npx kill-port 5173

# Hoặc chạy trên port khác
npm run dev -- --port 3000
```

### Module not found
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind classes không hoạt động
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### Backdrop blur không hoạt động
- Kiểm tra browser support
- Safari cần `-webkit-backdrop-filter`
- Đã được handle trong code

## 📸 Screenshots

Sau khi test, bạn có thể chụp screenshots:

1. **Full modal view**
2. **Step 1 - Thông tin cơ bản**
3. **Step 2 - Kỹ năng & Kinh nghiệm**
4. **Step 3 - Mức lương & Điều kiện**
5. **Mobile view**
6. **Skip confirmation modal**

## ✅ Checklist hoàn thành

- [ ] Preview page hoạt động
- [ ] Real onboarding hoạt động
- [ ] Responsive trên mobile
- [ ] Animations mượt mà
- [ ] Form validation hoạt động
- [ ] Skip confirmation hoạt động
- [ ] Loading states hiển thị đúng
- [ ] Error handling hoạt động

## 🎉 Next Steps

Sau khi test xong:

1. **Nếu OK:**
   - Xóa file preview: `OnboardingPreview.jsx`
   - Xóa route preview trong `AppRouter.jsx`
   - Commit changes
   - Deploy

2. **Nếu cần điều chỉnh:**
   - Xem `ONBOARDING_REDESIGN.md` để customize
   - Xem `fe/src/components/onboarding/README.md` để hiểu chi tiết
   - Adjust và test lại

## 📞 Support

Nếu có vấn đề:
1. Check console errors (F12)
2. Check network tab
3. Check file imports
4. Restart dev server

---

**Happy Testing! 🚀**
