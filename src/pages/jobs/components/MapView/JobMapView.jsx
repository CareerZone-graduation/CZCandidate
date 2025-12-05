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
import { searchJobsOnMap, getJobClusters } from '@/services/jobService';
import { toast } from 'sonner';

// Ngưỡng zoom để chuyển từ cluster sang marker chi tiết
const ZOOM_THRESHOLD = 12;

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
  const [clusters, setClusters] = useState([]); // State để lưu clusters từ backend
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [totalJobsInView, setTotalJobsInView] = useState(0);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);

  // Log để debug
  useEffect(() => {
    console.log('🗺️ JobMapView mounted with:', {
      initialJobs: initialJobs.length,
      isLoading: initialLoading,
      userLocation,
      searchFilters
    });
  }, []);

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
    } else if (jobs.length > 0) {
      // Lấy coordinates từ nested hoặc flat format
      const firstJob = jobs[0];
      const coords = firstJob.coordinates || firstJob.location?.coordinates?.coordinates;
      if (coords && coords.length === 2) {
        const [lng, lat] = coords;
        setMapCenter([lat, lng]);
        setMapZoom(12);
      }
    }
  }, [userLocation, jobs]);

  /**
   * Fetch jobs or clusters for current viewport based on zoom level
   * Zoom >= 12: Fetch individual jobs (detailed markers)
   * Zoom < 12: Fetch clusters (aggregated data from server)
   */
  const fetchJobsForViewport = useCallback(async (mapState) => {
    setIsLoadingJobs(true);

    try {
      const { bounds, zoom } = mapState;

      // ✅ DEBUG: Log zoom level
      console.log(`🔍 [DEBUG] Current Zoom Level: ${zoom}, Threshold: ${ZOOM_THRESHOLD}`);

      // Chuẩn bị bounds cho API
      const boundsParams = {
        sw_lat: bounds.south,
        sw_lng: bounds.west,
        ne_lat: bounds.north,
        ne_lng: bounds.east,
        zoom: zoom,
        ...searchFilters // Thêm các filters từ parent (category, experience, etc.)
      };

      let response;
      let processedJobs = [];

      // ✅ ĐỀ XUẤT 2: Tách riêng 2 endpoints - logic đơn giản hơn
      if (zoom < ZOOM_THRESHOLD) {
        // ZOOM XA: Gọi API CHỈ LẤY CLUSTERS (không có singles)
        console.log(`🗺️ Zoom ${zoom} < ${ZOOM_THRESHOLD}: Fetching ONLY clusters...`);
        response = await getJobClusters(boundsParams, zoom);

        console.log(`📦 [Clusters API] Response:`, response);

        // Response CHỈ chứa clusters: [{ type: 'cluster', count, coordinates, jobIds }]
        if (response && Array.isArray(response)) {
          setClusters(response); // Backend CHỈ trả clusters
          setJobs([]); // KHÔNG có single jobs ở zoom xa
          setTotalJobsInView(response.reduce((sum, c) => sum + c.count, 0));
          console.log(`✅ Loaded ${response.length} clusters with ${response.reduce((sum, c) => sum + c.count, 0)} total jobs`);
        } else {
          console.warn('⚠️ Invalid cluster response format');
          setClusters([]);
          setJobs([]);
          setTotalJobsInView(0);
        }
      } else {
        // ZOOM GẦN: Gọi API CHỈ LẤY JOBS (không có clusters)
        console.log(`📍 Zoom ${zoom} >= ${ZOOM_THRESHOLD}: Fetching ONLY individual jobs...`);
        boundsParams.limit = 50; // Giới hạn 50 jobs
        response = await searchJobsOnMap(boundsParams);

        console.log(`📦 [Jobs API] Response:`, response);

        // Response CHỈ chứa jobs: { data: [...], meta: {...} }
        if (response && response.data) {
          setClusters([]); // KHÔNG có clusters ở zoom gần
          setJobs(response.data); // Backend CHỈ trả jobs
          setTotalJobsInView(response.meta?.totalItems || response.data.length);
          console.log(`✅ Loaded ${response.data.length} individual jobs`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching jobs for viewport:', error);
      console.error('❌ [DEBUG] Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Không thể tải công việc cho khu vực này';
      toast.error(errorMessage);
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
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter jobs with valid coordinates
  // Hỗ trợ 2 format: nested (location.coordinates.coordinates) hoặc flat (coordinates)
  const validJobs = jobs.filter((job) => {
    // Format 1: nested structure từ API thông thường
    if (job.location?.coordinates?.coordinates &&
      Array.isArray(job.location.coordinates.coordinates) &&
      job.location.coordinates.coordinates.length === 2) {
      return true;
    }
    // Format 2: flat structure từ map-search API
    if (job.coordinates &&
      Array.isArray(job.coordinates) &&
      job.coordinates.length === 2) {
      return true;
    }
    return false;
  });

  const userCoords = getUserCoords();

  // Error fallback UI
  if (mapError) {
    return (
      <Card className={cn("h-[700px]", className)}>
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Không thể tải bản đồ</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {mapError}
              </p>
              <Button onClick={() => {
                setMapError(null);
                window.location.reload();
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          whenReady={() => {
            console.log('✅ Map loaded successfully');
          }}
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

          {/* Server-side clusters (when zoom < threshold) */}
          {clusters.length > 0 && clusters.map((cluster, idx) => {
            const [lng, lat] = cluster.coordinates;

            // Nếu cluster chỉ có 1 job, hiển thị như marker bình thường
            if (cluster.count === 1) {
              return (
                <Marker
                  key={`cluster-single-${idx}`}
                  position={[lat, lng]}
                  icon={createCustomIcon('#FF6B35')}
                >
                  <Popup
                    maxWidth={340}
                    minWidth={320}
                    closeButton={true}
                    className="job-marker-popup"
                  >
                    <div className="p-3 text-center">
                      <div className="flex items-center gap-2 mb-2 justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-bold text-lg">1 công việc</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Phóng to để xem chi tiết
                      </p>
                      <Button
                        size="sm"
                        className="btn-gradient text-white w-full"
                        onClick={() => {
                          const map = mapRef.current;
                          if (map) {
                            map.setView([lat, lng], Math.min(map.getZoom() + 2, 16), {
                              animate: true,
                              duration: 0.5
                            });
                          }
                        }}
                      >
                        Phóng to
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            // ✅ THỐNG NHẤT: Áp dụng CÙNG logic size với client clusters
            let sizeClass = '';
            let colorClass = '';
            let fontSize = '';
            let iconSize = 40;

            if (cluster.count > 50) {
              sizeClass = 'w-16 h-16'; // 64px - LỚN NHẤT
              colorClass = 'bg-red-500'; // ĐỎ
              fontSize = 'text-lg'; // 18px
              iconSize = 64;
            } else if (cluster.count > 20) {
              sizeClass = 'w-12 h-12'; // 48px - VỪA
              colorClass = 'bg-orange-500'; // CAM
              fontSize = 'text-base'; // 16px
              iconSize = 48;
            } else {
              sizeClass = 'w-10 h-10'; // 40px - NHỎ NHẤT
              colorClass = 'bg-purple-600'; // TÍM (server cluster - phân biệt với client)
              fontSize = 'text-sm'; // 14px
              iconSize = 40;
            }

            // Tạo icon cho cluster với số lượng (THỐNG NHẤT với client clusters)
            const clusterIcon = L.divIcon({
              className: 'server-cluster-icon',
              html: `
                <div class="${sizeClass} ${colorClass} ${fontSize} rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg" style="animation: pulse-cluster 2s infinite; cursor: pointer;">
                  ${cluster.count}
                </div>
                <style>
                  @keyframes pulse-cluster {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                </style>
              `,
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2],
            });

            return (
              <Marker
                key={`cluster-${idx}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  click: (e) => {
                    // Zoom vào cluster khi click
                    const map = mapRef.current;
                    if (map) {
                      map.setView([lat, lng], Math.min(map.getZoom() + 2, 16), {
                        animate: true,
                        duration: 0.5
                      });
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-3 text-center">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-bold text-lg">{cluster.count} công việc</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Click để phóng to và xem chi tiết
                    </p>
                    <Button
                      size="sm"
                      className="btn-gradient text-white w-full"
                      onClick={() => {
                        const map = mapRef.current;
                        if (map) {
                          map.setView([lat, lng], Math.min(map.getZoom() + 2, 16), {
                            animate: true,
                            duration: 0.5
                          });
                        }
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Job markers with clustering - ALWAYS use MarkerClusterGroup for better UX */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              let sizeClass = '';
              let colorClass = '';
              let fontSize = '';
              let iconSize = 40; // Giá trị mặc định

              // Logic: càng nhiều jobs → càng to + càng đỏ
              if (count > 50) {
                sizeClass = 'w-16 h-16'; // 64px - LỚN NHẤT
                colorClass = 'bg-red-500'; // ĐỎ
                fontSize = 'text-lg'; // 18px
                iconSize = 64; // QUAN TRỌNG: phải khớp với w-16
              } else if (count > 20) {
                sizeClass = 'w-12 h-12'; // 48px - VỪA
                colorClass = 'bg-orange-500'; // CAM
                fontSize = 'text-base'; // 16px
                iconSize = 48; // QUAN TRỌNG: phải khớp với w-12
              } else {
                sizeClass = 'w-10 h-10'; // 40px - NHỎ NHẤT
                colorClass = 'bg-primary'; // XÁM/XANH (primary)
                fontSize = 'text-sm'; // 14px
                iconSize = 40; // QUAN TRỌNG: phải khớp với w-10
              }

              return L.divIcon({
                html: `
                  <div class="${sizeClass} ${colorClass} ${fontSize} rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg">
                    ${count}
                  </div>
                `,
                className: 'custom-cluster-icon',
                iconSize: L.point(iconSize, iconSize, true), // Động theo size thực tế
              });
            }}
          >
            {validJobs.map((job) => {
              // Lấy coordinates từ nested hoặc flat format
              const coords = job.coordinates || job.location?.coordinates?.coordinates;
              const [lng, lat] = coords;
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
                  {clusters.length > 0
                    ? `${clusters.reduce((sum, c) => sum + c.count, 0) + validJobs.length} công việc`
                    : `${validJobs.length} công việc`
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {clusters.length > 0
                    ? `${clusters.length} cụm, ${validJobs.length} đơn lẻ`
                    : 'trong khu vực này'
                  }
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
