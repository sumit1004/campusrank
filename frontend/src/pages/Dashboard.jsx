import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Award, UploadCloud, ShieldAlert, FileText, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCerts();
  }, []);

  const fetchMyCerts = async () => {
    try {
      const res = await api.get('/certificates/my-certificates');
      setCerts(res.data.data);
    } catch (error) { toast.error("Failed to fetch your certificates"); }
    finally { setLoading(false); }
  };

  const totalPoints = certs.filter(c => c.status === 'approved').reduce((acc, curr) => acc + (curr.points || 0), 0);
  const approvedCount = certs.filter(c => c.status === 'approved').length;
  const pendingCount = certs.filter(c => c.status === 'pending').length;

  // Club wise compilation
  const clubStatsMap = {};
  certs.forEach(c => {
    if(!clubStatsMap[c.club_name]) clubStatsMap[c.club_name] = 0;
    clubStatsMap[c.club_name]++;
  });

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      
      {/* Welcome Banner - Compact */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 w-full">
          <div>
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-sm text-gray-400 font-bold flex items-center opacity-80 uppercase tracking-wider gap-3">
              <span className="flex items-center"><ShieldAlert size={14} className="mr-2 text-indigo-400"/> ERP: {user?.erp}</span>
              {totalPoints >= 500 && (
                <span className="flex items-center px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-accent text-[10px] font-black">
                  <Award size={12} className="mr-1" /> {
                    totalPoints >= 1500 ? 'ELITE' :
                    totalPoints >= 1000 ? 'LEVEL 3' :
                    totalPoints >= 800 ? 'LEVEL 2' : 'LEVEL 1'
                  }
                </span>
              )}
            </p>
          </div>
          
          <div className="shrink-0">
            <Link to="/leaderboard" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-indigo-500/10 transition-all border border-indigo-400/20">
              EXPLORE LEADERBOARD <Trophy size={14} className="text-yellow-400" />
            </Link>
          </div>
        </div>
      </div>


      {/* Metrics Row - Smaller Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: totalPoints, icon: <Award size={20}/>, color: 'text-white', bg: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { label: 'Uploads', value: certs.length, icon: <UploadCloud size={20}/>, color: 'text-white', bg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
          { label: 'Approved', value: approvedCount, icon: null, color: 'text-green-400', bg: 'bg-green-500/10', iconColor: '' },
          { label: 'Pending', value: pendingCount, icon: null, color: 'text-yellow-400', bg: 'bg-yellow-500/10', iconColor: '' }
        ].map((m, i) => (
          <div key={i} className="bg-[#111827]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.15em] mb-1">{m.label}</p>
              <h2 className={`text-2xl ${m.color} font-black leading-none`}>{m.value}</h2>
            </div>
            {m.icon && <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center ${m.iconColor}`}>{m.icon}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Certificate Table - Refined */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center"><FileText className="mr-2 text-indigo-400" size={18}/> My Records</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{certs.length} total entries</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8"><span className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></span></div>
          ) : certs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold bg-[#0B0F19] rounded-xl border border-white/5 border-dashed">No certificates recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                  <tr>
                    <th className="p-4">Club Assignment</th>
                    <th className="p-4">Standing</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Draft</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {certs.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-bold text-gray-300 text-sm">{c.club_name || 'Generic'}</td>
                      <td className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{c.position}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-tighter ${
                          c.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          c.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>{c.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        {c.file_url ? (
                          <a href={`http://localhost:5000${c.file_url}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold border-b border-indigo-400/20 hover:border-indigo-300 px-1 py-0.5 transition-all">View</a>
                        ) : <span className="text-gray-700">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Club Wise Breakdown - Compact */}
        <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col">
          <h2 className="text-lg font-bold mb-5 text-white">Participation</h2>
          <div className="flex-1 space-y-2">
            {Object.keys(clubStatsMap).length === 0 ? (
               <p className="text-center py-6 text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">No upload data.</p>
            ) : (
              Object.entries(clubStatsMap).map(([clubName, count]) => (
                <div key={clubName} className="flex justify-between items-center bg-white/[0.03] p-3 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all">
                  <span className="font-bold text-indigo-300 text-xs">{clubName}</span>
                  <span className="text-white font-black bg-indigo-500/30 px-2 py-0.5 rounded-md text-[10px]">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
