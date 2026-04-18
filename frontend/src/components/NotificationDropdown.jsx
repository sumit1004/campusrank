import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-400" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-400" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full border border-white/5 transition-all duration-300 ${isOpen ? 'bg-primary/20 border-primary/30 text-white' : 'bg-surface hover:bg-white/5 text-gray-400 hover:text-white'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background shadow-lg shadow-red-500/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute right-0 mt-4 w-[320px] md:w-[380px] bg-surface border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-[9999] origin-top-right shadow-[#000000]/50"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black text-white">Notifications</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Stay updated</p>
              </div>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-full border border-primary/20 uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Bell className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">All caught up!</p>
                  <p className="text-gray-600 text-xs mt-1">No new notifications to show.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                      className={`p-5 flex gap-4 transition-all hover:bg-white/[0.03] cursor-pointer group relative ${!notif.is_read ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}
                      
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${!notif.is_read ? 'bg-primary/20 shadow-lg shadow-primary/10' : 'bg-white/5'}`}>
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={12} className="text-gray-600" />
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            {formatTime(notif.created_at)}
                          </span>
                        </div>
                      </div>

                      {!notif.is_read && (
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-primary transition-all self-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.2em] transition-all"
                >
                  Close Panel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
