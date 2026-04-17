import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Search, User, ChevronDown, Calendar, Globe, Users } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' or 'club'
  const [filter, setFilter] = useState('monthly'); // 'monthly' or 'yearly'
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');

  // Fetch clubs for the dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        setClubs(res.data.data || res.data);
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
    };
    fetchClubs();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const url = `/leaderboard?type=${activeTab}&filter=${filter}${activeTab === 'club' && selectedClubId ? `&club_id=${selectedClubId}` : ''}`;

      const res = await api.get(url);
      setLeaders(res.data.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If club tab is active but no club selected, don't fetch yet if we want to wait for selection
    if (activeTab === 'club' && !selectedClubId && clubs.length > 0) {
      setSelectedClubId(clubs[0].id);
      return;
    }
    fetchLeaderboard();
  }, [activeTab, filter, selectedClubId, clubs]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] border border-white/40 transform -rotate-3"><Crown size={20} /></div>;
      case 2: return <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(148,163,184,0.2)] border border-white/30"><Medal size={18} /></div>;
      case 3: return <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-700 to-yellow-900 text-white flex items-center justify-center shadow-[0_0_15px_rgba(180,83,9,0.2)] border border-white/20"><Medal size={18} /></div>;
      default: return <div className="w-8 h-8 rounded-lg bg-surface border border-white/5 text-gray-500 flex items-center justify-center font-bold text-sm">{rank}</div>;
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
      className="max-w-[1100px] mx-auto px-4 py-8 md:py-12 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            Leaderboard <Trophy className="text-yellow-500 hidden sm:block" size={36} />
          </h1>
          <p className="text-gray-400 font-medium mt-2 max-w-md">
            Rise through the ranks by contributing to your favorite clubs and earning points.
          </p>
        </div>

        {/* Time Filter Toggle */}
        <div className="flex p-1.5 bg-surfaceLight/50 backdrop-blur-md border border-white/10 rounded-2xl w-full md:w-auto shadow-inner">
          <button
            onClick={() => setFilter('monthly')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'monthly' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setFilter('yearly')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'yearly' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'overall' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <Globe size={16} /> OVERALL
          </button>
          <button
            onClick={() => setActiveTab('club')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'club' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <Users size={16} /> CLUB-WISE
          </button>

          {activeTab === 'club' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto w-full md:w-64"
            >
              <div className="relative">
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full bg-surfaceLight/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="">Select a Club</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard Table Container */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 w-24 text-center text-xs font-black text-gray-500 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Student Details</th>
                  <th className="px-8 py-6 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-bold tracking-widest text-sm animate-pulse uppercase">Fetching ranks...</span>
                      </div>
                    </td>
                  </tr>
                ) : leaders.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <User size={48} className="text-gray-500" />
                        <span className="text-gray-500 font-black tracking-widest text-sm uppercase">No data available for this period.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaders.map((student, idx) => {
                    const isTop3 = student.rank <= 3;
                    return (
                      <motion.tr
                        key={`${student.id}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group transition-all hover:bg-white/[0.02] ${isTop3 ? 'bg-primary/[0.02]' : ''}`}
                      >
                        <td className="px-8 py-5 text-center">
                          <div className="flex justify-center items-center h-full">
                            {getRankBadge(student.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border transition-all ${isTop3 ? 'bg-primary/20 border-primary/30 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'bg-surface border-white/5 text-gray-500'}`}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`font-black text-lg transition-all ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                                {student.name}
                              </div>
                              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                                {student.erp}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-2xl font-black ${isTop3 ? 'text-primary' : 'text-white'}`}>
                                {student.total_points}
                              </span>
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Points</span>
                            </div>
                            {isTop3 && (
                              <div className="flex items-center gap-1 text-[9px] font-black text-primary/60 uppercase tracking-widest mt-1">
                                <Star size={8} fill="currentColor" /> ELITE PERFORMANCE
                              </div>
                            )}
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
      </div>

      {/* Responsive Note */}
      <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] pt-4">
        Updated in real-time based on approved certificates
      </p>
    </motion.div>
  );
};

export default Leaderboard;

