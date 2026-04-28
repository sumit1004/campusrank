import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, XCircle, Award, Calendar, User, BookOpen, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyCertificate = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/certificates/verify/${id}`);
        setCertData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">Validating Cryptographic Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {error ? (
          <div className="bg-[#111319] border border-red-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30"></div>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Verification Failed</h1>
            <p className="text-gray-400 font-bold mb-8">{error}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/10">
              Back to Home <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="bg-[#111319] border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/30 animate-pulse">
                  <ShieldCheck size={40} className="text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Authenticity Verified</h1>
                <p className="text-white/80 font-black text-[10px] uppercase tracking-[0.3em]">Official CampusRank Digital Asset</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 sm:p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Info */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} className="text-emerald-500" /> Recipient Name
                    </p>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{certData.student_name}</h2>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Award size={12} className="text-emerald-500" /> Achievement Unit
                    </p>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{certData.event_name}</h2>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-500" /> Completion Date
                    </p>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tight">
                      {new Date(certData.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h2>
                  </div>
                </div>

                {/* Event Info */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={12} className="text-emerald-500" /> Issuing Club
                    </p>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{certData.club_name}</h2>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={12} className="text-emerald-500" /> Rank / Status
                    </p>
                    <h2 className="text-xl font-black text-emerald-400 uppercase italic tracking-tight">{certData.position}</h2>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" /> Registry ID
                    </p>
                    <code className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{id}</code>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Secure Asset
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {certData.points} XP Awarded
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a 
                    href={`${import.meta.env.VITE_API_URL}${certData.certificate_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                  >
                    View Document <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#0D1117] p-6 text-center border-t border-white/5">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">© 2026 CampusRank Blockchain Verification Services</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyCertificate;
