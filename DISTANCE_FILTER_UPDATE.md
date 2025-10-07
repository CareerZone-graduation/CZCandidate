# 🎯 Distance Filter Update - Migration Summary

## 📋 Overview
Đã cập nhật hệ thống lọc từ **"Ưu tiên gần tôi"** (boolean toggle) sang **"Lọc theo khoảng cách"** (distance radius filter) để phù hợp với backend API mới.

---

## 🔄 Changes Made

### 1. **Schema Updates** (`searchSchemas.js`)

#### ❌ Old (Removed):
```javascript
userLocation: z.string().optional()
```

#### ✅ New (Added):
```javascript
latitude: z.coerce.number().min(-90).max(90).optional(),
longitude: z.coerce.number().min(-180).max(180).optional(),
distance: z.coerce.number().min(1).optional() // Bán kính (km)
```

#### Validation Rules:
- Nếu có `distance`, phải có cả `latitude` và `longitude`
- Latitude: -90 đến 90
- Longitude: -180 đến 180
- Distance: >= 1 km

---

### 2. **New Component** (`DistanceFilter.jsx`)

**Tính năng:**
- ✅ Button "Bật lọc theo vị trí" để request geolocation
- ✅ Slider chọn bán kính: 1-100 km
- ✅ Preset buttons: 5km, 10km, 20km, 50km
- ✅ Hiển thị tọa độ hiện tại
- ✅ Button "Tắt lọc theo khoảng cách"
- ✅ Xử lý errors (permission denied, timeout, etc.)
- ✅ Loading states
- ✅ Responsive UI với gradient styling

**Props:**
```typescript
{
  distance: string | number,
  latitude: string | number,
  longitude: string | number,
  onChange: (data: { distance, latitude, longitude }) => void
}
```

---

### 3. **SearchFilters Update**

#### ❌ Removed:
```jsx
// Checkbox "Ưu tiên gần tôi"
<Checkbox
  id="nearMe"
  checked={isNearMe}
  onCheckedChange={onNearMeChange}
/>
```

#### ✅ Added:
```jsx
// Distance Filter Component
<DistanceFilter
  distance={filters.distance || ''}
  latitude={filters.latitude || ''}
  longitude={filters.longitude || ''}
  onChange={handleDistanceChange}
/>
```

**Props removed:**
- `onNearMeChange`
- `isNearMe`

---

### 4. **JobSearch.jsx Updates**

#### URL Parameters:
```javascript
// Old
userLocation: searchParams.get('userLocation') || ''

// New
latitude: searchParams.get('latitude') || '',
longitude: searchParams.get('longitude') || '',
distance: searchParams.get('distance') || ''
```

#### Search Parameters:
```javascript
// Old
...(userLocationParam && { userLocation: userLocationParam })

// New
...(latitude && { latitude: parseFloat(latitude) }),
...(longitude && { longitude: parseFloat(longitude) }),
...(distance && { distance: parseFloat(distance) })
```

#### State Removed:
```javascript
// ❌ Deleted
const [isNearMe, setIsNearMe] = useState(false);
const handleNearMeChange = (checked) => { ... };
```

#### Map View Location:
```javascript
// Convert lat/lng to userLocation format for map
const userLocationForMap = (latitude && longitude) 
  ? `[${longitude}, ${latitude}]` 
  : null;
```

---

### 5. **API Service Update** (`jobService.js`)

```javascript
// Old
if (params.userLocation) queryParams.append('userLocation', params.userLocation);

// New
if (params.latitude !== undefined && params.latitude !== null) 
  queryParams.append('latitude', params.latitude);
if (params.longitude !== undefined && params.longitude !== null) 
  queryParams.append('longitude', params.longitude);
if (params.distance) 
  queryParams.append('distance', params.distance);
```

---

## 🎨 UI/UX Flow

### Before (Old):
1. User clicks checkbox "Ưu tiên gần tôi"
2. Browser requests geolocation permission
3. If granted → Send `userLocation: "[lng, lat]"` to API
4. Backend decides priority/sorting

### After (New):
1. User clicks "Bật lọc theo vị trí" button
2. Browser requests geolocation permission
3. If granted → Show distance slider UI
4. User selects radius (1-100 km) or preset (5/10/20/50 km)
5. Send `latitude`, `longitude`, `distance` to API
6. Backend filters jobs within exact radius

---

## 📊 Data Flow

```
User Action (Get Location)
    ↓
navigator.geolocation.getCurrentPosition()
    ↓
{ latitude, longitude } coords
    ↓
User selects distance (slider/preset)
    ↓
onChange({ distance, latitude, longitude })
    ↓
Update URL params
    ↓
API Call: /jobs/search/hybrid?latitude=21.03&longitude=105.83&distance=10
    ↓
Backend: Filter jobs within 10km radius
    ↓
Return filtered results
```

---

## 🔧 Backend API Changes

### Request Parameters:

**Old:**
```javascript
{
  userLocation: "[105.83, 21.03]" // JSON string
}
```

**New:**
```javascript
{
  latitude: 21.03,    // number
  longitude: 105.83,  // number
  distance: 10        // number (km)
}
```

### Validation (Backend Schema):
```javascript
latitude: z.coerce.number().min(-90).max(90).optional(),
longitude: z.coerce.number().min(-180).max(180).optional(),
distance: z.coerce.number().min(1).optional(),
```

**Refine rule:**
```javascript
.refine(data => {
  // Nếu có distance, phải có cả latitude và longitude
  if (data.distance && (!data.latitude || !data.longitude)) {
    return false;
  }
  return true;
}, {
  message: 'Để lọc theo khoảng cách, bạn phải cung cấp cả latitude và longitude',
  path: ['distance']
})
```

---

## 🚀 Testing Checklist

- [x] ✅ Schema validation works
- [x] ✅ DistanceFilter component created
- [x] ✅ SearchFilters updated
- [x] ✅ JobSearch.jsx updated
- [x] ✅ API service updated
- [x] ✅ No TypeScript/ESLint errors
- [ ] ⏳ Test geolocation permission flow
- [ ] ⏳ Test slider functionality
- [ ] ⏳ Test preset buttons
- [ ] ⏳ Test with real API
- [ ] ⏳ Test map view with distance filter
- [ ] ⏳ Test error handling

---

## 📁 Files Changed

### ✅ Created:
```
src/pages/jobs/components/SearchInterface/DistanceFilter.jsx
```

### 🔧 Modified:
```
src/schemas/searchSchemas.js
src/pages/jobs/components/SearchInterface/SearchFilters.jsx
src/pages/jobs/JobSearch.jsx
src/services/jobService.js
```

### ❌ Deleted:
- Checkbox "Ưu tiên gần tôi" logic
- `isNearMe` state
- `handleNearMeChange` function
- `userLocation` string parameter

---

## 💡 Key Improvements

### 1. **More Precise Filtering**
- Old: Backend-decided priority
- New: User-controlled exact radius

### 2. **Better UX**
- Visual slider with real-time feedback
- Preset quick-select buttons
- Shows exact coordinates
- Clear enable/disable states

### 3. **More Flexible**
- User can adjust radius dynamically
- No need to re-enable on radius change
- Can disable without losing location

### 4. **Cleaner API**
- Separate numeric parameters
- Standard lat/lng format
- Clear validation rules

---

## 🎯 Usage Example

### Enable Distance Filter:
```javascript
// 1. User clicks "Bật lọc theo vị trí"
// 2. Gets location: { lat: 21.03, lng: 105.83 }
// 3. Default distance: 10km
// 4. onChange called:
{
  latitude: 21.03,
  longitude: 105.83,
  distance: 10
}

// 5. URL updated:
// /jobs/search?latitude=21.03&longitude=105.83&distance=10

// 6. API called:
// GET /jobs/search/hybrid?latitude=21.03&longitude=105.83&distance=10
```

### Adjust Distance:
```javascript
// User moves slider to 20km
onChange({
  latitude: 21.03,
  longitude: 105.83,
  distance: 20 // Changed
})
```

### Disable Filter:
```javascript
// User clicks "Tắt lọc theo khoảng cách"
onChange({
  latitude: '',
  longitude: '',
  distance: ''
})
```

---

## 🐛 Known Issues & Solutions

### Issue 1: Permission Denied
**Solution**: Show clear error message with instructions to enable in browser settings

### Issue 2: Timeout
**Solution**: Increase timeout to 10s, show retry option

### Issue 3: Position Unavailable
**Solution**: Inform user that location services are unavailable

---

## 📖 Documentation Files

- `DISTANCE_FILTER_UPDATE.md` (this file)
- `DistanceFilter.jsx` (inline JSDoc comments)
- `searchSchemas.js` (updated comments)

---

## ✅ Compatibility

### Browser Support:
- ✅ Chrome 90+ (Geolocation API)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Requires HTTPS (geolocation security)

### Backend Compatibility:
- ✅ Matches new backend schema exactly
- ✅ Validation rules aligned
- ✅ Parameter names consistent

---

**Status**: ✅ **COMPLETE**  
**Migration Date**: January 2025  
**Version**: 2.0.0  
**Breaking Changes**: Yes (API parameters changed)

---

## 🎊 Summary

Đã thành công migrate từ **boolean toggle "Ưu tiên gần tôi"** sang **distance radius filter** với:
- ✅ New interactive UI component
- ✅ Precise distance control (1-100km)
- ✅ Better UX with slider + presets
- ✅ Clean API parameters (lat, lng, distance)
- ✅ Full validation
- ✅ No errors

**Ready for testing!** 🚀
