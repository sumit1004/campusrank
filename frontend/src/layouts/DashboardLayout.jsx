import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Trophy, Upload, LogOut, Settings, Bell, Search, Menu, X, Star, ClipboardList, User, Activity, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from '../components/NotificationDropdown';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [];
  if (user?.role === 'superadmin') {
    navItems.push({ name: 'Dashboard', path: '/superadmin-dashboard', icon: <Home size={22} /> });
    navItems.push({ name: 'User Search', path: '/superadmin-dashboard?tab=search', icon: <Search size={22} /> });
    navItems.push({ name: 'Role Hub', path: '/superadmin-dashboard?tab=roles', icon: <ShieldCheck size={22} /> });
    navItems.push({ name: 'Certificates', path: '/superadmin-dashboard?tab=certificates', icon: <FileText size={22} /> });
    navItems.push({ name: 'Admin Audit', path: '/superadmin-dashboard?tab=activities', icon: <Activity size={22} /> });
    navItems.push({ name: 'Event Monitor', path: '/superadmin-dashboard?tab=forms-monitor', icon: <ClipboardList size={22} /> });
    navItems.push({ name: 'Badge Hub', path: '/superadmin-dashboard?tab=badges-audit', icon: <Star size={22} /> });
    navItems.push({ name: 'Broadcaster', path: '/superadmin-dashboard?tab=broadcaster', icon: <Bell size={22} /> });
    navItems.push({ name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={22} /> });
    navItems.push({ name: 'Settings', path: '/settings', icon: <Settings size={22} /> });
  } else if (user?.role === 'admin') {
    navItems.push({ name: 'Dashboard', path: '/admin-dashboard', icon: <Home size={22} /> });
    navItems.push({ name: 'Events', path: '/admin-forms', icon: <ClipboardList size={22} /> });
    navItems.push({ name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={22} /> });
    navItems.push({ name: 'Notifications', path: '/notifications', icon: <Bell size={22} /> });
    navItems.push({ name: 'Settings', path: '/settings', icon: <Settings size={22} /> });
  } else {
    // Student
    navItems.push({ name: 'Dashboard', path: '/dashboard', icon: <Home size={22} /> });
    navItems.push({ name: 'Profile', path: '/profile', icon: <User size={22} /> });
    navItems.push({ name: 'Registrations', path: '/events', icon: <ClipboardList size={22} /> });
    navItems.push({ name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={22} /> });
    navItems.push({ name: 'Notifications', path: '/notifications', icon: <Bell size={22} /> });
    navItems.push({ name: 'Badges', path: '/badges', icon: <Star size={22} /> });
    navItems.push({ name: 'Upload', path: '/upload', icon: <Upload size={22} /> });
    navItems.push({ name: 'Settings', path: '/settings', icon: <Settings size={22} /> });
  }

  const getPageTitle = () => {
    const path = location.pathname.substring(1).split('/')[0];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-gray-50 relative">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 mix-blend-screen filter blur-[120px] opacity-50 pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 mix-blend-screen filter blur-[120px] opacity-50 pointer-events-none -z-10"></div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-[280px] bg-surface/95 lg:bg-surface/50 border-r border-white/5 flex flex-col z-40 shrink-0 backdrop-blur-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 lg:p-8 flex items-center justify-between h-[80px] lg:h-[100px] border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-black text-white shadow-lg border border-white/20 shadow-primary/30">CR</div>
            <span className="text-xl lg:text-2xl font-black tracking-tight text-white">CampusRank</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 lg:px-6 py-6 lg:py-8 space-y-2 overflow-y-auto">
          <p className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 text-white shadow-[inset_4px_0_0_0_#6366F1]' : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-base lg:text-lg ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 lg:p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center space-x-4 px-4 py-3 lg:px-5 lg:py-4 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl lg:rounded-2xl transition-all font-bold">
            <LogOut size={22} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-[70px] md:h-[100px] text-gray-50 px-4 md:px-10 flex items-center justify-between shrink-0 sticky top-0 z-[100] w-full backdrop-blur-md mb-4 bg-gradient-to-b from-background to-transparent">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight truncate max-w-[150px] sm:max-w-xs md:max-w-md">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <div className="hidden lg:flex items-center bg-surfaceLight border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors w-64 shadow-inner">
              <Search size={18} className="text-gray-500" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder-gray-500" />
            </div>

            <NotificationDropdown />


            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div 
              onClick={() => navigate('/profile?openSettings=true')}
              className="flex items-center space-x-3 cursor-pointer p-1.5 md:p-2 md:pr-5 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all bg-surface shadow-sm shrink-0"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-black text-xs md:text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20 overflow-hidden">
                {user?.avatar_url ? (
                  <img src={`http://localhost:5000${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs md:text-sm font-bold text-white leading-tight truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] md:text-xs text-primary font-bold leading-tight">{user?.erp}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-10 pb-10">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
