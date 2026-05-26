import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const JobLocationMap = ({ location, address, companyName }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const hasCoordinates = location?.coordinates?.coordinates && location.coordinates.coordinates.length === 2;
  const [longitude, latitude] = hasCoordinates ? location.coordinates.coordinates : [null, null];

  useEffect(() => {
    if (hasCoordinates && mapContainer.current) {
      const apiKey = import.meta.env.VITE_GOONG_MAPS_API_KEY;
      // Ensure goongjs and API key are available
      if (typeof window.goongjs === 'undefined') {
        console.warn('Goong Maps JS SDK is not loaded. Switching to OpenStreetMap fallback.');
        setUseFallback(true);
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        console.warn('Goong Maps API key is missing. Switching to OpenStreetMap fallback.');
        setUseFallback(true);
        setIsLoading(false);
        return;
      }
      
      // Prevent re-initialization
      if (map.current) return;

      try {
        // Set Goong Maps API key immediately before initialization
        window.goongjs.accessToken = apiKey;
        
        map.current = new window.goongjs.Map({
          container: mapContainer.current,
          style: 'https://tiles.goong.io/assets/goong_map_web.json',
          center: [longitude, latitude],
          zoom: 14,
        });

        // Add marker
        new window.goongjs.Marker({ color: '#059669' }) // emerald green marker matching theme
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        map.current.on('load', () => {
          setIsLoading(false);
        });

        map.current.on('error', () => {
          console.warn('Goong Map style or authorization error. Switching to OpenStreetMap fallback.');
          setUseFallback(true);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to initialize Goong Map:", error);
        setUseFallback(true);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Cleanup map instance on component unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [longitude, latitude, hasCoordinates]);

  const displayAddress = address || [location?.commune, location?.district, location?.province].filter(Boolean).join(', ');

  const getGoogleMapsUrl = () => {
    if (!latitude || !longitude) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100/50 text-emerald-600">
            <MapPin className="w-5 h-5" />
          </div>
          Bản đồ vị trí tuyển dụng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[300px] overflow-hidden">
          {!hasCoordinates ? (
            <div className="flex items-center justify-center h-full p-4">
              <Alert className="border-emerald-100 bg-emerald-50/20 rounded-2xl">
                <AlertCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800 font-semibold text-xs">
                  Không có dữ liệu tọa độ vĩ độ/kinh độ để định vị bản đồ.
                </AlertDescription>
              </Alert>
            </div>
          ) : useFallback ? (
            <div className="w-full h-full relative">
              {/* Premium OpenStreetMap Fallback Iframe */}
              <iframe
                title="Bản đồ vị trí dự phòng"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.006}%2C${latitude - 0.004}%2C${longitude + 0.006}%2C${latitude + 0.004}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          ) : mapError ? (
            <div className="flex items-center justify-center h-full p-4">
              <Alert variant="destructive" className="rounded-2xl border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-semibold">
                  Không thể tải kết xuất bản đồ. Vui lòng kiểm tra lại kết nối mạng.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="absolute top-0 bottom-0 w-full h-full"
            />
          )}
          {isLoading && hasCoordinates && !useFallback && (
            <div className="absolute inset-0 bg-muted/30 flex items-center justify-center z-10">
              <Skeleton className="w-full h-full" />
              <div className="absolute flex items-center space-x-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm font-medium">Đang tải bản đồ...</span>
              </div>
            </div>
          )}
          {hasCoordinates && (
            <Button
              asChild
              size="sm"
              className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-emerald-100/50 shadow-md font-bold rounded-xl transition-all"
            >
              <a href={getGoogleMapsUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2 text-emerald-600" />
                Mở trong Google Maps
              </a>
            </Button>
          )}
        </div>
        
        {displayAddress && (
          <div className="p-4 bg-muted/30 border-t rounded-b-lg">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{companyName}</p>
                <p className="text-muted-foreground">{displayAddress}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobLocationMap;
