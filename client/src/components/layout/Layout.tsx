import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SimulatedBanner } from '../common/SimulatedBanner';
import { dashboardService } from '../../services/dashboardService';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [activeLeaksCount, setActiveLeaksCount] = useState(0);

  const fetchBadgeCounts = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setActiveAlertsCount(data.metrics.activeAlertsCount);
      setActiveLeaksCount(data.metrics.activeLeaksCount);
    } catch (err) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 12000); // 12-second polling to reflect simulated IoT telemetry
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeAlertsCount={activeAlertsCount}
        activeLeaksCount={activeLeaksCount}
      />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <SimulatedBanner />
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeAlertsCount={activeAlertsCount}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
