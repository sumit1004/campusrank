import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Award, UploadCloud, ShieldAlert, FileText, Trophy, 
  ClipboardList, ChevronRight, Activity as ActivityIcon, 
  Clock, Download, ExternalLink, Zap, Plus, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user: authUser } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // 1 min sync
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/users/profile');
      setData(res.data.data);
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Unified Data...</p>
      </div>
    );
  }

  const { user, rank, approvedCount, pendingCount, eCertsCount, monthlyStats, activityLogs, certificates, manualHistory } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-6 space-y-8 max-w-7xl mx-auto px-4 sm:px-0"
    >
      {/* 🚀 ELITE HEADER & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#111827]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 w-full">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                   <Zap size={10} className="animate-pulse" /> Live Terminal
                 </span>
              </div>
              <h1 className="text-4xl font-black text-white mb-1 tracking-tight italic uppercase">
                Hello, {user?.name?.split(' ')[0]} <span className="text-indigo-500">.</span>
              </h1>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                 <div className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <ShieldAlert size={14} className="mr-2 text-indigo-500" /> ERP: {user?.erp}
                 </div>
                 <div className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <Trophy size={14} className="mr-2 text-yellow-400" /> Rank: #{rank}
                 </div>
              </div>
            </div>

            <div className="flex gap-4">
               <Link to="/leaderboard" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl transition-all border border-indigo-400/20 shadow-xl shadow-indigo-600/20 uppercase tracking-[0.15em]">
                Leaderboard
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <Link to="/upload" className="relative z-10 space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                 <Plus size={24} className="text-white" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">New Submission</p>
              <p className="text-[10px] font-bold text-white/60 uppercase">Manual XP Upload</p>
           </Link>
        </motion.div>
      </div>

      {/* 📊 ANALYTICS HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Graph */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111827]/60 border border-white/5 rounded-[3rem] p-10 flex flex-col shadow-2xl relative group overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full"></div>
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                <ActivityIcon size={24} className="text-indigo-500" />
                Growth Pattern
              </h2>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">Monthly XP accumulation history</p>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
               <span className="text-xl font-black text-white">{user.total_points}</span>
               <span className="text-[10px] text-gray-500 font-black ml-2 uppercase">Total PTS</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-6 relative px-4">
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 py-2">
                {[0, 1, 2, 3].map(line => (
                  <div key={line} className="w-full border-t border-white/5"></div>
                ))}
              </div>

            {monthlyStats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                 <p className="text-gray-600 text-xs font-black uppercase tracking-[0.2em]">Data intake pending...</p>
              </div>
            ) : (
              monthlyStats.map((stat, idx) => {
                const maxPoints = Math.max(...monthlyStats.map(s => s.points)) || 100;
                const heightPercentage = Math.max((stat.points / maxPoints) * 100, 10); 
                
                return (
                  <motion.div key={idx} className="flex-1 flex flex-col items-center gap-6 relative z-10 group" whileHover="hover">
                    <div className="w-full relative h-[220px] flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ delay: 0.1 + (idx * 0.05), type: 'spring', stiffness: 50 }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-2xl shadow-2xl relative"
                      >
                         <motion.div 
                            variants={{ initial: { opacity: 0, scale: 0.5 }, hover: { opacity: 1, scale: 1, y: -45 } }}
                            initial="initial"
                            className="absolute left-1/2 -translate-x-1/2 bg-white text-[#111827] text-xs font-black px-3 py-2 rounded-xl shadow-2xl z-20 pointer-events-none"
                          >
                            {stat.points} XP
                         </motion.div>
                      </motion.div>
                    </div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">{stat.month.substring(0, 3)}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Dynamic Activity Feed */}
        <motion.div variants={itemVariants} className="bg-[#111827]/80 border border-white/5 p-8 rounded-[3rem] shadow-xl flex flex-col h-full">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3 mb-8">
              <Clock size={16} className="text-indigo-500" />
              Live Activity
           </h4>
           <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {activityLogs.length === 0 ? (
                 <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest pt-10 text-center">System logs cleared</p>
              ) : (
                 activityLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-150 transition-all"></div>
                       <div>
                          <p className="text-[11px] font-bold text-gray-200 uppercase tracking-tight">{log.action_type.replace(/_/g, ' ')}</p>
                          <p className="text-[9px] text-gray-600 font-black mt-1">{new Date(log.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </motion.div>
      </div>

      {/* 📋 MANUAL SUBMISSION TRACKER (RESTORED & IMPROVED) */}
      <motion.div variants={itemVariants} className="bg-[#111827]/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 justify-center md:justify-start">
              <UploadCloud className="text-indigo-500" size={28} />
              Manual Upload Status
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Tracking verification progress of self-uploaded records</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <div className="px-6 py-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                <p className="text-lg font-black text-yellow-500">{pendingCount}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase">In Queue</p>
             </div>
             <div className="px-6 py-4 bg-green-500/5 border border-green-500/10 rounded-2xl text-center">
                <p className="text-lg font-black text-green-500">{approvedCount}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase">Verified</p>
             </div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          <table className="w-full text-left min-w-[700px]">
             <thead className="bg-[#0B0F19]/50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5 sticky top-0 z-10">
                <tr>
                   <th className="px-8 py-6">Achievement Unit</th>
                   <th className="px-8 py-6 text-center">Submission Proof</th>
                   <th className="px-8 py-6">Current Status</th>
                   <th className="px-8 py-6 text-right">Verification Date</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {manualHistory.length === 0 ? (
                   <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-600 font-black uppercase text-xs italic tracking-widest">No manual submissions detected in frequency</td></tr>
                ) : (
                   manualHistory.map((m, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                         <td className="px-8 py-8">
                            <div className="font-black text-white text-base uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{m.event_name}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{m.club_name} • {m.position}</div>
                         </td>
                         <td className="px-8 py-8 text-center">
                            <a href={`http://localhost:5000${m.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                               <FileText size={14} /> Download
                            </a>
                         </td>
                         <td className="px-8 py-8">
                            <div className="flex items-center gap-3">
                               {m.status === 'approved' ? <CheckCircle2 size={16} className="text-green-500" /> : m.status === 'rejected' ? <XCircle size={16} className="text-red-500" /> : <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>}
                               <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'approved' ? 'text-green-500' : m.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                 {m.status}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-8 text-right font-black text-gray-600 text-xs">
                            {new Date(m.created_at).toLocaleDateString()}
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
        </div>
      </motion.div>

      {/* 🏆 E-CERTIFICATE ACHIEVEMENTS */}
      {eCertsCount > 0 && (
         <motion.div variants={itemVariants} className="bg-[#111827]/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                     <Award className="text-indigo-400" size={30} />
                     Verified Digital Assets
                  </h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Self-generating university E-Certificates</p>
               </div>
               <Link to="/profile" className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] border-b border-indigo-500/30 pb-1">Review All Data</Link>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.filter(c => c.source === 'e_certificate').slice(0, 6).map((c, i) => (
                     <div key={i} className="bg-[#0B0F19] border border-white/5 p-8 rounded-[2rem] group hover:border-indigo-500 transition-all relative">
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                              <ShieldAlert size={20} className="text-indigo-400" />
                           </div>
                           <span className="text-[8px] font-black text-green-500 uppercase tracking-widest px-2 py-1 bg-green-500/5 rounded-md">Verified</span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1 truncate">{c.event_name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-8">{c.position} • {new Date(c.created_at).toLocaleDateString()}</p>
                        <a href={`http://localhost:5000${c.url}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-[0.15em]">
                           <Download size={14} /> Download E-Cert
                        </a>
                     </div>
                  ))}
               </div>
            </div>
         </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
