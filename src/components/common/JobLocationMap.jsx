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

  const hasCoordinates = location?.coordinates?.coordinates && location.coordinates.coordinates.length === 2;
  const [longitude, latitude] = hasCoordinates ? location.coordinates.coordinates : [null, null];

  useEffect(() => {
    if (hasCoordinates && mapContainer.current) {
      const apiKey = import.meta.env.VITE_GOONG_MAPS_API_KEY;
      // Ensure goongjs and API key are available
      if (typeof window.goongjs === 'undefined') {
        console.error('Goong Maps JS SDK is not loaded.');
        setMapError(true);
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        console.error('Goong Maps API key is missing.');
        setMapError(true);
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
        new window.goongjs.Marker({ color: '#c026d3' }) // Using a purple color to match the theme
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        map.current.on('load', () => {
          setIsLoading(false);
        });

        map.current.on('error', () => {
          setMapError(true);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to initialize Goong Map:", error);
        setMapError(true);
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
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          Bản đồ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[300px] overflow-hidden">
          {!hasCoordinates ? (
            <div className="flex items-center justify-center h-full p-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Không có dữ liệu tọa độ để hiển thị bản đồ.
                </AlertDescription>
              </Alert>
            </div>
          ) : mapError ? (
            <div className="flex items-center justify-center h-full p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Không thể tải bản đồ. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="absolute top-0 bottom-0 w-full h-full"
            />
          )}
          {isLoading && hasCoordinates && (
            <div className="absolute inset-0 bg-muted/30 flex items-center justify-center z-10">
              <Skeleton className="w-full h-full" />
              <div className="absolute flex items-center space-x-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm font-medium">Đang tải bản đồ...</span>
              </div>
            </div>
          )}
          {hasCoordinates && !mapError && (
            <Button
              asChild
              size="sm"
              className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm text-foreground hover:bg-white shadow-lg"
            >
              <a href={getGoogleMapsUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem trên Google Maps
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
