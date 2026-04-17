import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, Mail, Hash, BookOpen, GraduationCap, 
  Award, Trophy, ClipboardList, Activity as ActivityIcon, 
  ChevronRight, Edit3, Download, ExternalLink, ShieldCheck, Clock, CheckCircle2, XCircle, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    branch: '',
    semester: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setProfileData(res.data.data);
      setEditForm({
        branch: res.data.data.user.branch || 'Unspecified',
        semester: res.data.data.user.semester || 'Not Set'
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', editForm);
      const updatedUser = { ...user, ...editForm };
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Identity...</p>
      </div>
    );
  }

  const { rank, certificates, approvedCount, pendingCount, eCertsCount, monthlyStats, activityLogs, manualHistory } = profileData;

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
      {/* HEADER SECTION - IDENTITY CARD */}
      <motion.div variants={itemVariants} className="bg-[#111827]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl group-hover:rotate-6 transition-transform duration-500">
              {user.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-2xl border-4 border-[#111827] shadow-xl"></div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">{user.name}</h1>
                 <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest">{user.role}</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                <span className="flex items-center gap-2"><Mail size={14} className="text-indigo-500" /> {user.email}</span>
                <span className="flex items-center gap-2"><Hash size={14} className="text-indigo-500" /> {user.erp}</span>
                {user.role !== 'superadmin' && (
                  <>
                    <span className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-500" /> {user.branch || 'Unspecified'}</span>
                    <span className="flex items-center gap-2"><GraduationCap size={14} className="text-indigo-500" /> Sem {user.semester || 'N/A'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-2xl transition-all border border-white/10 uppercase tracking-widest shadow-xl flex items-center gap-3"
          >
            <Edit3 size={14} /> Edit Identity
          </button>
        </div>
      </motion.div>

      {/* STATS GRID - STUDENT ONLY */}
      {user.role === 'student' && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total XP', value: user.total_points, icon: <Award className="text-indigo-400" />, color: 'from-indigo-500/10 to-transparent' },
            { label: 'Global Rank', value: `#${rank}`, icon: <Trophy className="text-yellow-400" />, color: 'from-yellow-500/10 to-transparent' },
            { label: 'Certificates', value: eCertsCount, icon: <ShieldCheck className="text-green-400" />, color: 'from-green-500/10 to-transparent' },
            { label: 'History', value: approvedCount, icon: <ClipboardList className="text-blue-400" />, color: 'from-blue-500/10 to-transparent' }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} bg-[#111827]/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group shadow-xl transition-all hover:translate-y-[-4px]`}>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="p-4 bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
               </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* VERIFIED DIGITAL ASSETS (FULL LIST) */}
      {user.role === 'student' && eCertsCount > 0 && (
         <motion.div variants={itemVariants} className="bg-[#111827]/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 mb-10">
               <ShieldCheck className="text-indigo-500" size={30} />
               Verified Digital Assets
            </h2>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {certificates.filter(c => c.source === 'e_certificate').map((c, i) => (
                     <div key={i} className="bg-[#0B0F19] border border-white/5 p-8 rounded-[2rem] group hover:border-indigo-500 transition-all relative">
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                              <Award size={20} className="text-indigo-400" />
                           </div>
                           <span className="text-[8px] font-black text-green-500 uppercase tracking-widest px-2 py-1 bg-green-500/5 rounded-md">Verified Asset</span>
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

      {/* ACHIEVEMENT REGISTRY TABLE */}
      {user.role === 'student' && (
         <motion.div variants={itemVariants} className="bg-[#111827]/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 mb-10">
               <Trophy className="text-yellow-400" size={30} />
               System Registry
            </h2>
            <div className="max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="text-gray-500 text-[11px] uppercase font-black tracking-widest border-b border-white/5 sticky top-0 bg-[#111827] z-10">
                     <tr>
                        <th className="px-8 py-6">Success Unit</th>
                        <th className="px-8 py-6">Source Type</th>
                        <th className="px-8 py-6">Position</th>
                        <th className="px-8 py-6 text-right">XP Earned</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {certificates.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-8 py-8">
                              <div className="font-black text-white text-base uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{p.event_name}</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{new Date(p.created_at).toLocaleDateString()}</div>
                           </td>
                           <td className="px-8 py-8">
                              <span className={`px-2 py-1 text-[9px] font-black rounded-md uppercase tracking-wider ${p.source === 'e_certificate' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                 {p.source === 'e_certificate' ? 'E-Certificate' : 'Manual Upload'}
                              </span>
                           </td>
                           <td className="px-8 py-8 font-black text-gray-400 text-xs uppercase tracking-widest">{p.position}</td>
                           <td className="px-8 py-8 text-right font-black text-white text-xl italic tracking-tighter">
                              +{p.source === 'e_certificate' ? '50' : '20'}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MANUAL SUBMISSION TRACKER */}
        {user.role === 'student' && (
           <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111827] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 mb-8">
                 <UploadCloud className="text-indigo-500" size={24} />
                 Manual Tracking
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                 {manualHistory.length === 0 ? (
                    <p className="text-gray-600 text-[10px] font-black uppercase text-center py-10">No manual uploads detected</p>
                 ) : (
                    manualHistory.map((m, i) => (
                       <div key={i} className="bg-[#0B0F19] p-6 rounded-2xl flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                          <div className="space-y-1">
                             <h4 className="text-white font-black uppercase italic tracking-tighter">{m.event_name}</h4>
                             <p className="text-[10px] text-gray-500 font-bold uppercase">{m.club_name} • {m.position}</p>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'approved' ? 'text-green-500' : m.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{m.status}</span>
                                <p className="text-[9px] text-gray-600 font-black uppercase">{new Date(m.created_at).toLocaleDateString()}</p>
                             </div>
                             <a href={`http://localhost:5000${m.file_url}`} target="_blank" rel="noreferrer" className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"><ExternalLink size={16} /></a>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </motion.div>
        )}

        {/* RECENT ACTIVITY LOGS */}
        <motion.div variants={itemVariants} className="bg-[#111827] border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col h-full">
           <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
              <Clock size={16} className="text-indigo-500" />
              Activity Stream
           </h2>
           <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
              {activityLogs.length === 0 ? (
                 <p className="text-gray-600 text-[10px] font-black uppercase text-center pt-20">No system events logs</p>
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

      {/* IDENTITY MODAL */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#0B0F19]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-[3rem] p-10 shadow-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity Core</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white transition-colors">&times;</button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Branch</label>
                  <input type="text" value={editForm.branch} onChange={(e) => setEditForm({...editForm, branch: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-indigo-500 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Semester</label>
                  <input type="text" value={editForm.semester} onChange={(e) => setEditForm({...editForm, semester: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-indigo-500 outline-none transition-all font-bold" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-600/20 uppercase tracking-widest">Deploy Changes</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
