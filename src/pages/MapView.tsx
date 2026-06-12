import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBridgeStore } from '@/stores/useBridgeStore';
import { BridgeMap } from '@/components/map/BridgeMap';
import { MapFilter, FilterState } from '@/components/map/MapFilter';
import { Bridge } from '@/types';

const MapView: React.FC = () => {
  const { bridges, loading, fetchBridges } = useBridgeStore();
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    era: 'all',
    grade: 'all',
  });

  useEffect(() => {
    fetchBridges();
  }, [fetchBridges]);

  const filterBridges = (bridgeList: Bridge[], f: FilterState): Bridge[] => {
    return bridgeList.filter((bridge) => {
      if (f.type !== 'all' && bridge.type !== f.type) return false;

      if (f.era !== 'all') {
        const year = bridge.buildYear;
        if (f.era === 'before1980' && year >= 1980) return false;
        if (f.era === '1980-1999' && (year < 1980 || year > 1999)) return false;
        if (f.era === '2000-2019' && (year < 2000 || year > 2019)) return false;
        if (f.era === 'after2020' && year < 2020) return false;
      }

      if (f.grade !== 'all' && bridge.currentGrade !== f.grade) return false;

      return true;
    });
  };

  const filteredBridges = useMemo(() => {
    return filterBridges(bridges, filters);
  }, [bridges, filters]);

  const handleRefresh = () => {
    fetchBridges();
  };

  return (
    <AppLayout title="地图可视化" onRefresh={handleRefresh}>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        <div className="w-64 flex-shrink-0">
          <MapFilter filters={filters} onFilterChange={setFilters} />
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">
              共 <span className="font-bold text-gray-700">{filteredBridges.length}</span> 座桥梁
            </p>
          </div>
        </div>
        <div className="flex-1">
          <BridgeMap bridges={filteredBridges} loading={loading} />
        </div>
      </div>
    </AppLayout>
  );
};

export default MapView;
