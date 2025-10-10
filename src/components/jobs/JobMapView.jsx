import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, Marker, MarkerClusterer, InfoWindow } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EnhancedCard, CardContent } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, DollarSign } from 'lucide-react';
import { searchJobsOnMap, getJobClusters } from '@/services/jobService';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 10.8231, // Ho Chi Minh City
  lng: 106.6297,
};

const JobMapView = ({ useCluster = true }) => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(12);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs or clusters based on bounds
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['mapJobs', bounds, zoom, useCluster],
    queryFn: async () => {
      if (!bounds) return { data: [] };
      
      if (useCluster) {
        return await getJobClusters(bounds, zoom);
      } else {
        return await searchJobsOnMap(bounds);
      }
    },
    enabled: !!bounds,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Handle map bounds change
  const handleBoundsChanged = useCallback(() => {
    if (!map) return;

    const mapBounds = map.getBounds();
    if (!mapBounds) return;

    const ne = mapBounds.getNorthEast();
    const sw = mapBounds.getSouthWest();

    setBounds({
      ne_lat: ne.lat(),
      ne_lng: ne.lng(),
      sw_lat: sw.lat(),
      sw_lng: sw.lng(),
    });

    setZoom(map.getZoom());
  }, [map]);

  // Handle marker click
  const handleMarkerClick = (job) => {
    setSelectedJob(job);
  };

  // Handle cluster click - zoom in
  const handleClusterClick = (cluster) => {
    if (map && cluster.coordinates) {
      map.panTo({ lat: cluster.coordinates[1], lng: cluster.coordinates[0] });
      map.setZoom(map.getZoom() + 2);
    }
  };

  const jobs = data?.data || [];

  if (isLoading && !bounds) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <EnhancedCard variant="glass">
      <CardContent className="p-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={zoom}
          onLoad={setMap}
          onIdle={handleBoundsChanged}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {isError && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <ErrorState 
                onRetry={refetch} 
                message={error?.response?.data?.message || error?.message} 
              />
            </div>
          )}

          {jobs.map((item, index) => {
            const [lng, lat] = item.coordinates;
            const position = { lat, lng };

            if (item.cluster) {
              // Render cluster marker
              return (
                <Marker
                  key={`cluster-${index}`}
                  position={position}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 20,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.8,
                    strokeColor: '#1e40af',
                    strokeWeight: 2,
                  }}
                  label={{
                    text: String(item.count),
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => handleClusterClick(item)}
                />
              );
            } else {
              // Render individual job marker
              return (
                <Marker
                  key={item.jobId || item._id}
                  position={position}
                  onClick={() => handleMarkerClick(item)}
                />
              );
            }
          })}

          {selectedJob && (
            <InfoWindow
              position={{
                lat: selectedJob.coordinates[1],
                lng: selectedJob.coordinates[0],
              }}
              onCloseClick={() => setSelectedJob(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-base mb-2">{selectedJob.title}</h3>
                
                {selectedJob.company && (
                  <div className="flex items-center gap-2 mb-2">
                    {selectedJob.company.logo && (
                      <img 
                        src={selectedJob.company.logo} 
                        alt={selectedJob.company.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {selectedJob.company.name}
                    </span>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedJob.address}</span>
                  </div>

                  {(selectedJob.minSalary || selectedJob.maxSalary) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {selectedJob.minSalary && selectedJob.maxSalary
                          ? `${selectedJob.minSalary} - ${selectedJob.maxSalary} triệu`
                          : selectedJob.minSalary
                          ? `Từ ${selectedJob.minSalary} triệu`
                          : `Lên đến ${selectedJob.maxSalary} triệu`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {selectedJob.type} • {selectedJob.workType}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-3 btn-gradient"
                  size="sm"
                  onClick={() => navigate(`/jobs/${selectedJob.jobId || selectedJob._id}`)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </EnhancedCard>
  );
};

export default JobMapView;
