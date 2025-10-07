import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobMarkerPopup from './JobMarkerPopup';
import { cn } from '@/lib/utils';

// Fix Leaflet default icon issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = '#FF6B35') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          margin-top: -4px;
        ">📍</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="color: white; font-size: 20px;">📍</div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

/**
 * Component to auto-fit map bounds to markers
 */
const MapBounds = ({ jobs, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = [];

    // Add user location to bounds
    if (userLocation) {
      try {
        const coords = JSON.parse(userLocation);
        if (coords && coords.length === 2) {
          bounds.push([coords[1], coords[0]]); // [lat, lng]
        }
      } catch (error) {
        console.error('Failed to parse user location:', error);
      }
    }

    // Add job locations to bounds
    jobs.forEach((job) => {
      if (job.location?.coordinates?.coordinates) {
        const [lng, lat] = job.location.coordinates.coordinates;
        if (lat && lng) {
          bounds.push([lat, lng]);
        }
      }
    });

    // Fit bounds if we have markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    }
  }, [jobs, userLocation, map]);

  return null;
};

/**
 * JobMapView - Interactive map view for job search results
 * Displays jobs as markers on a map using Leaflet and Goong Maps API
 */
const JobMapView = ({
  jobs = [],
  isLoading = false,
  userLocation = null,
  className
}) => {
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Hanoi default
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef(null);

  // Update map center based on user location or first job
  useEffect(() => {
    if (userLocation) {
      try {
        const coords = JSON.parse(userLocation);
        if (coords && coords.length === 2) {
          setMapCenter([coords[1], coords[0]]); // [lat, lng]
          setMapZoom(13);
        }
      } catch (error) {
        console.error('Failed to parse user location:', error);
      }
    } else if (jobs.length > 0 && jobs[0].location?.coordinates?.coordinates) {
      const [lng, lat] = jobs[0].location.coordinates.coordinates;
      setMapCenter([lat, lng]);
      setMapZoom(12);
    }
  }, [userLocation, jobs]);

  // Get user coordinates for marker
  const getUserCoords = () => {
    if (!userLocation) return null;
    try {
      const coords = JSON.parse(userLocation);
      if (coords && coords.length === 2) {
        return [coords[1], coords[0]]; // [lat, lng]
      }
    } catch (error) {
      console.error('Failed to parse user location:', error);
    }
    return null;
  };

  // Recenter map to user location
  const handleRecenterToUser = () => {
    const coords = getUserCoords();
    if (coords && mapRef.current) {
      mapRef.current.setView(coords, 13, {
        animate: true,
        duration: 1
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("h-[700px]", className)}>
        <CardContent className="p-0 h-full">
          <Skeleton className="w-full h-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Filter jobs with valid coordinates
  const validJobs = jobs.filter(
    (job) => job.location?.coordinates?.coordinates &&
    job.location.coordinates.coordinates.length === 2
  );

  const userCoords = getUserCoords();

  return (
    <Card className={cn(
      "h-[700px] overflow-hidden",
      "border-2 border-border/50 shadow-xl shadow-primary/5",
      "bg-card/95 backdrop-blur-sm",
      className
    )}>
      <CardContent className="p-0 h-full relative">
        {/* Map container */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full rounded-lg"
          ref={mapRef}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          
          {/* To use Goong Maps instead, replace above TileLayer with:
            <TileLayer
              attribution='&copy; <a href="https://www.goong.io/">Goong</a>'
              url={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${YOUR_GOONG_API_KEY}`}
            />
          */}

          {/* User location marker */}
          {userCoords && (
            <Marker position={userCoords} icon={userIcon}>
              <Popup>
                <div className="p-2 text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Vị trí của bạn</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userCoords[0].toFixed(6)}, {userCoords[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Job markers */}
          {validJobs.map((job) => {
            const [lng, lat] = job.location.coordinates.coordinates;
            return (
              <Marker
                key={job._id}
                position={[lat, lng]}
                icon={createCustomIcon('#FF6B35')}
              >
                <Popup
                  maxWidth={340}
                  minWidth={320}
                  closeButton={true}
                  className="job-marker-popup"
                >
                  <JobMarkerPopup job={job} />
                </Popup>
              </Marker>
            );
          })}

          {/* Auto-fit bounds */}
          <MapBounds jobs={validJobs} userLocation={userLocation} />
        </MapContainer>

        {/* Recenter button (floating) */}
        {userCoords && (
          <div className="absolute bottom-6 right-6 z-[1000]">
            <Button
              onClick={handleRecenterToUser}
              size="icon"
              className={cn(
                "btn-gradient text-white shadow-xl",
                "hover:scale-110 transition-all duration-300",
                "border-2 border-white/20"
              )}
              title="Về vị trí của tôi"
            >
              <Navigation className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Job count indicator */}
        <div className="absolute top-4 left-4 z-[1000]">
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-border shadow-lg">
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {validJobs.length} công việc
                </p>
                <p className="text-xs text-muted-foreground">
                  trên bản đồ
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {/* Custom CSS for popup styling */}
      <style>{`
        .job-marker-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .job-marker-popup .leaflet-popup-content {
          margin: 0;
          width: 320px !important;
        }
        .job-marker-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </Card>
  );
};

export default JobMapView;
