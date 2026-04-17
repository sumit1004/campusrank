import React, { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Pickaxe, CheckCircle, XCircle, Award, PlusCircle, Clock, ShieldAlert, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const user = getUser();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [pendingCerts, setPendingCerts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes, aRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/certificates'),
        api.get('/users/profile') // Re-using profile endpoint for logs
      ]);
      setStats(sRes.data.data);
      setPendingCerts(cRes.data.data);
      setActivityLogs(aRes.data.data.activityLogs);
    } catch(err) {
      toast.error('Failed to fetch admin data');
    } finally { setLoading(false); }
  };

  const handleApprove = async (id, points) => {
    try {
      await api.put(`/admin/approve/${id}`, { points });
      toast.success('Certificate approved and points awarded!');
      fetchAdminData();
    } catch (err) { toast.error('Action failed'); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/reject/${id}`);
      toast.success('Certificate rejected');
      fetchAdminData();
    } catch (err) { toast.error('Action failed'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Syncing Admin Frequency...</p>
    </div>
  );

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto px-4 sm:px-0">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Club Command <span className="text-indigo-500">.</span></h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Validated student submissions and XP allocation hub</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <Link to="/admin-certificates" className="flex-1 lg:flex-none text-center bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest">
            Broadcast E-Certs
          </Link>
          <Link to="/admin-forms" className="flex-1 lg:flex-none text-center bg-[#111827] border border-white/5 hover:bg-white/[0.05] text-gray-300 px-8 py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest">
            Registration Forms
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 📋 ACTIVITY LOGS SIDEBAR (NEW) */}
        <div className="lg:col-span-1 space-y-8 h-full">
           <div className="bg-[#111827] border border-white/5 p-8 rounded-[2.5rem] shadow-xl h-full flex flex-col">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                 <Clock size={16} className="text-indigo-500" />
                 Audit Trail
              </h4>
              <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2 max-h-[400px] lg:max-h-none">
                 {activityLogs.length === 0 ? (
                    <p className="text-gray-600 text-[10px] font-black uppercase text-center py-10 opacity-30">No logs captured</p>
                 ) : (
                    activityLogs.map((log, i) => (
                       <div key={i} className="flex gap-4 items-start group">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-150 transition-all"></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-200 uppercase tracking-tight leading-tight">{log.action_type.replace(/_/g, ' ')}</p>
                             <p className="text-[8px] text-gray-600 font-black mt-1 uppercase italic">{new Date(log.created_at).toLocaleDateString()}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* 📊 STATS & QUEUE SECTION */}
        <div className="lg:col-span-3 space-y-8">
           {/* Visual Metrics */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Volume', value: stats.total, color: 'bg-[#111827]/80' },
                { label: 'Pending Review', value: stats.pending, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100', highlight: 'text-indigo-400' },
                { label: 'System Processed', value: stats.approved, color: 'bg-green-500/10 border-green-500/20 text-green-100', highlight: 'text-green-400' }
              ].map((s, i) => (
                <div key={i} className={`${s.color} border border-white/5 p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden group`}>
                   <div className="absolute -right-5 -bottom-5 opacity-10 group-hover:scale-110 transition-transform"><Activity size={80} /></div>
                   <p className={`${s.highlight || 'text-gray-500'} text-[9px] font-black uppercase tracking-widest mb-1`}>{s.label}</p>
                   <h2 className="text-4xl font-black italic">{s.value}</h2>
                </div>
              ))}
           </div>

           {/* Pending Reviews Table */}
           <div className="bg-[#111827] border border-white/5 p-8 rounded-[3rem] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <Pickaxe className="text-indigo-500" size={24} />
                  Verification Queue
                </h2>
                <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                   <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Action Required: {pendingCerts.length}</span>
                </div>
              </div>
              
              {pendingCerts.length === 0 ? (
                <div className="text-center py-20 bg-[#0B0F19]/50 rounded-[2rem] border border-white/5 border-dashed">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle className="text-gray-600" size={30} />
                  </div>
                  <p className="text-gray-600 font-black text-xs tracking-[0.2em] uppercase italic">System clear. All cases resolved.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-8">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="text-gray-500 text-[10px] uppercase font-black tracking-[0.15em] border-b border-white/5 px-8">
                      <tr>
                        <th className="px-8 py-6">Candidate</th>
                        <th className="px-4 py-6">Claim Type</th>
                        <th className="px-4 py-6 text-center">Proof</th>
                        <th className="px-4 py-6">XP Allocation</th>
                        <th className="px-8 py-6 text-center">Resolve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingCerts.map(c => <ReviewRow key={c.id} cert={c} onApprove={handleApprove} onReject={handleReject} />)}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ReviewRow = ({ cert, onApprove, onReject }) => {
  const defaultPtsStr = (cert.default_points || 0).toString();
  const [points, setPoints] = useState(defaultPtsStr);
  const isCustom = points !== defaultPtsStr;

  const handleApproveAction = () => {
    if (!points || isNaN(points)) return toast.error('Set valid points');
    const finalPoints = parseInt(points);
    if(window.confirm(`Reward student with ${finalPoints} pts?`)) onApprove(cert.id, finalPoints);
  };

  return (
    <tr className="hover:bg-white/[0.01] group transition-colors">
      <td className="px-8 py-6">
        <div className="font-black text-white text-sm uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">{cert.user_name}</div>
        <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">{cert.user_erp}</div>
      </td>
      <td className="px-4 py-6">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cert.position}</div>
        <div className="text-[8px] text-gray-600 font-bold mt-0.5 uppercase tracking-tighter">Standard: {cert.default_points} XP</div>
      </td>
      <td className="px-4 py-6 text-center">
        <a href={`http://localhost:5000${cert.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/5 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
          <ShieldAlert size={12} /> Inspect Asset
        </a>
      </td>
      <td className="px-4 py-6">
        <input 
          type="number" 
          value={points} 
          onChange={(e)=>setPoints(e.target.value)} 
          className={`w-20 bg-[#0B0F19] border ${isCustom ? 'border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.2)] text-indigo-400' : 'border-white/10 text-gray-400'} rounded-xl px-3 py-2 text-xs font-black focus:outline-none transition-all`} 
        />
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-center space-x-4">
          <button onClick={handleApproveAction} className="p-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-inner" title="Approve">
            <CheckCircle size={18} />
          </button>
          <button onClick={() => window.confirm('Final rejection?') && onReject(cert.id)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-inner" title="Reject">
            <XCircle size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminDashboard;
