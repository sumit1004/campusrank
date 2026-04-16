import React, { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Pickaxe, CheckCircle, XCircle, Award, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const user = getUser();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [pendingCerts, setPendingCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/certificates')
      ]);
      setStats(sRes.data.data);
      setPendingCerts(cRes.data.data);
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

  if (loading) return <div className="text-center mt-20"><span className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></span></div>;

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      
      {/* Overview Stats - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Club Management</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Review student submissions and award points</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin-certificates" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
            <Award size={16} /> E-Certificate System
          </Link>
          <Link to="/admin-forms" className="bg-[#111827] border border-white/5 hover:bg-white/[0.05] text-gray-300 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all uppercase tracking-widest">
            <PlusCircle size={16} /> Manage Forms
          </Link>
        </div>
      </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#111827]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Entries</p>
            <h2 className="text-3xl text-white font-black">{stats.total}</h2>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Awaiting Review</p>
            <h2 className="text-3xl text-indigo-100 font-black">{stats.pending}</h2>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex flex-col justify-center shadow-lg">
            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">Processed</p>
            <h2 className="text-3xl text-green-100 font-black">{stats.approved}</h2>
          </div>
        </div>

      {/* Pending Reviews Table - Refined */}
      <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-indigo-400 flex items-center">
            <Pickaxe className="mr-3" size={20} /> Case Queue
          </h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Action Needed: {pendingCerts.length}</span>
        </div>
        
        {pendingCerts.length === 0 ? (
          <div className="text-center py-16 bg-[#0B0F19] rounded-xl border border-white/5 border-dashed">
            <p className="text-gray-600 font-bold text-sm tracking-widest uppercase">No pending reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-[0.15em] border-b border-white/10">
                <tr>
                  <th className="p-4">Candidate Profile</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Proof</th>
                  <th className="p-4">Points</th>
                  <th className="p-4 text-center">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingCerts.map(c => {
                  return <ReviewRow key={c.id} cert={c} onApprove={handleApprove} onReject={handleReject} />
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

// Extracted Row Component - More Compact
const ReviewRow = ({ cert, onApprove, onReject }) => {
  const defaultPtsStr = (cert.default_points || 0).toString();
  const [points, setPoints] = useState(defaultPtsStr);
  
  const isCustom = points !== defaultPtsStr;

  const handleApproveAction = () => {
    if (!points || isNaN(points)) return toast.error('Set valid points');
    const finalPoints = parseInt(points);
    if(window.confirm(`Approve with ${finalPoints} pts?`)) onApprove(cert.id, finalPoints);
  };

  return (
    <tr className="hover:bg-white/[0.02] group transition-colors">
      <td className="p-4">
        <div className="font-black text-gray-100 text-sm leading-tight">{cert.user_name}</div>
        <div className="text-[10px] text-indigo-400 font-bold tracking-tight">{cert.user_erp}</div>
      </td>
      <td className="p-4">
        <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">{cert.position}</div>
        <div className="text-[9px] text-gray-600 font-bold mt-0.5">Base: {cert.default_points}</div>
      </td>
      <td className="p-4">
        <a href={`http://localhost:5000${cert.file_url}`} target="_blank" rel="noreferrer" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded text-[10px] font-black hover:bg-indigo-500/20 transition-all inline-block uppercase tracking-widest">
          Inspect
        </a>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <input 
            type="number" 
            value={points} 
            onChange={(e)=>setPoints(e.target.value)} 
            className={`w-16 bg-[#0B0F19] border ${isCustom ? 'border-yellow-500/50 text-yellow-500' : 'border-white/10 text-gray-300'} rounded-md px-2 py-1 text-[11px] font-black focus:outline-none focus:border-indigo-500 transition-colors`} 
          />
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-center space-x-3">
          <button onClick={handleApproveAction} className="text-green-500 hover:text-green-400 transition-colors" title="Approve">
            <CheckCircle size={18} />
          </button>
          <button onClick={() => window.confirm('Reject permanently?') && onReject(cert.id)} className="text-red-500 hover:text-red-400 transition-colors" title="Reject">
            <XCircle size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminDashboard;
