# CareerZone - Ứng Dụng Dành Cho Ứng Viên

Ứng dụng web dành cho người tìm việc trên nền tảng CareerZone, được xây dựng với React, Vite và các thư viện UI hiện đại.

## 📋 Tổng Quan

CareerZone Candidate là giao diện chính dành cho ứng viên tìm việc. Ứng dụng cung cấp trải nghiệm tìm kiếm việc làm toàn diện với các công cụ hỗ trợ như xây dựng CV và theo dõi đơn ứng tuyển.

## 🚀 Tính Năng

### Tìm Kiếm Việc Làm
- Tìm kiếm nâng cao với nhiều bộ lọc (ngành nghề, mức lương, kinh nghiệm)
- Tìm kiếm theo vị trí địa lý với bản đồ tương tác
- Gợi ý việc làm phù hợp dựa trên hồ sơ
- Lưu việc làm yêu thích
- Đăng ký nhận thông báo việc làm mới

### Xây Dựng CV (CV Builder)
- Tạo CV chuyên nghiệp với nhiều mẫu đẹp
- Chỉnh sửa trực quan (drag & drop)
- Xuất CV sang PDF
- Quản lý nhiều phiên bản CV

### Quản Lý Hồ Sơ
- Thông tin cá nhân đầy đủ
- Kỹ năng và chứng chỉ
- Kinh nghiệm làm việc
- Học vấn và đào tạo
- Portfolio và dự án


### Theo Dõi Ứng Tuyển
- Xem trạng thái đơn ứng tuyển
- Lịch sử ứng tuyển
- Thông báo cập nhật trạng thái
- Chat với nhà tuyển dụng

### Thông Báo Real-time
- Thông báo việc làm mới phù hợp
- Cập nhật trạng thái ứng tuyển
- Lời mời phỏng vấn
- Tin nhắn từ nhà tuyển dụng

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React v19.1 |
| Build Tool | Vite v7.1 + SWC |
| State Management | Redux Toolkit, TanStack Query |
| Styling | Tailwind CSS v4.1 |
| UI Components | Radix UI, Framer Motion |
| Forms | React Hook Form + Zod |
| Maps | Leaflet, React Leaflet Cluster |
| HTTP Client | Axios |
| Icons | Lucide React |
| Charts | Recharts |
| Date | date-fns |

## 📁 Cấu Trúc Dự Án

```
fe/
├── src/
│   ├── assets/           # Hình ảnh, icons tĩnh
│   ├── components/       # React components
│   │   ├── background/   # Hiệu ứng nền
│   │   ├── billing/      # Thanh toán
│   │   ├── buildCV/      # Xây dựng CV
│   │   ├── common/       # Components dùng chung
│   │   ├── CVPreview/    # Xem trước CV
│   │   ├── forms/        # Form components
│   │   ├── jobs/         # Tìm kiếm việc làm
│   │   ├── layout/       # Header, Footer, Sidebar
│   │   ├── profile/      # Hồ sơ người dùng
│   │   ├── sections/     # Các section trang
│   │   └── ui/           # Base UI (Radix wrappers)
│   ├── constants/        # Enum và hằng số
│   ├── contexts/         # React Context providers
│   ├── data/             # Dữ liệu tĩnh, mock data
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Thư viện tiện ích
│   ├── pages/            # Các trang (route targets)
│   │   ├── auth/         # Đăng nhập, đăng ký
│   │   ├── billing/      # Thanh toán
│   │   ├── company/      # Trang công ty
│   │   ├── cv/           # Quản lý CV
│   │   ├── dashboard/    # Dashboard
│   │   ├── jobs/         # Trang việc làm
│   │   ├── notification/ # Thông báo
│   │   └── profile/      # Hồ sơ
│   ├── redux/            # Redux store và slices
│   ├── routes/           # Cấu hình React Router
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # API client và services
│   ├── styles/           # CSS và animations
│   ├── utils/            # Hàm tiện ích
│   ├── App.jsx           # Component chính
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static files
└── index.html            # HTML entry
```

## 🚦 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js**: v18 trở lên
- **pnpm**: Package manager (khuyến nghị)

### Các Bước Cài Đặt

1. **Di chuyển vào thư mục frontend**:
   ```bash
   cd fe
   ```

2. **Cài đặt dependencies**:
   ```bash
   pnpm install
   ```

3. **Cấu hình môi trường**:
   ```bash
   copy .env.example .env
   ```
   
   Cập nhật các biến môi trường:
   ```env
   VITE_API_BASE_URL=
   VITE_RECRUITER_FE_URL=
   VITE_GOONG_MAPS_API_KEY=
   VITE_GOOGLE_CLIENT_ID=
   VITE_TURNSTILE_SITE_KEY=
   ```

4. **Chạy development server**:
   ```bash
   pnpm run dev
   ```
   
   Ứng dụng sẽ mở tại `http://localhost:3000`

## 📦 Build Production

Tạo bản build tối ưu cho production:

```bash
pnpm run build
```

Output sẽ nằm trong thư mục `dist`.

Preview bản build:

```bash
pnpm run preview
```

## 📚 Scripts Có Sẵn

| Script | Mô tả |
|--------|-------|
| `pnpm run dev` | Chạy development server |
| `pnpm run build` | Build cho production |
| `pnpm run preview` | Preview bản build |
| `pnpm run lint` | Kiểm tra linting |

## 🎨 UI Components

Dự án sử dụng các component từ Radix UI được customize với Tailwind CSS:

- **Button**: Các loại button với nhiều variant
- **Input**: Text input, textarea, select
- **Card**: Container hiển thị thông tin
- **Dialog**: Modal và popup
- **Dropdown**: Menu dropdown
- **Tabs**: Tab navigation
- **Toast**: Thông báo
- **Tooltip**: Tooltip hướng dẫn

## 🔧 State Management

### Redux Toolkit
- **authSlice**: Trạng thái xác thực người dùng
- **profileSlice**: Thông tin hồ sơ
- **cvSlice**: Dữ liệu CV builder

### TanStack Query
- Cache và đồng bộ dữ liệu từ server
- Tự động refetch khi cần
- Optimistic updates

## 🤝 Đóng Góp

### Quy Trình Đóng Góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mô tả tính năng"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho CareerZone Platform.
