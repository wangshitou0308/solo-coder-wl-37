import React from 'react';
import { Bridge, BRIDGE_TYPE_COLORS } from '@/types';
import { GradeBadge } from '@/components/common/GradeBadge';
import {
  MapPin,
  Building2,
  Calendar,
  Ruler,
  Users,
  Shield,
  Navigation,
} from 'lucide-react';

interface BridgeInfoProps {
  bridge: Bridge;
}

export const BridgeInfo: React.FC<BridgeInfoProps> = ({ bridge }) => {
  const typeColor = BRIDGE_TYPE_COLORS[bridge.type];

  const infoItems = [
    { icon: Building2, label: '结构材料', value: bridge.material },
    { icon: Calendar, label: '建成年代', value: `${bridge.buildYear}年` },
    { icon: Shield, label: '设计荷载', value: bridge.designLoad },
    { icon: Ruler, label: '跨径组合', value: bridge.spanCombination },
    { icon: Users, label: '管理单位', value: bridge.managementUnit },
    { icon: Users, label: '养护单位', value: bridge.maintenanceUnit },
    { icon: Navigation, label: '经纬度', value: `${bridge.lng.toFixed(6)}, ${bridge.lat.toFixed(6)}` },
    { icon: MapPin, label: '技术状况等级', value: null, component: <GradeBadge grade={bridge.currentGrade} /> },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{bridge.name}</h2>
            <span
              className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded text-white"
              style={{ backgroundColor: typeColor }}
            >
              {bridge.type}
            </span>
          </div>
          <GradeBadge grade={bridge.currentGrade} size="lg" />
        </div>
      </div>

      <div className="p-4">
        {bridge.photos.length > 0 && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {bridge.photos.slice(0, 3).map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${bridge.name} - ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
              <item.icon size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                {item.component || <div className="text-sm font-medium text-gray-900">{item.value}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
