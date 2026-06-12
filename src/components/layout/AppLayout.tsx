import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, children, onRefresh }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} onRefresh={onRefresh} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
