import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUser } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, User, ChevronDown, Globe, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [filter, setFilter] = useState('monthly');
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const currentUser = getUser();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        setClubs(res.data.data || res.data);
      } catch (err) { }
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
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'club' && !selectedClubId && clubs.length > 0) {
      setSelectedClubId(clubs[0].id);
      return;
    }
    fetchLeaderboard();
  }, [activeTab, filter, selectedClubId, clubs]);

  const top3 = leaders.slice(0, 3);
  const others = leaders.slice(3, 10); // Show top 4 to 10 below podium

  // Find current user stats from full leaders list
  const currentUserStats = leaders.find(l => l.id === currentUser?.id);

  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push(top3[1]);
  if (top3[0]) podiumOrder.push(top3[0]);
  if (top3[2]) podiumOrder.push(top3[2]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Rankings <span className="text-indigo-500">Hub</span>
          </h1>
          <div className="h-1 w-24 bg-indigo-500 mt-2 rounded-full shadow-[0_0_15px_indigo]"></div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Main Tabs */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            {[
              { id: 'overall', icon: <Globe size={16} />, label: 'All Clubs' },
              { id: 'club', icon: <Users size={16} />, label: 'Seperate Clubs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filters */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            {['monthly', 'yearly', 'overall'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'club' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <div className="relative w-full max-w-xs group rounded-3xl  bg-blue/5 p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="w-full bg-black/5 border border-white/10 rounded-2xl py-3 pl-6 pr-12 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-bold"
            >
              <option value="" className='bg-black/90'> Select Club Context</option>
              {clubs.map(club => <option key={club.id} value={club.id} className='bg-black/90'>{club.name}</option>)}
            </select>
            <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-indigo-400 transition-colors" size={20} />
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Syncing Rankings...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-20 text-center">
          <User size={64} className="mx-auto text-gray-700 mb-6 opacity-20" />
          <h3 className="text-2xl font-black text-white/20 uppercase tracking-widest">No Competitors Found</h3>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Podium Section */}
          {/* Podium Section - Horizontal even on mobile */}
          <div className="flex justify-center items-end gap-1.5 sm:gap-6 pt-12 sm:pt-16">
            {podiumOrder.map((student, i) => {
              const isFirst = student.rank === 1;
              const isSecond = student.rank === 2;
              const isThird = student.rank === 3;

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col items-center flex-1 max-w-[120px] sm:max-w-[200px] order-${i === 1 ? '1' : i === 0 ? '0' : '2'}`}
                >
                  {/* Photo/Avatar Circle */}
                  <div className={`relative mb-2 sm:mb-4 group ${isFirst ? 'z-10' : 'z-0'}`}>
                    <div className={`w-16 h-16 sm:w-32 sm:h-32 rounded-3xl sm:rounded-full p-1 sm:p-1.5 bg-gradient-to-tr transition-all duration-500 rounded-[1.5rem] ${isFirst ? 'from-yellow-400 via-amber-200 to-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.3)] sm:scale-110' : isSecond ? 'from-slate-300 to-slate-500' : 'from-orange-400 to-orange-800'}`}>
                      <div className="w-full h-full rounded-[1.3rem] sm:rounded-full bg-[#0d0f14] border border-white/10 flex items-center justify-center relative overflow-hidden">
                        {student.avatar_url ? (
                          <img src={`http://localhost:5000${student.avatar_url}`} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`font-black text-white ${isFirst ? 'text-2xl sm:text-5xl' : 'text-xl sm:text-4xl'}`}>{student.name.charAt(0)}</span>
                        )}
                        {isFirst && <div className="absolute top-1 right-1"><Crown className="text-yellow-400" size={10} fill="currentColor" /></div>}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center w-full px-1">
                    <h3 className={`font-black uppercase tracking-tighter truncate ${isFirst ? 'text-[10px] sm:text-xl text-white' : 'text-[9px] sm:text-lg text-gray-400'}`}>{student.name}</h3>
                    <div className={`mt-1 sm:mt-2 inline-flex items-center gap-1 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full font-black text-[8px] sm:text-sm border ${isFirst ? 'bg-yellow-400/20 border-yellow-500/30 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                      {student.total_points} <span className="text-[6px] sm:text-[8px] opacity-60">PTS</span>
                    </div>
                  </div>

                  {/* Podium Block */}
                  <div className={`mt-4 sm:mt-8 w-full bg-gradient-to-b from-white/10 to-transparent border-t border-white/20 rounded-t-2xl sm:rounded-t-[2.5rem] transition-all flex flex-col items-center justify-center ${isFirst ? 'h-24 sm:h-48' : isSecond ? 'h-16 sm:h-32' : 'h-12 sm:h-24'}`}>
                    <span className={`text-xl sm:text-5xl font-black italic border-b-2 sm:border-b-4 ${isFirst ? 'text-yellow-400 border-yellow-400' : isSecond ? 'text-slate-400 border-slate-400' : 'text-orange-500 border-orange-500'}`}>{student.rank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* List Section */}
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode='popLayout'>
              {others.map((student, idx) => {
                const isMe = currentUser?.id === student.id;
                return (
                  <motion.div
                    layout
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative flex items-center p-6 rounded-[2rem] border transition-all hover:scale-[1.01] ${isMe ? 'bg-indigo-600/10 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex flex-col items-center pr-4 border-r border-white/5">
                      <span className={`text-xl font-black italic ${isMe ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}>#{student.rank}</span>
                      <TrendingUp size={10} className="text-green-500 mt-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex items-center px-6 gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all overflow-hidden`}>
                        {student.avatar_url ? (
                          <img src={`http://localhost:5000${student.avatar_url}`} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-tight">{student.name} {isMe && <span className="ml-2 px-2 py-0.5 bg-indigo-500 text-[8px] rounded-md">Self</span>}</h4>
                        <p className="text-[10px] font-mono text-gray-600">{student.erp}</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className={`text-2xl font-black ${isMe ? 'text-indigo-400' : 'text-white'}`}>{student.total_points}</span>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Points</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Minus size={10} className="text-gray-700" />
                        <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">Maintainance Grade</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Sticky User Stats Bar */}
      {currentUserStats && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-[#0d0f14]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <span className="text-xl sm:text-2xl font-black text-white italic">#{currentUserStats.rank}</span>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">Your Current Standing</h4>
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-xl font-black text-white uppercase italic tracking-tighter">{currentUserStats.name}</p>
                  <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black rounded uppercase">Self</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">Total Momentum</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-xl sm:text-3xl font-black text-indigo-400 italic tracking-tighter">{currentUserStats.total_points}</span>
                <span className="text-[9px] sm:text-xs font-black text-gray-600 uppercase tracking-widest">XP</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Note padding for sticky bar */}
      <div className="pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 group cursor-help">
          <Activity size={14} className="text-indigo-400 animate-pulse" />
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Rankings refresh in real-time on every score update</p>
        </div>
      </div>
    </div>
  );
};

const Activity = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default Leaderboard;

