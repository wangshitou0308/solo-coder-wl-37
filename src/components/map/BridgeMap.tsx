import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bridge, GRADE_COLORS, Grade } from '@/types';
import { MarkerPopup } from './MarkerPopup';

interface BridgeMapProps {
  bridges: Bridge[];
  loading?: boolean;
}

const createCustomIcon = (grade: Grade) => {
  const color = GRADE_COLORS[grade];
  const isGradeE = grade === 'E';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${isGradeE ? 'animation: pulse-ring 1.5s infinite;' : ''}
      ">
        ${isGradeE ? `
          <div style="
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${color};
            opacity: 0.6;
            animation: pulse-expand 1.5s infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export const BridgeMap: React.FC<BridgeMapProps> = ({ bridges, loading }) => {
  const center = useMemo(() => {
    if (bridges.length === 0) return [39.9042, 116.4074];
    const avgLat = bridges.reduce((sum, b) => sum + b.lat, 0) / bridges.length;
    const avgLng = bridges.reduce((sum, b) => sum + b.lng, 0) / bridges.length;
    return [avgLat, avgLng];
  }, [bridges]);

  const markers = useMemo(() => {
    return bridges.map((bridge) => {
      const icon = createCustomIcon(bridge.currentGrade);
      return { bridge, icon };
    });
  }, [bridges]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
        @keyframes pulse-expand {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-md text-sm text-gray-600">
          加载中...
        </div>
      )}

      <MapContainer
        center={center as [number, number]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map(({ bridge, icon }) => (
          <Marker
            key={bridge.id}
            position={[bridge.lat, bridge.lng]}
            icon={icon}
          >
            <Popup>
              <MarkerPopup bridge={bridge} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">技术状况等级图例</h4>
        <div className="space-y-2">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => (
            <div key={grade} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  grade === 'E' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: GRADE_COLORS[grade] }}
              />
              <span className="text-xs text-gray-600">
                {grade}级 - {
                  grade === 'A' ? '完好' :
                  grade === 'B' ? '良好' :
                  grade === 'C' ? '合格' :
                  grade === 'D' ? '不合格' : '危险'
                }
              </span>
              {grade === 'E' && (
                <span className="text-xs text-red-500 font-medium">(闪烁告警)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {!loading && bridges.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[999]">
          <p className="text-gray-500">暂无符合条件的桥梁数据</p>
        </div>
      )}
    </div>
  );
};
