import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User, Mail, Hash, BookOpen, GraduationCap,
  Award, Trophy, ClipboardList, Activity as ActivityIcon,
  ChevronRight, Edit3, Download, ExternalLink, ShieldCheck,
  Clock, CheckCircle2, XCircle, UploadCloud, FileText, Share2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../utils/urlHelper';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    course: '',
    branch: '',
    semester: '',
    college: ''
  });

  useEffect(() => {
    fetchProfile();

    // Check if we should open settings automatically
    const params = new URLSearchParams(location.search);
    if (params.get('openSettings') === 'true') {
      setIsEditing(true);
    }
  }, [location]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfileData(res.data.data);
      const { user: profileUser } = res.data.data;
      setEditForm({
        course: profileUser.course || 'Not Set',
        branch: profileUser.branch || 'Unspecified',
        semester: profileUser.semester || 'Not Set',
        college: profileUser.college || 'Rungta International Skills University',
        avatar_url: profileUser.avatar_url || null
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setEditForm(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
        const updatedUser = { ...user, avatar_url: res.data.avatar_url };
        updateUser(updatedUser);
        toast.success("Avatar updated");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Failed to upload avatar");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', editForm);
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
  const currentTotalXP = profileData.user.total_points;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const maxPoints = Math.max(...(monthlyStats?.map(s => s.points) || [0]), 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-0"
    >
      {/* HEADER SECTION - IDENTITY CARD */}
      <motion.div variants={itemVariants} className="bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 via-indigo-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none hidden sm:block"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 relative z-10 w-full">
          {/* Avatar Area */}
          <div className="relative group">
            <div className={`w-36 h-36 sm:w-48 sm:h-48 rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-tr from-indigo-600 via-indigo-400 to-indigo-800 p-1 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-500 group-hover:rotate-6 overflow-hidden`}>
              <div className="w-full h-full rounded-[2.3rem] sm:rounded-[3.3rem] bg-[#0d1117] flex items-center justify-center border-4 border-white/5 relative overflow-hidden">
                {editForm.avatar_url ? (
                  <img
                    src={getAssetUrl(editForm.avatar_url)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl sm:text-8xl font-black text-white italic drop-shadow-2xl">
                    {user.name.charAt(0)}
                  </span>
                )}

                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                  <Camera size={32} className="text-white mb-2" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>
            {/* Identity Rings */}
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl -z-10 animate-pulse"></div>
            <div className="absolute top-2 right-2 p-3 bg-emerald-500 rounded-2xl border-4 border-[#090b10] shadow-xl">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-5">
            <div className="md:max-w-3xl">
              <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter peer">{user.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    {user.role}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse sm:hidden"></div>
                </div>
              </div>

              {/* Mobile Profile Information Grid (Visible only on Desktop) */}
              <div className="hidden sm:grid grid-cols-2 lg:flex lg:flex-wrap justify-center md:justify-start gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                  <Mail size={12} className="text-indigo-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                  <Hash size={12} className="text-indigo-500 shrink-0" />
                  <span>{user.erp}</span>
                </div>
                {user.role !== 'superadmin' && (
                  <>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                      <FileText size={12} className="text-indigo-500 shrink-0" />
                      <span>{editForm.course}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                      <BookOpen size={12} className="text-indigo-500 shrink-0" />
                      <span>{editForm.branch}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                      <GraduationCap size={12} className="text-indigo-500 shrink-0" />
                      <span>Sem {editForm.semester}</span>
                    </div>
                    {editForm.college && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl text-amber-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                        <GraduationCap size={12} className="text-amber-400 shrink-0" />
                        <span className="truncate">{editForm.college}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto justify-center px-6 py-3.5 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] sm:text-xs font-black rounded-xl sm:rounded-2xl transition-all border border-white/10 uppercase tracking-widest shadow-xl flex items-center gap-3 shrink-0"
          >
            <Edit3 size={14} /> Configure
          </button>
        </div>
      </motion.div>

      {/* STATS & GROWTH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Stats Cards */}
        <div className="lg:col-span-1 grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-6">
          {[
            { label: 'Total XP', value: currentTotalXP, suffix: 'XP', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', text: 'text-indigo-400' },
            { label: 'Campus Rank', value: rank ? `#${rank}` : 'Unranked', suffix: 'RANK', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', text: 'text-yellow-400' },
            { label: 'Verified Assets', value: eCertsCount, suffix: 'UNITS', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400' }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className={`bg-[#111319] border ${stat.border} ${stat.bg} p-3 sm:p-7 rounded-2xl sm:rounded-[2rem] relative overflow-hidden group shadow-lg transition-transform hover:-translate-y-1`}>
              <div className="relative z-10 flex flex-col lg:flex-row items-center lg:justify-between gap-1 lg:gap-4">
                <p className="text-[7px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] lg:tracking-[0.2em]">{stat.label}</p>
                <div className="flex items-baseline gap-1 lg:gap-2">
                  <h3 className="text-sm lg:text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                  <span className={`text-[6px] lg:text-[10px] font-black uppercase tracking-widest ${stat.text}`}>{stat.suffix}</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Growth Pattern Graph */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10 w-full">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                <ActivityIcon className="text-indigo-500 sm:w-6 sm:h-6" size={20} />
                Growth Pattern
              </h2>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1 hidden sm:block">XP Volume tracking over time</p>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[8px] sm:text-[9px] font-black text-indigo-400 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)] self-end sm:self-auto">
              Live Momentum
            </div>
          </div>

          <div className="flex-1 w-full flex items-end justify-between gap-2 sm:gap-4 relative px-2 sm:px-6 min-h-[220px]">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4">
              {[0, 1, 2, 3].map(line => (
                <div key={line} className="w-full border-t border-dashed border-white/20"></div>
              ))}
            </div>

            {monthlyStats.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">Initialize progress to see pattern</span>
              </div>
            ) : (
              monthlyStats.map((stat, i) => {
                const heightPercentage = Math.max((stat.points / maxPoints) * 100, 5);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 relative z-10 group h-full justify-end">
                    <div className="relative w-full max-w-[40px] sm:max-w-[48px] flex flex-col items-center h-full justify-end">
                      {/* Value Tooltip Permanent over hovered/active bars */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="mb-2 text-[9px] sm:text-[10px] font-black text-white bg-indigo-500 border border-indigo-400/50 px-2 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20"
                      >
                        +{stat.points} XP
                      </motion.div>

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                        className="w-full bg-gradient-to-t from-indigo-600/30 via-indigo-600/60 to-indigo-500 rounded-xl sm:rounded-2xl relative shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-shadow duration-300 flex flex-col justify-start overflow-hidden border border-white/5"
                      >
                        <div className="w-full h-2 bg-white/30 rounded-full mt-1.5 mx-auto w-1/2"></div>
                      </motion.div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-tighter truncate w-full text-center">{stat.month.substring(0, 3)}</span>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* VERIFIED DIGITAL ASSETS (FULL LIST) */}
      {user.role === 'student' && eCertsCount > 0 && (
        <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#111319] to-[#0d0f14] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500/20 to-transparent"></div>
          <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10">
            <ShieldCheck className="text-emerald-500 sm:w-7 sm:h-7" size={24} />
            Verified Digital Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10 max-h-[400px] lg:max-h-[550px] overflow-y-auto custom-scrollbar pr-2 pb-4">
            {certificates.filter(c => c.source === 'e_certificate').map((c, i) => {
              const verifyUrl = encodeURIComponent(`${window.location.origin}/verify/${c.id}`);

              const shareText = encodeURIComponent(`I just earned a certificate for "${c.event_name}" from Rungta International Skills University ✨🚀`);
              const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${verifyUrl}&summary=${shareText}`;


              return (
                <div key={i} className="bg-[#161a23] border border-white/5 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] group hover:border-emerald-500/30 hover:bg-[#1a1f2b] transition-all relative overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 flex flex-col">
                  <div className="flex justify-between items-center mb-1 relative z-10 gap-3">
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate flex-1">{c.event_name}</h4>
                    <div className="flex gap-1.5 sm:gap-2">
                      <a href={getAssetUrl(c.url)} target="_blank" rel="noreferrer" title="Download" className="p-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors border border-emerald-500/20">
                        <Download size={14} />
                      </a>
                      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn Share" className="p-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-colors border border-blue-500/20">
                        <Share2 size={14} />
                      </a>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest relative z-10 flex items-center justify-between">
                    <span>{c.position}</span>
                    <span className="text-gray-600 tracking-tighter">{new Date(c.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ACHIEVEMENT REGISTRY TABLE */}
      {user.role === 'student' && (
        <motion.div variants={itemVariants} className="bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 relative z-10">
            <Trophy className="text-yellow-400 sm:w-7 sm:h-7" size={24} />
            System Registry
          </h2>
          <div className="overflow-x-auto overflow-y-auto max-h-[350px] sm:max-h-[450px] lg:max-h-[480px] relative z-10 pb-4 custom-scrollbar">
            <table className="w-full text-left sm:min-w-[800px] border-separate border-spacing-y-2 table-auto sm:table-fixed">
              <thead className="sticky top-0 z-20 bg-[#111319]">
                <tr className="text-gray-500 text-[8px] sm:text-[9px] uppercase font-black tracking-widest">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 bg-white/[0.02] rounded-l-2xl w-[45%] sm:w-auto">Success Unit</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 bg-white/[0.02] text-center w-[30%] sm:w-auto">Source</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 bg-white/[0.02] hidden md:table-cell">Position</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 bg-white/[0.02] rounded-r-2xl text-right w-[25%] sm:w-auto">XP</th>
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center flex-col items-center justify-center">
                    <Trophy size={30} className="text-gray-600 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">No registry items detected</p>
                  </td></tr>
                ) : (
                  certificates.map((p, idx) => {
                    const isCounted = p.isCounted;
                    return (
                      <tr key={idx} className={`group transition-all ${!isCounted ? 'opacity-60' : ''}`}>
                        <td className={`px-3 sm:px-6 py-2 sm:py-3 bg-white/[0.02] rounded-l-2xl group-hover:bg-white/[0.04] ${isCounted ? 'border-l-4 border-emerald-500' : ''}`}>
                          <div className={`font-black text-[10px] sm:text-sm uppercase italic tracking-tighter truncate max-w-[120px] sm:max-w-[250px] transition-colors leading-none ${isCounted ? 'text-white' : 'text-gray-400'}`}>{p.event_name}</div>
                          <div className="text-[7px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">{new Date(p.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 bg-white/[0.02] group-hover:bg-white/[0.04]">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-1.5 py-0.5 text-[7px] sm:text-[8px] font-black rounded uppercase tracking-widest border ${p.source === 'e_certificate' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                              {p.source === 'e_certificate' ? 'ECERT' : 'MANUAL'}
                            </span>
                            <span className={`text-[6px] sm:text-[8px] font-black rounded uppercase tracking-[0.05em] flex items-center justify-center gap-1 ${isCounted ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {isCounted ? 'Counted' : 'Skipped'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 bg-white/[0.02] group-hover:bg-white/[0.04] font-black text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-widest hidden md:table-cell">
                          {p.position}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 bg-white/[0.02] rounded-r-2xl group-hover:bg-white/[0.04] text-right font-black text-base sm:text-xl italic tracking-tighter">
                          {isCounted ? (
                            <><span className="text-emerald-400">+</span><span className="text-white">{p.points || 0}</span></>
                          ) : (
                            <span className="text-gray-500 font-bold text-sm sm:text-lg">0</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* MANUAL SUBMISSION TRACKER */}
      {user.role === 'student' && (
        <motion.div variants={itemVariants} className="bg-[#111319] border border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 relative z-10">
            <UploadCloud className="text-indigo-500 sm:w-6 sm:h-6" size={20} />
            Manual Tracking
          </h2>
          <div className="space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 relative z-10 max-h-[300px] lg:max-h-[420px]">
            {manualHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-10 text-gray-500">
                <UploadCloud size={30} className="mb-3 opacity-30" />
                <p className="text-[10px] font-black uppercase tracking-widest">No manual uploads detected</p>
              </div>
            ) : (
              manualHistory.map((m, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all">
                  <div className="space-y-1 max-w-[50%]">
                    <h4 className="text-white text-xs sm:text-sm font-black uppercase italic tracking-tighter truncate">{m.event_name}</h4>
                    <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{m.club_name} • {m.position}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        {m.status === 'approved' ? <CheckCircle2 size={12} className="text-green-500" /> : m.status === 'rejected' ? <XCircle size={12} className="text-red-500" /> : <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${m.status === 'approved' ? 'text-green-500' : m.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{m.status}</span>
                      </div>
                      <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                    <a href={getAssetUrl(m.file_url)} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-indigo-500 text-white rounded-xl transition-colors border border-white/10 shrink-0"><ExternalLink size={12} /></a>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* IDENTITY MODAL */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#0B0F19]/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-[#111319] border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>

              <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter">Identity Core</h3>
                <button onClick={() => setIsEditing(false)} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors">&times;</button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap size={14} className="text-amber-500" />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Affiliated College</label>
                    </div>
                    <input
                      type="text"
                      value={editForm.college}
                      onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                      className="w-full bg-[#161a23] border border-amber-500/20 rounded-2xl p-4 text-white text-xs focus:border-amber-500 focus:bg-amber-500/5 outline-none transition-all font-bold tracking-wide shadow-inner placeholder:text-gray-700"
                      placeholder="Enter your exact college name..."
                    />
                    <p className="text-[9px] text-amber-500/60 font-medium ml-1">This will be printed on all your future E-Certificates.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={14} className="text-indigo-500" />
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Course</label>
                      </div>
                      <input type="text" value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} className="w-full bg-[#161a23] border border-white/10 rounded-2xl p-4 text-white text-xs focus:border-indigo-500 focus:bg-white/5 outline-none transition-all font-bold uppercase tracking-widest shadow-inner placeholder:text-gray-700" placeholder="e.g. B.Tech" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={14} className="text-indigo-500" />
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Branch</label>
                      </div>
                      <input type="text" value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })} className="w-full bg-[#161a23] border border-white/10 rounded-2xl p-4 text-white text-xs focus:border-indigo-500 focus:bg-white/5 outline-none transition-all font-bold uppercase tracking-widest shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-indigo-500" />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Semester / Year</label>
                    </div>
                    <input type="text" value={editForm.semester} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })} className="w-full bg-[#161a23] border border-white/10 rounded-2xl p-4 text-white text-xs focus:border-indigo-500 focus:bg-white/5 outline-none transition-all font-bold uppercase tracking-widest shadow-inner" placeholder="e.g. 6th Sem" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4.5 mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[10px] sm:text-xs font-black rounded-2xl shadow-[0_15px_30px_rgba(79,70,229,0.3)] uppercase tracking-[0.25em] transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95">Update Identity Profile</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
