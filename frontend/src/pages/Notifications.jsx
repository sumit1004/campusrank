import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Bell, Clock, Info, ShieldAlert, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
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

  const getTargetIcon = (type) => {
    switch (type) {
      case 'all_students': return <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><User size={18} /></div>;
      case 'all_admins': return <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><ShieldAlert size={18} /></div>;
      case 'single_user': return <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><User size={18} /></div>;
      default: return <div className="p-2 bg-gray-500/10 text-gray-400 rounded-lg"><Bell size={18} /></div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Center of Alerts</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1 opacity-70">Notifications</p>
        </div>
        <div className="bg-surface border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
          <Bell className="text-primary animate-bounce-slow" size={20} />
          <span className="text-white font-black text-sm">{notifications.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface/30 border-2 border-dashed border-white/5 rounded-3xl p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-700">
            <Bell size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">Silence in the frequencies</h3>
          <p className="text-gray-600 mt-2 font-medium max-w-sm">No new broadcasts or personalized notifications found in your terminal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface/50 backdrop-blur-md border border-white/5 p-5 md:p-6 rounded-2xl hover:border-primary/30 transition-all group relative overflow-hidden"
            >
              {/* Vertical accent bar based on target */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${n.target_type === 'all_students' ? 'bg-blue-500' :
                n.target_type === 'all_admins' ? 'bg-purple-500' : 'bg-indigo-500'
                } opacity-40`}></div>

              <div className="flex gap-4 md:gap-6 items-start">
                {getTargetIcon(n.target_type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-white leading-tight pr-4">{n.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5 flex items-center gap-1.5 shrink-0">
                        <Clock size={10} />
                        {formatTimeAgo(n.created_at)}
                      </span>
                      {n.target_type === 'single_user' && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Private</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{n.message}</p>
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
