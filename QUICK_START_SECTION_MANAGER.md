# 🚀 Quick Start - Section Order Manager

## ✅ Đã tích hợp xong!

Section Order Manager đã được tích hợp vào CVBuilder. Bạn có thể sử dụng ngay!

## 📍 Vị trí trong ứng dụng

1. Mở trang **CV Builder** (`/editor` hoặc `/editor/:cvId`)
2. Tìm tab **"Bố cục & Thứ tự"** (icon Settings ⚙️) trong sidebar
3. Click vào tab đó để mở Section Order Manager

## 🎯 Tính năng có sẵn

### 1. **Sắp xếp lại sections**
- ✅ Kéo thả (Drag & Drop) sections
- ✅ Nút mũi tên lên/xuống
- ✅ Hoạt động độc lập cho template 2 cột

### 2. **Ẩn/hiện sections**
- ✅ Click icon mắt (👁️) để ẩn/hiện
- ✅ Sections ẩn không xuất hiện trong CV
- ✅ Hiển thị danh sách sections đang ẩn

### 3. **Template 2 cột**
- ✅ Tự động phân chia Sidebar vs Main Content
- ✅ Reorder riêng biệt trong mỗi cột
- ✅ Thông báo khi dùng template 2 cột

### 4. **Preview real-time**
- ✅ Xem thứ tự sections hiện tại
- ✅ Hiển thị sections visible/hidden
- ✅ Preview layout cho template 2 cột

## 🧪 Test ngay

### Bước 1: Chạy ứng dụng
```bash
cd CareerZone-Candidate-FE
npm run dev
```

### Bước 2: Mở CV Builder
- Truy cập: `http://localhost:5173/editor`
- Hoặc: `http://localhost:5173/editor/new`

### Bước 3: Test các tính năng

#### Test 1: Sắp xếp lại sections
1. Click tab "Bố cục & Thứ tự"
2. Kéo thả một section (ví dụ: Skills) lên trên
3. Hoặc dùng nút mũi tên ↑↓
4. Click "Xem Preview" để thấy thay đổi

#### Test 2: Ẩn/hiện sections
1. Click icon mắt 👁️ bên cạnh section "Projects"
2. Section sẽ chuyển sang trạng thái mờ
3. Click "Xem Preview" - section "Projects" không còn trong CV

#### Test 3: Template 2 cột
1. Click tab "Mẫu CV"
2. Chọn template "Two Column Sidebar" hoặc "Creative Split"
3. Quay lại tab "Bố cục & Thứ tự"
4. Thấy sections được chia thành 2 cột: Sidebar và Main Content
5. Thử di chuyển sections trong mỗi cột

#### Test 4: Reset về default
1. Sau khi thay đổi nhiều
2. Click nút "Reset to Default"
3. Tất cả về trạng thái ban đầu

## 📊 Dữ liệu được lưu

Khi bạn click "Lưu CV", các thông tin sau được lưu:

```javascript
{
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
  hiddenSections: ['projects'], // Ví dụ: đã ẩn section projects
  template: 'modern-blue'
}
```

## 🎨 Templates hỗ trợ 2 cột

### Two Column Sidebar
- **Sidebar**: Skills, Education
- **Main**: Summary, Experience, Projects, Certificates

### Creative Split
- **Sidebar**: Skills, Education, Certificates
- **Main**: Summary, Experience, Projects

## 💡 Tips sử dụng

### Tip 1: Tối ưu cho ATS (Applicant Tracking System)
Thứ tự tốt nhất:
1. Summary
2. Experience
3. Education
4. Skills
5. Certificates
6. Projects

### Tip 2: CV cho sinh viên mới ra trường
Thứ tự nên là:
1. Summary
2. Education (đưa lên trước)
3. Skills
4. Projects (quan trọng nếu chưa có kinh nghiệm)
5. Experience
6. Certificates

### Tip 3: CV cho Developer
Thứ tự nên là:
1. Summary
2. Skills (đưa lên trước để highlight)
3. Experience
4. Projects (quan trọng)
5. Education
6. Certificates

### Tip 4: CV ngắn gọn (1 trang)
Ẩn các sections không cần thiết:
- Ẩn "Projects" nếu đã có nhiều Experience
- Ẩn "Certificates" nếu không có chứng chỉ quan trọng
- Giữ lại: Summary, Experience, Education, Skills

## 🐛 Troubleshooting

### Vấn đề 1: Không thấy tab "Bố cục & Thứ tự"
**Giải pháp**: 
- Đảm bảo đã import `ImprovedSectionOrderManager` trong CVBuilder.jsx
- Kiểm tra console có lỗi không

### Vấn đề 2: Sections không di chuyển được
**Giải pháp**:
- Nếu dùng template 2 cột, sections chỉ di chuyển trong cột của nó
- Kiểm tra section có bị ẩn không (sections ẩn không thể drag)

### Vấn đề 3: Thay đổi không được lưu
**Giải pháp**:
- Nhớ click nút "Lưu CV" sau khi thay đổi
- Kiểm tra đã đăng nhập chưa (cần đăng nhập để lưu)

### Vấn đề 4: Preview không cập nhật
**Giải pháp**:
- Click nút "Xem Preview" để refresh
- Hoặc tắt/bật preview lại

## 📱 Responsive

Section Order Manager hoạt động tốt trên:
- ✅ Desktop (tốt nhất)
- ✅ Tablet (khá tốt)
- ⚠️ Mobile (có thể hơi khó drag & drop, dùng nút mũi tên thay thế)

## 🔄 Workflow đề xuất

### Workflow 1: Tạo CV mới
1. Chọn template
2. Điền thông tin cá nhân
3. Thêm Experience, Education, Skills
4. **Sắp xếp lại sections** (tab Bố cục)
5. Ẩn sections không cần
6. Preview và điều chỉnh
7. Lưu CV
8. Export PDF

### Workflow 2: Chỉnh sửa CV có sẵn
1. Load CV
2. Cập nhật nội dung
3. **Điều chỉnh layout** nếu cần
4. Preview
5. Lưu
6. Export PDF

## 🎓 Video hướng dẫn (TODO)

_Sẽ có video demo sau_

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log
2. Xem file `SECTION_MANAGER_GUIDE.md` để biết chi tiết
3. Xem file `README_SECTION_MANAGER.md` để biết API

## ✨ Tính năng sắp tới

- [ ] Keyboard shortcuts (Ctrl+↑/↓ để di chuyển)
- [ ] Undo/Redo
- [ ] Templates tùy chỉnh
- [ ] Lưu layout presets
- [ ] Gợi ý layout theo ngành nghề

---

**Chúc bạn tạo CV thành công! 🎉**
