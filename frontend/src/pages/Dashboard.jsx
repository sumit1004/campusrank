import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
   Award, UploadCloud, ShieldAlert, FileText, Trophy,
   Activity as ActivityIcon, Clock, Download, ExternalLink,
   Zap, Plus, CheckCircle2, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

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
         className="py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-0"
      >
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <motion.div variants={itemVariants} className="md:col-span-3 bg-[#111319] border border-white/5 p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none hidden sm:block"></div>

               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 relative z-10 w-full">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                           <Zap size={10} className="animate-pulse" /> Live Terminal
                        </span>
                     </div>
                     <div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight italic uppercase">
                           Hello, {user?.name?.split(' ')[0]}<span className="text-indigo-500">.</span>
                        </h1>
                        <p className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Dashboard is synced and active.</p>
                     </div>

                     <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                        <div className="flex items-center bg-white/5 border border-white/5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                           <ShieldAlert size={14} className="mr-2 text-indigo-500" /> ERP | {user?.erp}
                        </div>
                        <div className="flex items-center bg-white/5 border border-white/5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                           <Trophy size={14} className="mr-2 text-amber-400" /> Global Rank | #{rank}
                        </div>
                     </div>
                  </div>

                  <div className="flex w-full sm:w-auto sm:gap-4 self-start md:self-auto">
                     <Link to="/leaderboard" className="w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all border border-indigo-400/20 shadow-xl shadow-indigo-600/20 uppercase tracking-[0.15em] hover:-translate-y-1">
                        Leaderboard
                     </Link>
                  </div>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 sm:p-5 rounded-3xl sm:rounded-[2rem] flex flex-col justify-center items-center text-center shadow-[0_15px_30px_rgba(79,70,229,0.3)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
               <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
               <Link to="/upload" className="relative z-10 space-y-2 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl">
                     <Plus size={20} className="text-white" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-white uppercase tracking-widest">New Upload</p>
                     <p className="text-[9px] font-bold text-white/60 uppercase mt-0.5">Manual XP Source</p>
                  </div>
               </Link>
            </motion.div>
         </div>

         {/* 📊 ANALYTICS HUB */}
         <div className="grid grid-cols-1 gap-4 sm:gap-8">

            {/* Performance Graph */}
            <motion.div variants={itemVariants} className="bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 flex flex-col shadow-2xl relative group overflow-hidden">
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none hidden sm:block"></div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4 w-full">
                  <div>
                     <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                        <ActivityIcon size={20} className="text-indigo-500 sm:w-6 sm:h-6" />
                        Growth Pattern
                     </h2>
                     <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold mt-1 uppercase tracking-widest hidden sm:block">Monthly XP accumulation history</p>
                  </div>
                  <div className="bg-white/5 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                     <span className="text-xl sm:text-2xl font-black text-white">{user.total_points}</span>
                     <span className="text-[8px] sm:text-[9px] text-indigo-400 font-black uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-lg">Total XP</span>
                  </div>
               </div>

               <div className="flex-1 w-full flex items-end justify-between gap-2 sm:gap-6 min-h-[220px] relative px-2 sm:px-6">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4">
                     {[0, 1, 2, 3].map(line => (
                        <div key={line} className="w-full border-t border-dashed border-white/20"></div>
                     ))}
                  </div>

                  {monthlyStats.length === 0 ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl">Data intake pending...</p>
                     </div>
                  ) : (
                     monthlyStats.map((stat, idx) => {
                        const maxPoints = Math.max(...monthlyStats.map(s => s.points)) || 100;
                        const heightPercentage = Math.max((stat.points / maxPoints) * 100, 5);

                        return (
                           <div key={idx} className="flex-1 flex flex-col items-center gap-4 relative z-10 group h-full justify-end">
                              <div className="w-full max-w-[48px] relative flex flex-col justify-end items-center h-full">
                                 {/* Permanent Label Above Bar */}
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                    className="mb-2 text-[10px] sm:text-xs font-black text-white bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                 >
                                    +{stat.points}
                                 </motion.div>

                                 <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.1 + (idx * 0.05), ease: "easeOut" }}
                                    className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-2xl relative shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex flex-col justify-start"
                                 >
                                    <div className="w-full h-2 bg-white/30 rounded-full mt-1.5 mx-auto w-3/4"></div>
                                 </motion.div>
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.month.substring(0, 3)}</p>
                           </div>
                        );
                     })
                  )}
               </div>
            </motion.div>
         </div>

         {/* 📋 MANUAL SUBMISSION TRACKER */}
         <motion.div variants={itemVariants} className="bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none hidden sm:block"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 relative z-10">
               <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                     <UploadCloud className="text-indigo-500 sm:w-6 sm:h-6" size={20} />
                     Manual Upload Status
                  </h2>
                  <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hidden sm:block">Tracking verification progress of self-uploaded records</p>
               </div>
               <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="px-5 py-3 bg-[#1A1F2B] border border-yellow-500/20 rounded-2xl flex items-center gap-4 shrink-0">
                     <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">In Queue</p>
                        <p className="text-lg font-black text-white leading-none">{pendingCount}</p>
                     </div>
                  </div>
                  <div className="px-5 py-3 bg-[#1A1F2B] border border-green-500/20 rounded-2xl flex items-center gap-4 shrink-0">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verified</p>
                        <p className="text-lg font-black text-white leading-none">{approvedCount}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto relative z-10 pb-4 max-h-[350px] lg:max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
               <div className="min-w-[500px] sm:min-w-[800px]">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                     <thead className="sticky top-0 bg-[#111319] z-20">
                        <tr className="text-gray-500 text-[9px] uppercase font-black tracking-widest">
                           <th className="px-6 py-4 bg-white/[0.02] rounded-l-2xl">Achievement Unit</th>
                           <th className="px-6 py-4 bg-white/[0.02] text-center">Submission Proof</th>
                           <th className="px-6 py-4 bg-white/[0.02]">Current Status</th>
                           <th className="px-6 py-4 bg-white/[0.02] rounded-r-2xl text-right">Date</th>
                        </tr>
                     </thead>
                     <tbody>
                        {manualHistory.length === 0 ? (
                           <tr><td colSpan="4" className="px-6 py-12 text-center flex-col items-center justify-center">
                              <UploadCloud size={30} className="text-gray-600 mx-auto mb-3 opacity-50" />
                              <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">No manual submissions detected</p>
                           </td></tr>
                        ) : (
                           manualHistory.map((m, i) => (
                              <tr key={i} className="group transition-all">
                                 <td className="px-6 py-3 bg-white/[0.02] rounded-l-2xl group-hover:bg-white/[0.04]">
                                    <div className="font-black text-white text-xs sm:text-sm uppercase italic tracking-tighter truncate max-w-[250px] group-hover:text-indigo-400 transition-colors leading-none">{m.event_name}</div>
                                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.05em] mt-1 italic">{m.club_name} • {m.position}</div>
                                 </td>
                                 <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] text-center">
                                    <a href={`http://localhost:5000${m.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                                       <FileText size={12} /> View
                                    </a>
                                 </td>
                                 <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                       {m.status === 'approved' ? <CheckCircle2 size={14} className="text-green-500" /> : m.status === 'rejected' ? <XCircle size={14} className="text-red-500" /> : <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse ml-1 mr-0.5"></div>}
                                       <span className={`text-[9px] font-black uppercase tracking-widest ${m.status === 'approved' ? 'text-green-500' : m.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                          {m.status}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-3 sm:px-6 py-3 bg-white/[0.02] rounded-r-2xl group-hover:bg-white/[0.04] text-right font-black text-gray-500 text-[10px] sm:text-[10px] tracking-widest leading-none">
                                    {new Date(m.created_at).toLocaleDateString()}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </motion.div>

         {/* 🏆 E-CERTIFICATE ACHIEVEMENTS */}
         {eCertsCount > 0 && (
            <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#111319] to-[#0d0f14] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-4">
                  <div>
                     <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                        <Award className="text-indigo-400 sm:w-6 sm:h-6" size={20} />
                        Verified Digital Assets
                     </h2>
                     <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 hidden sm:block">Self-generating university E-Certificates</p>
                  </div>
                  <Link to="/profile" className="text-[9px] sm:text-[10px] w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-black text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                     Review All <ExternalLink size={12} />
                  </Link>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-h-[400px] lg:max-h-[520px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
                  {certificates.filter(c => c.source === 'e_certificate').map((c, i) => (
                     <div key={i} className="bg-[#161a23] border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] group hover:border-indigo-500/50 hover:bg-[#1a1f2b] transition-all relative overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-center mb-1 relative z-10 gap-4">
                           <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate flex-1">{c.event_name}</h4>
                           <div className="flex gap-2">
                              <a href={`http://localhost:5000${c.url}`} target="_blank" rel="noreferrer" title="Download E-Cert" className="p-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-colors border border-indigo-500/20">
                                 <Download size={14} />
                              </a>
                              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                 <ShieldAlert size={14} className="text-indigo-400" />
                              </div>
                           </div>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest relative z-10 flex items-center justify-between">
                           <span>{c.position}</span>
                           <span className="text-gray-600 tracking-tighter">{new Date(c.created_at).toLocaleDateString()}</span>
                        </p>
                     </div>
                  ))}
               </div>
            </motion.div>
         )}
      </motion.div>
   );
};

export default Dashboard;
