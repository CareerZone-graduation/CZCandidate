import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { getMapClusters } from '@/services/jobService';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useNavigate } from 'react-router-dom';

// Fix cho icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component con để lấy bounds và zoom khi map thay đổi
function MapEventsHandler({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange({
        sw_lat: bounds.getSouthWest().lat,
        sw_lng: bounds.getSouthWest().lng,
        ne_lat: bounds.getNorthEast().lat,
        ne_lng: bounds.getNorthEast().lng,
        zoom: zoom,
      });
    },
  });
  return null;
}

export function JobMapLeaflet({ filters = {}, initialCenter = [10.762622, 106.660172], initialZoom = 12 }) {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    sw_lat: 10.7,
    sw_lng: 106.6,
    ne_lat: 10.8,
    ne_lng: 106.7,
    zoom: initialZoom,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['mapClusters', viewState, filters],
    queryFn: () => getMapClusters({ ...viewState, ...filters }),
    keepPreviousData: true,
  });

  const handleBoundsChange = (newViewState) => {
    setViewState(newViewState);
  };

  // Custom icon cho cluster
  const createClusterIcon = (count) => {
    return L.divIcon({
      html: `<div class="marker-cluster-custom"><span>${count}</span></div>`,
      className: 'marker-cluster-wrapper',
      iconSize: [40, 40],
    });
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (isError) {
    return (
      <ErrorState
        message={error?.response?.data?.message || 'Không thể tải dữ liệu bản đồ'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg [&_.leaflet-tile-pane]:dark:filter [&_.leaflet-tile-pane]:dark:invert [&_.leaflet-tile-pane]:dark:hue-rotate-180 [&_.leaflet-tile-pane]:dark:brightness-95 [&_.leaflet-tile-pane]:dark:contrast-90 [&_.leaflet-popup-content-wrapper]:dark:!bg-card [&_.leaflet-popup-tip]:dark:!bg-card [&_.leaflet-popup-content-wrapper]:dark:!text-foreground"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEventsHandler onBoundsChange={handleBoundsChange} />

        {data &&
          data.map((item, index) => {
            if (item.type === 'cluster') {
              // Đây là một cụm
              return (
                <Marker
                  key={`cluster-${index}`}
                  position={[item.coordinates[1], item.coordinates[0]]}
                  icon={createClusterIcon(item.count)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{item.count} công việc</p>
                      <p className="text-muted-foreground text-xs">Phóng to để xem chi tiết</p>
                    </div>
                  </Popup>
                </Marker>
              );
            } else {
              // Đây là một điểm đơn lẻ
              return (
                <Marker
                  key={item.job._id}
                  position={[item.coordinates[1], item.coordinates[0]]}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-sm mb-1">{item.job.title}</h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.job.company?.name}
                      </p>
                      {(item.job.minSalary || item.job.maxSalary) && (
                        <p className="text-xs text-primary mb-2">
                          {item.job.minSalary && item.job.maxSalary
                            ? `${parseInt(item.job.minSalary).toLocaleString('vi-VN')} - ${parseInt(item.job.maxSalary).toLocaleString('vi-VN')} VNĐ`
                            : item.job.minSalary
                              ? `Từ ${parseInt(item.job.minSalary).toLocaleString('vi-VN')} VNĐ`
                              : `Lên đến ${parseInt(item.job.maxSalary).toLocaleString('vi-VN')} VNĐ`}
                        </p>
                      )}
                      <button
                        onClick={() => handleJobClick(item.job._id)}
                        className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 transition-opacity"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            }
          })}
      </MapContainer>
    </div>
  );
}
