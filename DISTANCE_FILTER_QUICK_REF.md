# 🚀 Quick Reference - Distance Filter Migration

## What Changed?

### ❌ OLD: "Ưu tiên gần tôi" Checkbox
```jsx
<Checkbox checked={isNearMe} onCheckedChange={handleNearMeChange} />
```
- Boolean on/off
- Backend decides priority
- No user control over radius
- Sends: `userLocation: "[lng, lat]"`

### ✅ NEW: Distance Radius Slider
```jsx
<DistanceFilter 
  distance={filters.distance}
  latitude={filters.latitude}
  longitude={filters.longitude}
  onChange={handleDistanceChange}
/>
```
- Slider: 1-100 km
- User controls exact radius
- Preset buttons: 5/10/20/50 km
- Sends: `latitude`, `longitude`, `distance` (numbers)

---

## Quick Usage

### 1. Enable Distance Filter
```javascript
// User clicks "Bật lọc theo vị trí"
// → Browser requests location
// → Returns: { latitude: 21.03, longitude: 105.83 }
// → Default distance: 10km
```

### 2. Adjust Radius
```javascript
// Move slider or click preset
// → Updates distance: 5, 10, 20, 50, or 1-100 km
```

### 3. Disable Filter
```javascript
// Click "Tắt lọc theo khoảng cách"
// → Clears: distance='', latitude='', longitude=''
```

---

## API Parameters

### Request:
```javascript
// Old
GET /jobs/search/hybrid?userLocation=[105.83,21.03]

// New
GET /jobs/search/hybrid?latitude=21.03&longitude=105.83&distance=10
```

### Schema:
```javascript
{
  latitude: number (optional, -90 to 90),
  longitude: number (optional, -180 to 180),
  distance: number (optional, >= 1 km)
}
```

### Validation:
- If `distance` is provided → `latitude` AND `longitude` required
- All must be numbers

---

## Component Props

### DistanceFilter:
```typescript
{
  distance: string | number,
  latitude: string | number,
  longitude: string | number,
  onChange: ({ distance, latitude, longitude }) => void
}
```

### SearchFilters (removed):
```typescript
// ❌ Removed props
onNearMeChange: (checked: boolean) => void,
isNearMe: boolean
```

---

## Files Modified

```
✅ Created: DistanceFilter.jsx
🔧 Modified: 
  - searchSchemas.js (schema)
  - SearchFilters.jsx (component)
  - JobSearch.jsx (state & params)
  - jobService.js (API call)
```

---

## Test Flow

```
1. Go to /jobs/search
2. Click "Bật lọc theo vị trí" in filters
3. Allow location permission
4. See slider appear with default 10km
5. Adjust slider or click preset (5/10/20/50)
6. See URL update: ?latitude=...&longitude=...&distance=...
7. Results filtered within radius
8. Map view shows circle radius
```

---

## Error Handling

| Error | Message |
|-------|---------|
| Permission Denied | "Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt" |
| Timeout | "Yêu cầu lấy vị trí đã hết thời gian" |
| Unavailable | "Thông tin vị trí không khả dụng" |
| No Browser Support | "Trình duyệt của bạn không hỗ trợ định vị" |

---

## Breaking Changes

### URL Parameters:
```
// Old
?userLocation=[105.83,21.03]

// New
?latitude=21.03&longitude=105.83&distance=10
```

### State Variables:
```javascript
// ❌ Removed
const [isNearMe, setIsNearMe] = useState(false);
const handleNearMeChange = (checked) => { ... };

// ✅ Now in filters object
filters.latitude
filters.longitude
filters.distance
```

---

## Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Requires HTTPS
- ⚠️ Requires location permission

---

**Version**: 2.0.0  
**Status**: ✅ Ready  
**Migration**: Complete
