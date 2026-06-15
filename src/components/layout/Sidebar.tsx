import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  CalendarDays,
  AlertTriangle,
  Wrench,
  Footprints,
  Map,
  ClipboardList,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/bridges', label: '桥梁档案', icon: Building2 },
  { path: '/inspection-plans', label: '检测计划', icon: CalendarDays },
  { path: '/inspections', label: '定期检测', icon: ClipboardCheck },
  { path: '/diseases', label: '病害追踪', icon: AlertTriangle },
  { path: '/disposal-tasks', label: '病害处置', icon: ClipboardList },
  { path: '/maintenances', label: '维修加固', icon: Wrench },
  { path: '/patrols', label: '养护巡查', icon: Footprints },
  { path: '/map', label: '地图可视化', icon: Map },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-cyan-400">桥梁健康监测</h1>
        <p className="text-xs text-slate-400 mt-1">城市桥梁管理系统</p>
      </div>
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-cyan-600 text-white border-r-4 border-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <p>© 2026 城市桥梁管理系统</p>
      </div>
    </aside>
  );
};
