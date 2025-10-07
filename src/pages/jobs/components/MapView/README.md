# 🗺️ Job Search Map View

## Tổng quan
Tính năng tìm kiếm việc làm dựa trên bản đồ cho phép người dùng tìm kiếm và xem các công việc một cách trực quan trên bản đồ. Đây là một tính năng chuyên nghiệp đặc biệt hữu ích cho các công việc yêu cầu làm việc tại chỗ.

## ✨ Tính năng chính

### 1. **Hai chế độ xem**
- **Xem danh sách**: Hiển thị kết quả tìm kiếm dạng danh sách truyền thống
- **Xem bản đồ**: Hiển thị các công việc dưới dạng markers trên bản đồ tương tác

### 2. **Markers tùy chỉnh**
- **Job Markers**: Markers màu đỏ cam (#FF6B35) hình giọt nước cho các công việc
- **User Marker**: Marker gradient tím với animation pulse cho vị trí người dùng
- **Hover Effects**: Animation bounce khi hover vào markers

### 3. **Popup thông tin chi tiết**
Khi click vào một marker, hiển thị popup với:
- Logo và tên công ty
- Tiêu đề công việc
- Địa điểm làm việc
- Mức lương
- Loại công việc (Full-time, Part-time, etc.)
- Hình thức làm việc (Remote, On-site, Hybrid)
- Kinh nghiệm yêu cầu
- Hạn nộp hồ sơ
- Button "Xem chi tiết"

### 4. **Auto-fit bounds**
Bản đồ tự động zoom và pan để hiển thị tất cả các markers (công việc + vị trí người dùng)

### 5. **Recenter button**
Button floating "Về vị trí của tôi" để nhanh chóng quay về vị trí người dùng

### 6. **Job count indicator**
Card floating hiển thị số lượng công việc đang hiển thị trên bản đồ

## 🏗️ Cấu trúc Components

```
src/pages/jobs/components/MapView/
├── JobMapView.jsx          # Component bản đồ chính
├── JobMarkerPopup.jsx      # Component popup thông tin công việc
└── index.js                # Export file
```

### JobMapView.jsx
Component chính quản lý:
- Leaflet MapContainer với TileLayer từ OpenStreetMap
- Render job markers và user location marker
- Auto-fit bounds cho tất cả markers
- Floating buttons (recenter, job count)
- Loading states

**Props:**
- `jobs` (Array): Danh sách công việc với coordinates
- `isLoading` (Boolean): Trạng thái loading
- `userLocation` (String): Vị trí người dùng dạng JSON string `"[lng, lat]"`
- `className` (String): Custom CSS classes

### JobMarkerPopup.jsx
Component popup hiển thị thông tin công việc:
- Compact design (320px width)
- Company avatar với fallback
- Job details với icons
- Action button để xem chi tiết

**Props:**
- `job` (Object): Object công việc từ API

## 🔧 Cài đặt

### Dependencies đã cài đặt
```bash
npm install leaflet react-leaflet
```

### CSS Import
CSS của Leaflet đã được import trong `JobMapView.jsx`:
```javascript
import 'leaflet/dist/leaflet.css';
```

Custom styles được thêm vào `src/index.css`:
```css
/* Leaflet Map Styles */
@layer components {
  .leaflet-container { @apply rounded-lg; }
  .leaflet-popup-content-wrapper { @apply rounded-lg shadow-xl; }
  /* ... */
}
```

## 📝 Cách sử dụng

### 1. Trong JobSearch.jsx

```jsx
import JobMapView from './components/MapView/JobMapView';

// State để toggle view mode
const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

// Toggle buttons
<Button onClick={() => setViewMode('list')}>
  <List /> Danh sách
</Button>
<Button onClick={() => setViewMode('map')}>
  <Map /> Bản đồ
</Button>

// Conditional rendering
{viewMode === 'list' ? (
  <JobResultsList jobs={jobs} ... />
) : (
  <JobMapView
    jobs={jobs}
    isLoading={isLoading}
    userLocation={userLocationParam}
  />
)}
```

### 2. Dữ liệu yêu cầu

API phải trả về job objects với structure:
```javascript
{
  _id: "...",
  title: "...",
  location: {
    province: "Thành phố Hà Nội",
    district: "Quận Cầu Giấy",
    coordinates: {
      type: "Point",
      coordinates: [105.833, 21.034] // [longitude, latitude]
    }
  },
  company: {
    name: "...",
    logo: "..."
  },
  minSalary: { $numberDecimal: "..." },
  maxSalary: { $numberDecimal: "..." },
  experience: "SENIOR_LEVEL",
  type: "FULL_TIME",
  workType: "HYBRID",
  deadline: "2026-01-30T23:59:59.000Z"
}
```

**Quan trọng**: `location.coordinates.coordinates` phải có format `[longitude, latitude]` (MongoDB GeoJSON format)

## 🎨 Customization

### 1. Thay đổi màu markers
```javascript
// Trong JobMapView.jsx
const createCustomIcon = (color = '#YOUR_COLOR') => {
  // ...
}
```

### 2. Thay đổi tile provider
```jsx
// Sử dụng Goong Maps
<TileLayer
  url="https://tiles.goong.io/assets/goong_map_web.json?api_key=YOUR_KEY"
/>

// Hoặc Google Maps style
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### 3. Custom popup size
```jsx
<Popup
  maxWidth={400}  // Thay đổi width
  minWidth={320}
  closeButton={true}
>
```

### 4. Custom map center và zoom
```javascript
const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Hanoi
const [mapZoom, setMapZoom] = useState(12);
```

## 🌐 Tile Providers

### OpenStreetMap (Mặc định - Free)
```jsx
<TileLayer
  attribution='&copy; OpenStreetMap'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### Goong Maps (Việt Nam)
Cần API key từ https://goong.io/
```jsx
<TileLayer
  url={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_API_KEY}`}
/>
```

### Mapbox (Premium)
Cần access token từ https://mapbox.com/
```jsx
<TileLayer
  url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
  id="mapbox/streets-v11"
/>
```

## 🔍 Lọc công việc trên bản đồ

Jobs được filter tự động trong component:
```javascript
const validJobs = jobs.filter(
  (job) => job.location?.coordinates?.coordinates &&
  job.location.coordinates.coordinates.length === 2
);
```

Chỉ các jobs có coordinates hợp lệ mới được hiển thị.

## 🚀 Performance Tips

1. **Lazy load bản đồ**: Map component chỉ render khi `viewMode === 'map'`
2. **Memoization**: Sử dụng `useMemo` cho computed values
3. **Marker clustering**: Với hàng ngàn markers, cân nhắc thêm marker clustering
4. **Pagination**: Map view vẫn sử dụng pagination từ API

## 🐛 Troubleshooting

### Issue: Markers không hiển thị
**Solution**: Kiểm tra `job.location.coordinates.coordinates` có đúng format `[lng, lat]`

### Issue: Map không load
**Solution**: Kiểm tra CSS của Leaflet đã được import chưa

### Issue: Popup bị crop
**Solution**: Thêm `z-index` cao hơn cho `.leaflet-popup-pane`

### Issue: Icons bị lỗi
**Solution**: Icons được fix bằng CDN trong code:
```javascript
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/...',
  // ...
});
```

## 📱 Responsive Design

- Map height: `700px` on all screens
- Popup width: `320px` (fixed)
- Touch-friendly controls
- Mobile-optimized zoom controls

## 🎯 Tương lai

Các tính năng có thể mở rộng:
- [ ] Marker clustering cho nhiều jobs
- [ ] Draw circle để search trong radius
- [ ] Heatmap density view
- [ ] Custom map styles (dark mode)
- [ ] Save favorite locations
- [ ] Directions to job location
- [ ] Street view integration

## 📄 License

Component này sử dụng:
- **Leaflet**: BSD-2-Clause License
- **React Leaflet**: Hippocratic License 2.1
- **OpenStreetMap data**: ODbL License

---

**Created by**: AI Assistant  
**Date**: January 2025  
**Version**: 1.0.0
