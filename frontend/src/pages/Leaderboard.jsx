import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Search, User } from 'lucide-react';

const pageVariants = { initial: { opacity: 0, scale: 0.98 }, in: { opacity: 1, scale: 1 }, out: { opacity: 0, scale: 0.98 } };

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboard = async (search = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard?search=${search}`);
      setLeaders(res.data.data);
      setCurrentUserData(res.data.currentUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeaderboard(searchTerm);
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)] border-t border-white/40 transform scale-105"><Crown size={16} /></div>;
      case 2: return <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(148,163,184,0.1)] border-t border-white/30"><Medal size={14} /></div>;
      case 3: return <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-700 to-yellow-900 text-white flex items-center justify-center shadow-[0_0_10px_rgba(180,83,9,0.1)] border-t border-white/20"><Medal size={14} /></div>;
      default: return <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-surface border border-white/5 text-gray-500 flex items-center justify-center font-bold text-xs">{rank}</div>;
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.5, type: 'spring' }} className="max-w-[1000px] mx-auto space-y-4 md:space-y-8 pb-24 md:pb-32 px-1">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 mb-1 md:mb-2">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 mb-1.5 md:mb-3 text-primary font-bold text-[9px] md:text-xs tracking-wider">
            <Star size={10} fill="currentColor" />
            <span>GLOBAL STANDINGS</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">Master the Ranks</h1>
          <p className="text-xs md:text-base text-gray-400 font-medium md:mt-1 hidden sm:block">Dominate the leaderboard by staying active.</p>
        </div>

        {/* Search Bar - Compact */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search name or ERP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface/30 backdrop-blur-md border border-white/5 rounded-lg py-2 md:py-3 pl-9 pr-4 text-xs md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/40 transition-all shadow-md"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
        </form>
      </div>

      <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="absolute top-[-50%] left-[20%] w-[500px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2"></div>
        
        <div className="overflow-x-auto relative z-10 w-full no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/60 backdrop-blur-xl border-b border-white/5 uppercase tracking-[0.1em] text-[8px] md:text-[10px] text-gray-500 font-black">
                <th className="px-4 py-2 md:py-4 w-12 md:w-20 text-center">Rank</th>
                <th className="px-2 py-2 md:py-4">Student</th>
                <th className="px-4 py-2 md:py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest animate-pulse">Scanning matrix...</td>
                </tr>
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[10px] font-black text-gray-700 uppercase tracking-widest">Zero matches found.</td>
                </tr>
              ) : (
                leaders.map((student, idx) => {
                  const isTop3 = student.rank <= 3;
                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={student.id}
                      className={`group transition-all hover:bg-white/[0.02] ${isTop3 ? 'bg-primary/[0.03]' : ''}`}
                    >
                      <td className="px-2 py-2 md:py-3 text-center align-middle">
                        <div className="flex justify-center">{getRankBadge(student.rank)}</div>
                      </td>
                      <td className="px-1 py-2 md:py-3">
                        <div className="flex items-center space-x-2 md:space-x-4">
                          <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full border flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 ${isTop3 ? 'bg-surface border-white/10 text-white' : 'bg-surfaceLight border-transparent text-gray-500 shadow-inner'}`}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-bold text-xs md:text-base ${isTop3 ? 'text-white' : 'text-gray-300'} truncate`}>{student.name}</div>
                            <div className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-tight">{student.erp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 md:py-3 text-right">
                        <div className={`inline-flex items-center space-x-1 px-2 py-0.5 md:py-1 rounded border ${isTop3 ? 'bg-primary/10 border-primary/20' : 'bg-surfaceLight border-white/5'}`}>
                          <span className={`font-black text-xs md:text-lg ${isTop3 ? 'text-white' : 'text-gray-400'}`}>{student.total_points}</span>
                          <span className="text-gray-600 font-black text-[7px] md:text-[9px] uppercase tracking-tighter">pts</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logged in User Bar - Ultra Compact */}
      <AnimatePresence>
        {currentUserData && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[600px] z-50 px-2"
          >
            <div className="bg-indigo-600 border border-white/10 rounded-xl p-2.5 md:p-3 shadow-2xl flex items-center justify-between gap-3 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-50"></div>
              
              <div className="flex items-center space-x-3 relative z-10 shrink-0">
                <div className="flex flex-col items-center justify-center bg-white/20 rounded-lg w-9 h-9 md:w-11 md:h-11 shadow-inner">
                  <span className="text-[7px] md:text-[8px] font-black text-white/70 uppercase leading-none mb-0.5">Rank</span>
                  <span className="text-sm md:text-lg font-black text-white leading-none">{currentUserData.rank}</span>
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-[11px] md:text-sm leading-tight truncate">Your Standing</h4>
                  <p className="text-indigo-100 text-[8px] md:text-[10px] font-bold opacity-80 uppercase tracking-tighter truncate max-w-[120px] sm:max-w-none">{currentUserData.name.split(' ')[0]} • {currentUserData.erp}</p>
                </div>
              </div>

              <div className="flex flex-col items-end relative z-10 shrink-0">
                <p className="text-indigo-200 text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-80">Total Points</p>
                <div className="flex items-baseline space-x-0.5">
                  <span className="text-lg md:text-2xl font-black text-white leading-none tracking-tight">{currentUserData.total_points}</span>
                  <span className="text-indigo-100 font-bold text-[8px] md:text-[10px] uppercase opacity-80">pts</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default Leaderboard;
