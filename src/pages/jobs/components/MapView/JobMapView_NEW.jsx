import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobMarkerPopup from './JobMarkerPopup';
import { cn } from '@/lib/utils';
import { searchJobsHybrid } from '@/services/jobService';
import { toast } from 'sonner';

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
 * MapEventHandler - Handle map move and fetch data for current viewport
 */
const MapEventHandler = ({ onMapMove, searchFilters }) => {
  const map = useMap();
  const debounceTimerRef = useRef(null);

  useMapEvents({
    moveend: () => {
      // Debounce: Wait 500ms after user stops moving
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const zoom = map.getZoom();

        onMapMove({
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          },
          center: {
            lat: center.lat,
            lng: center.lng,
          },
          zoom,
        });
      }, 500); // 500ms debounce
    },
  });

  return null;
};

/**
 * JobMapView - Interactive map view with marker clustering and dynamic data loading
 * Loads jobs based on current viewport (no pagination needed)
 */
const JobMapView = ({
  initialJobs = [],
  isLoading: initialLoading = false,
  userLocation = null,
  searchFilters = {}, // All search filters from parent
  className
}) => {
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Hanoi default
  const [mapZoom, setMapZoom] = useState(12);
  const [jobs, setJobs] = useState(initialJobs);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [totalJobsInView, setTotalJobsInView] = useState(0);
  const mapRef = useRef(null);

  // Update jobs when initialJobs changes (first load)
  useEffect(() => {
    if (initialJobs && initialJobs.length > 0) {
      setJobs(initialJobs);
    }
  }, [initialJobs]);

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

  /**
   * Fetch jobs for current viewport
   */
  const fetchJobsForViewport = useCallback(async (mapState) => {
    setIsLoadingJobs(true);

    try {
      // Calculate distance from center to edge (approximate radius in km)
      const latDiff = mapState.bounds.north - mapState.bounds.south;
      const lngDiff = mapState.bounds.east - mapState.bounds.west;
      const avgDiff = (latDiff + lngDiff) / 2;
      const radiusKm = Math.ceil(avgDiff * 111); // 1 degree ≈ 111 km

      // Prepare search params with viewport center and radius
      const params = {
        ...searchFilters,
        latitude: mapState.center.lat,
        longitude: mapState.center.lng,
        distance: Math.max(radiusKm, 10), // Minimum 10km
        page: 1,
        size: 200, // Load more jobs for map view (no pagination UI)
      };

      console.log('Fetching jobs for viewport:', params);

      const response = await searchJobsHybrid(params);

      if (response && response.data) {
        setJobs(response.data);
        setTotalJobsInView(response.meta?.totalItems || response.data.length);
      }
    } catch (error) {
      console.error('Error fetching jobs for viewport:', error);
      toast.error('Không thể tải công việc cho khu vực này');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [searchFilters]);

  /**
   * Handle map move event (debounced)
   */
  const handleMapMove = useCallback((mapState) => {
    console.log('Map moved to:', mapState);
    fetchJobsForViewport(mapState);
  }, [fetchJobsForViewport]);

  /**
   * Manual refresh
   */
  const handleRefresh = () => {
    if (mapRef.current) {
      const map = mapRef.current;
      const bounds = map.getBounds();
      const center = map.getCenter();
      const zoom = map.getZoom();

      handleMapMove({
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        zoom,
      });
    }
  };

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

  if (initialLoading) {
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

          {/* Map Event Handler for viewport-based loading */}
          <MapEventHandler 
            onMapMove={handleMapMove}
            searchFilters={searchFilters}
          />

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

          {/* Job markers with clustering */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              let size = 'small';
              let colorClass = 'bg-primary';

              if (count > 50) {
                size = 'large';
                colorClass = 'bg-red-500';
              } else if (count > 20) {
                size = 'medium';
                colorClass = 'bg-orange-500';
              }

              const sizeMap = {
                small: 'w-10 h-10 text-sm',
                medium: 'w-12 h-12 text-base',
                large: 'w-14 h-14 text-lg'
              };

              return L.divIcon({
                html: `
                  <div class="${sizeMap[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg">
                    ${count}
                  </div>
                `,
                className: 'custom-cluster-icon',
                iconSize: L.point(40, 40, true),
              });
            }}
          >
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
          </MarkerClusterGroup>
        </MapContainer>

        {/* Loading Overlay */}
        {isLoadingJobs && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000]">
            <Badge className="bg-primary/90 text-white px-4 py-2 shadow-lg">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải công việc...
            </Badge>
          </div>
        )}

        {/* Recenter button (floating) */}
        {userCoords && (
          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
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
            
            <Button
              onClick={handleRefresh}
              size="icon"
              variant="secondary"
              className={cn(
                "shadow-xl",
                "hover:scale-110 transition-all duration-300",
                "border-2 border-white/20"
              )}
              title="Làm mới khu vực này"
              disabled={isLoadingJobs}
            >
              <RefreshCw className={cn(
                "h-5 w-5",
                isLoadingJobs && "animate-spin"
              )} />
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
                  trong khu vực này
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help text when no filters */}
        {!searchFilters.latitude && !searchFilters.distance && (
          <div className="absolute bottom-6 left-6 z-[1000] max-w-xs">
            <Card className="bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-lg">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  💡 <span className="font-semibold">Mẹo:</span> Di chuyển bản đồ để khám phá công việc ở các khu vực khác nhau. Dữ liệu sẽ tự động cập nhật!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      {/* Custom CSS for popup and clustering */}
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
        .custom-cluster-icon {
          background: transparent;
          border: none;
        }
        .marker-cluster {
          background-color: transparent !important;
        }
      `}</style>
    </Card>
  );
};

export default JobMapView;
