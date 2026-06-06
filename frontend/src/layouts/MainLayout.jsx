import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import { useState } from 'react';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <DashboardSidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <DashboardNavbar onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
      <main className="pt-[64px] sm:pt-[72px] lg:ml-[280px] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
