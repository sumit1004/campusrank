import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Lock, CheckCircle, ChevronRight, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const BADGE_LEVELS = [
  { id: 'level1', name: 'Level 1', points: 500, image: '/badges/starter_badge.png', color: 'from-amber-400 to-amber-700' },
  { id: 'level2', name: 'Level 2', points: 800, image: '/badges/rising_badge.png', color: 'from-slate-300 to-slate-500' },
  { id: 'level3', name: 'Level 3', points: 1000, image: '/badges/pro_badge.png', color: 'from-yellow-300 to-yellow-600' },
  { id: 'elite', name: 'Legend', points: 1500, image: '/badges/legend_badge.png', color: 'from-indigo-400 to-purple-600' },
];

const Badges = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const badgeCardRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
    } catch (err) {
      toast.error("Failed to load badge profile");
    } finally {
      setLoading(false);
    }
  };

  const downloadBadge = async (badgeName) => {
    const element = document.getElementById(`badge-card-${badgeName}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `CampusRank_${badgeName}_Badge.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`${badgeName} badge downloaded!`);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  const currentPoints = profile?.total_points || 0;
  const nextBadge = profile?.nextBadge;
  const progressPercent = nextBadge ? Math.min((currentPoints / nextBadge.points) * 100, 100) : 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* Header Profile Section */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl border-4 border-white/10 shrink-0">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{profile?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-widest">
                ERP: {profile?.erp}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Star size={14} fill="currentColor" /> {profile?.badge !== 'None' ? profile?.badge : 'Newcomer'}
              </span>
            </div>
            
            <div className="mt-6 max-w-md mx-auto md:mx-0">
              <div className="flex justify-between items-end mb-2">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Growth Progress</p>
                <p className="text-white font-black text-sm">{currentPoints} <span className="text-gray-500 text-[10px]">/ {nextBadge ? nextBadge.points : 'Max'} PTS</span></p>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
              </div>
              {nextBadge ? (
                <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-tight text-center md:text-left">
                  {nextBadge.points - currentPoints} points remaining until <span className="text-indigo-400">{nextBadge.name}</span>
                </p>
              ) : (
                <p className="text-[10px] text-accent font-black mt-2 uppercase tracking-tight text-center md:text-left italic">
                  Maximum Level Reached! You are elite.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto px-2">
        {BADGE_LEVELS.map((badge, idx) => {
          const isUnlocked = currentPoints >= badge.points;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-10 rounded-[3rem] border transition-all duration-500 relative group overflow-hidden ${
                isUnlocked 
                ? 'bg-surface/60 border-indigo-500/30 shadow-xl shadow-indigo-500/5' 
                : 'bg-surface/20 border-white/5 opacity-60'
              }`}
            >
              {/* Card Glow Effect */}
              {isUnlocked && (
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${badge.color} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity rounded-full`}></div>
              )}

              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div 
                  id={`badge-card-${badge.name}`}
                  className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105 overflow-hidden ${
                  !isUnlocked && 'grayscale opacity-50'
                }`}>
                  <img src={badge.image} alt={badge.name} className="w-full h-full object-cover scale-[1.1]" />
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>
                  )}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Lock size={32} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className={`font-black text-xl tracking-tight ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Requirement: {badge.points} PTS
                  </p>
                </div>

                <div className="w-full pt-4">
                  {isUnlocked ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-1.5 text-green-400 font-black text-[10px] uppercase tracking-wider bg-green-500/10 py-1.5 rounded-full border border-green-500/20">
                        <CheckCircle size={12} />
                        <span>Unlocked</span>
                      </div>
                      <button 
                        onClick={() => downloadBadge(badge.name)}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-all text-xs font-bold shadow-lg shadow-primary/20"
                      >
                        <Download size={14} />
                        <span>Download PNG</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-1.5 text-gray-600 font-black text-[10px] uppercase tracking-wider bg-white/5 py-1.5 rounded-full border border-white/5">
                      <Lock size={12} />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex items-start gap-4">
        <Award className="text-indigo-400 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-white font-bold mb-1">How it works</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Badges are a symbol of your achievement in the university ecosystem. You earn points by getting your event certificates approved by club admins. Once you cross a milestone, your digital badge is automatically unlocked and available for download.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Badges;
