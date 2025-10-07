# 🚀 Quick Reference Guide - Map View Feature

## 1. Basic Usage

```jsx
import JobMapView from './components/MapView/JobMapView';

const [viewMode, setViewMode] = useState('list'); // or 'map'

<JobMapView
  jobs={searchResults?.data || []}
  isLoading={isLoading}
  userLocation={userLocationParam} // "[lng, lat]" format
/>
```

## 2. Required Data Structure

```javascript
const jobData = {
  _id: "string",
  title: "string",
  location: {
    province: "string",
    district: "string",
    coordinates: {
      type: "Point",
      coordinates: [longitude, latitude] // [number, number]
    }
  },
  company: {
    name: "string",
    logo: "url"
  },
  minSalary: { $numberDecimal: "string" },
  maxSalary: { $numberDecimal: "string" },
  experience: "SENIOR_LEVEL",
  type: "FULL_TIME",
  workType: "HYBRID",
  deadline: "2026-01-30T23:59:59.000Z"
};
```

## 3. User Location Format

```javascript
// Must be JSON string: "[longitude, latitude]"
const userLocation = "[105.8342, 21.0278]"; // Hanoi center
```

## 4. Customization

### Change marker color
```javascript
// In JobMapView.jsx
const createCustomIcon = (color = '#YOUR_COLOR') => {
  // ...
}
```

### Use Goong Maps tiles
```jsx
<TileLayer
  url={`https://tiles.goong.io/.../api_key=${API_KEY}`}
/>
```

### Adjust popup size
```jsx
<Popup maxWidth={400} minWidth={320}>
```

### Change default center
```javascript
const [mapCenter, setMapCenter] = useState([lat, lng]);
const [mapZoom, setMapZoom] = useState(12);
```

## 5. Testing with Sample Data

```javascript
import { sampleMapJobs, sampleUserLocation } from './testData';

<JobMapView
  jobs={sampleMapJobs}
  isLoading={false}
  userLocation={sampleUserLocation}
/>
```

## 6. Common Issues & Fixes

### ❌ Markers not showing
**Fix:** Check coordinates format `[lng, lat]`
```javascript
console.log(job.location.coordinates.coordinates);
```

### ❌ Map not loading
**Fix:** Ensure CSS imported
```javascript
import 'leaflet/dist/leaflet.css';
```

### ❌ Popup cut off
**Fix:** Adjust z-index or maxWidth

## 7. Performance Tips

### Add marker clustering (for 100+ jobs)
```bash
npm install react-leaflet-cluster
```

```jsx
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {jobs.map(job => <Marker key={job._id} ... />)}
</MarkerClusterGroup>
```

## 8. Keyboard Shortcuts

- `+/-` : Zoom in/out
- `Arrow keys` : Pan map
- `Shift + Drag` : Zoom to area

## 9. Mobile Gestures

- **Pinch** : Zoom
- **Drag** : Pan
- **Double tap** : Zoom in

## 10. Useful Leaflet Methods

```javascript
const mapRef = useRef(null);
const map = mapRef.current;

// Programmatic controls
map.panTo([lat, lng]);
map.setZoom(15);
map.fitBounds([[lat1, lng1], [lat2, lng2]]);

// Get current state
const center = map.getCenter();
const zoom = map.getZoom();
```

## File Structure

```
src/pages/jobs/components/MapView/
├── JobMapView.jsx              → Main map component
├── JobMarkerPopup.jsx          → Popup content
├── index.js                    → Exports
├── testData.js                 → Sample data
├── README.md                   → Full documentation
├── MAP_VIEW_IMPLEMENTATION.md  → Technical details
└── QUICK_REFERENCE.md          → This file
```

## Dependencies

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x"
}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 2025
