import React from 'react';
import { Bell, User, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onRefresh }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-4 p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            title="刷新数据"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-sm font-medium">管理员</span>
        </div>
      </div>
    </header>
  );
};
