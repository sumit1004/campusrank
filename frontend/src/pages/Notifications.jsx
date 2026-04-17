import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Bell, Clock, Info, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <div className="p-2.5 bg-green-500/10 text-green-400 rounded-xl"><CheckCircle size={20} /></div>;
      case 'warning': return <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl"><AlertTriangle size={20} /></div>;
      default: return <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl"><Info size={20} /></div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Notification Center</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1 opacity-70">Activity Log & Alerts</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-3 border-white/5 shadow-xl">
            <Bell className="text-primary" size={20} />
            <span className="text-white font-black text-lg">{notifications.filter(n => !n.is_read).length} Unread</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-gray-500 font-bold tracking-widest text-sm uppercase">Accessing records...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface/30 border-2 border-dashed border-white/5 rounded-[3rem] p-24 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 text-gray-700 border border-white/5">
            <Bell size={48} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">Total Silence</h3>
          <p className="text-gray-500 mt-3 font-semibold max-w-sm">You've cleared the queue! All frequencies are currently quiet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`glass-card p-6 md:p-8 rounded-[2rem] transition-all group relative overflow-hidden cursor-pointer ${!n.is_read ? 'border-primary/40 bg-primary/[0.03]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}
            >
              {!n.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              )}

              <div className="flex gap-6 md:gap-8 items-start">
                <div className={`transition-transform duration-300 ${!n.is_read ? 'scale-110 shadow-lg shadow-white/5' : ''}`}>
                  {getTypeIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                      <Clock size={12} />
                      {formatTimeAgo(n.created_at)}
                    </span>
                    {!n.is_read && (
                       <button 
                        className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5 self-start md:self-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                      >
                       <Check size={12} /> Mark Read
                      </button>
                    )}
                  </div>
                  <p className={`text-base md:text-lg leading-relaxed ${!n.is_read ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                    {n.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Notifications;
