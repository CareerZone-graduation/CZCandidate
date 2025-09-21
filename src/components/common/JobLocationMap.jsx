import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JobLocationMap = ({ address, province, companyName }) => {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create a formatted address for the map
  const formatAddressForMap = () => {
    const parts = [];
    if (address) parts.push(address);
    if (province) parts.push(province);
    if (companyName) parts.push(companyName);

    return parts.join(', ');
  };

  const mapAddress = formatAddressForMap();
  const hasLocationData = address || province;

  // Generate map URL - using Google Maps search which doesn't require API key
  const getMapUrl = () => {
    if (!hasLocationData) return null;

    const encodedAddress = encodeURIComponent(mapAddress);
    return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  };

  const handleMapError = () => {
    setMapError(true);
    setIsLoading(false);
  };

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  if (!hasLocationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
            Địa điểm làm việc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không có thông tin địa điểm cho công việc này.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
          Địa điểm làm việc
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-muted/20 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">Đang tải bản đồ...</span>
              </div>
            </div>
          )}

          {mapError ? (
            <div className="p-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Không thể tải bản đồ. Vui lòng thử lại sau.
                </AlertDescription>
              </Alert>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Địa chỉ:</strong> {mapAddress}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-b-lg">
              <iframe
                src={getMapUrl()}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={handleMapError}
                onLoad={handleMapLoad}
                title={`Bản đồ địa điểm làm việc tại ${mapAddress}`}
                className="w-full h-[300px] border-0"
              />
            </div>
          )}
        </div>

        {/* Display address info below the map */}
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{mapAddress}</p>
              {address && province && (
                <p className="text-muted-foreground mt-1">
                  {address}, {province}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobLocationMap;
