import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Award, UploadCloud, ShieldAlert, FileText, Trophy, ClipboardList, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [eCerts, setECerts] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCerts();
  }, []);

  const fetchMyCerts = async () => {
    try {
      const [resLegacy, resE, resP] = await Promise.all([
        api.get('/certificates/my-certificates'),
        api.get('/certificates/my-e-certificates'),
        api.get('/certificates/my-participations')
      ]);
      setCerts(resLegacy.data.data);
      setECerts(resE.data.data);
      setParticipations(resP.data.data);
    } catch (error) {
      toast.error("Failed to fetch your data");
    } finally {
      setLoading(false);
    }
  };

  // Points and Counts from centralized table (Participation)
  const totalPoints = participations.reduce((acc, curr) => acc + (curr.points || 0), 0);
  const approvedCount = participations.length;
  const pendingCount = certs.filter(c => c.status === 'pending').length;

  // Club wise compilation
  const clubStatsMap = {};
  certs.forEach(c => {
    if (!clubStatsMap[c.club_name]) clubStatsMap[c.club_name] = 0;
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
              <span className="flex items-center"><ShieldAlert size={14} className="mr-2 text-indigo-400" /> ERP: {user?.erp}</span>
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
              LEADERBOARD <Trophy size={14} className="text-yellow-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Events Quick-Access Banner */}
      <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
            <ClipboardList size={20} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Event Registrations</p>
            <p className="text-xs text-gray-400 mt-0.5">Browse open events and register for upcoming competitions.</p>
          </div>
        </div>
        <Link
          to="/events"
          className="shrink-0 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shadow-violet-500/20"
        >
          Browse Events <ChevronRight size={13} />
        </Link>
      </div>

      {/* Metrics Row - Smaller Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: totalPoints, icon: <Award size={20} />, color: 'text-white', bg: 'bg-indigo-500/20', iconColor: 'text-indigo-400' },
          { label: 'Uploads', value: certs.length, icon: <UploadCloud size={20} />, color: 'text-white', bg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
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

      {/* Participation History (Central Source of Truth) */}
      <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} /> 
            Event Participation History
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded ml-2 font-black uppercase">Points Control ✅</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><span className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></span></div>
        ) : participations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-bold bg-[#0B0F19] rounded-xl border border-white/5 border-dashed">No participation records yet. Points shown above are based on verified achievements.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Club</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participations.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-gray-100 text-sm">{p.event_name}</div>
                      <div className="text-[10px] text-gray-500">{new Date(p.event_date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">{p.club_name}</div>
                    </td>
                    <td className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{p.position}</td>
                    <td className="p-4">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${p.source === 'e_certificate' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {p.source === 'e_certificate' ? 'E-Certificate ✅' : 'Manual Upload'}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-black">+{p.points} PTS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified E-Certificates (UI Only) */}
      <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-400 flex items-center uppercase tracking-widest"><Award className="mr-2 text-yellow-400" size={16} /> Certificate Downloads</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eCerts.map(c => (
             <div key={c.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
                <div>
                  <div className="font-bold text-gray-100 text-xs mb-1 truncate">{c.event_name}</div>
                  <div className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mb-3">{c.club_name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-indigo-400 font-black uppercase">{c.position}</span>
                  <a
                    href={`http://localhost:5000${c.certificate_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <FileText size={16} />
                  </a>
                </div>
             </div>
          ))}
          {eCerts.length === 0 && <p className="text-gray-600 text-[10px] font-bold uppercase py-2">No e-certificates yet.</p>}
        </div>
      </div>

      {/* Legacy Uploads Table */}
      <div className="lg:col-span-1 bg-[#111827] border border-white/5 p-5 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-400 flex items-center"><UploadCloud className="mr-2" size={16} /> Manual Uploads</h2>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
          {certs.map(c => (
            <div key={c.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{c.club_name || 'Generic'}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{c.position}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${c.status === 'approved' ? 'text-green-400 bg-green-500/10' :
                    c.status === 'rejected' ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'
                  }`}>{c.status}</span>
                <a href={`http://localhost:5000${c.file_url}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                  <FileText size={14} />
                </a>
              </div>
            </div>
          ))}
          {certs.length === 0 && <p className="text-center py-4 text-gray-600 text-xs italic">No manual uploads.</p>}
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
