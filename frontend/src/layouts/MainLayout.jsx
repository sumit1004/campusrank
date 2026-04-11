import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Trophy, Upload, LogOut } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Upload Certificate', path: '/upload', icon: <Upload size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-darker overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel border-r border-y-0 border-l-0 flex flex-col z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex justify-center items-center font-bold text-lg text-white shadow-lg shadow-primary/30">CR</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">CampusRank</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-primary/20 text-primary-400 border border-primary/30 shadow-[0_0_10px_rgba(109,40,217,0.1)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className={({isActive}) => isActive ? 'text-primary' : ''}>{item.icon}</div>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-medium text-gray-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.erp}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Feature Content Outlet */}
      <main className="flex-1 relative overflow-y-auto w-full z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default MainLayout;
