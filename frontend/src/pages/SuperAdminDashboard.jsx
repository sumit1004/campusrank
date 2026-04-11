import React, { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Users, Activity, FileText, Search, UserMinus, UserPlus, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // States Analytics
  const [analytics, setAnalytics] = useState(null);

  // States Search / Users
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);

  // States Role Management
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState({});

  // States Certificates
  const [certificates, setCertificates] = useState([]);
  const [certFilter, setCertFilter] = useState({ club: '', status: '', search: '' });

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'roles') loadRoleData();
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'search' || activeTab === 'broadcaster') {
      if (!clubs.length) api.get('/clubs').then(r => setClubs(r.data.data));
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/superadmin/analytics');
      setAnalytics(data.data);
    } catch (e) { }
  };

  const loadRoleData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([api.get('/superadmin/users'), api.get('/clubs')]);
      const sortedUsers = uRes.data.data.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return 0;
      });
      setUsers(sortedUsers);
      setClubs(cRes.data.data);
    } catch (e) { }
  };

  const loadCertificates = async () => {
    try {
      const { data } = await api.get(`/superadmin/certificates?club=${certFilter.club}&status=${certFilter.status}&search=${certFilter.search}`);
      setCertificates(data.data);
      if (!clubs.length) {
        const cRes = await api.get('/clubs');
        setClubs(cRes.data.data);
      }
    } catch (e) { }
  };

  const searchUserAction = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.get(`/superadmin/search-users?query=${searchQuery}`);
      setUserSearchResults(data.data);
    } catch (e) { toast.error('Search failed'); }
  };

  const handleMakeAdmin = async (userId) => {
    const clubId = selectedClubId[userId];
    if (!clubId) return toast.error('Select club');
    try {
      await api.put('/superadmin/make-admin', { user_id: userId, club_id: clubId });
      toast.success('Admin assigned');
      loadRoleData();
    } catch (err) { }
  };
  const handleChangeClub = async (userId) => {
    const clubId = selectedClubId[userId];
    if (!clubId) return toast.error('Select club');
    try {
      await api.put('/superadmin/change-club', { user_id: userId, club_id: clubId });
      toast.success('Club changed');
      loadRoleData();
    } catch (err) { }
  };
  const handleRemoveAdmin = async (userId) => {
    try {
      await api.put('/superadmin/remove-admin', { user_id: userId });
      toast.success('Admin removed');
      loadRoleData();
    } catch (err) { }
  };

  return (
    <div className="py-6 animate-fade-in space-y-6">
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-white/10 pb-4">
        {[
          { id: 'analytics', icon: <Activity size={18} />, name: 'Analytics' },
          { id: 'search', icon: <Search size={18} />, name: 'User Search' },
          { id: 'roles', icon: <ShieldCheck size={18} />, name: 'Role Hub' },
          { id: 'certificates', icon: <FileText size={18} />, name: 'Certificates Grid' },
          { id: 'broadcaster', icon: <Bell size={18} />, name: 'Notifications' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tab.icon} <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Users</p>
              <h2 className="text-4xl text-white font-black">{analytics.totalUsers}</h2>
            </div>
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Uploads</p>
              <h2 className="text-4xl text-white font-black">{analytics.totalCerts}</h2>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Approved</p>
              <h2 className="text-4xl text-indigo-100 font-black">{analytics.approvedCerts}</h2>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">Pending</p>
              <h2 className="text-4xl text-purple-100 font-black">{analytics.pendingCerts}</h2>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Club-wise Upload Activity</h3>
            <div className="space-y-3">
              {analytics.clubStats.map((c, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_purple]"></div>
                    <span className="font-bold text-gray-200">{c.name}</span>
                  </div>
                  <div className="text-sm font-mono text-gray-400">
                    <span className="text-white font-bold">{c.total}</span> uploads / <span className="text-purple-400">{c.pending}</span> pending
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
          <form onSubmit={searchUserAction} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by ERP, Name, or Email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 font-black px-6 py-3 rounded-xl transition-all shadow-lg text-white w-full sm:w-auto uppercase tracking-widest text-xs">Search System</button>
          </form>

          <div className="space-y-4">
            {userSearchResults.map(u => (
              <div key={u.id} className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">{u.name} <span className="ml-3 px-2 py-0.5 bg-white/10 text-[10px] rounded text-gray-400 uppercase">{u.role}</span></h3>
                  <p className="text-gray-500 text-sm font-mono mt-1">{u.erp} | {u.email}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Club</p>
                    <p className="text-indigo-400 font-black">{u.club_name || 'N/A'}</p>
                  </div>
                  <div className="text-center border-l border-white/10 pl-6">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Uploads</p>
                    <p className="text-white font-black">{u.total_certs}</p>
                  </div>
                  <div className="text-center border-l border-white/10 pl-6">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Points</p>
                    <p className="text-purple-400 font-black">{u.total_points}</p>
                  </div>
                </div>
              </div>
            ))}
            {userSearchResults.length === 0 && <p className="text-gray-500 text-center py-10 font-bold italic">No users found. Run a search to see records.</p>}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                <tr><th className="p-4">Name / Email</th><th className="p-4">Role</th><th className="p-4">Club</th><th className="p-4">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white uppercase tracking-tight">{u.name}</div>
                      <div className="text-xs font-mono text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>{u.role}</span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-400">
                      {clubs.find(c => c.id === u.club_id)?.name || <span className="text-gray-700">-</span>}
                    </td>
                    <td className="p-4 text-xs">
                      {u.role !== 'superadmin' && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <select className="bg-[#0B0F19] text-gray-300 border border-white/10 rounded-lg px-2 py-1.5 w-full sm:w-auto text-xs focus:outline-none focus:border-indigo-500" value={selectedClubId[u.id] || ''} onChange={e => setSelectedClubId({ ...selectedClubId, [u.id]: e.target.value })}>
                            <option value="">Select Club...</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          {u.role === 'student' ? (
                            <button onClick={() => handleMakeAdmin(u.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-3 py-1.5 rounded-lg transition-all w-full sm:w-auto uppercase tracking-tighter shadow-lg shadow-indigo-600/10">Promote</button>
                          ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={() => handleChangeClub(u.id)} className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-black px-3 py-1.5 rounded-lg transition uppercase tracking-tighter">Shift</button>
                              <button onClick={() => handleRemoveAdmin(u.id)} className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black px-3 py-1.5 rounded-lg transition uppercase tracking-tighter">Demote</button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
            <select className="bg-[#0B0F19] text-sm text-gray-300 border border-white/10 rounded-xl px-4 py-3 sm:py-2 flex-1 sm:flex-none min-w-[140px]" value={certFilter.club} onChange={e => setCertFilter({ ...certFilter, club: e.target.value })}>
              <option value="">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select className="bg-[#0B0F19] text-sm text-gray-300 border border-white/10 rounded-xl px-4 py-3 sm:py-2 flex-1 sm:flex-none min-w-[140px]" value={certFilter.status} onChange={e => setCertFilter({ ...certFilter, status: e.target.value })}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input type="text" placeholder="Search ERP..." className="flex-1 bg-[#0B0F19] text-sm text-gray-300 border border-white/10 rounded-xl px-4 py-3 sm:py-2 min-w-[200px]" value={certFilter.search} onChange={e => setCertFilter({ ...certFilter, search: e.target.value })} />
            <button onClick={loadCertificates} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-3 sm:py-2 rounded-xl transition w-full sm:w-auto uppercase tracking-widest text-[10px]">Filter Data</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#0B0F19] text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 font-black">
                <tr><th className="p-4">Uploader</th><th className="p-4">Club</th><th className="p-4">Position</th><th className="p-4">Status</th><th className="p-4">File</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5 border-b border-white/5">
                {certificates.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white max-w-[150px] truncate">{c.user_name}</div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{c.user_erp}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-400 max-w-[150px] truncate text-xs">{c.club_name}</td>
                    <td className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-tighter">{c.position}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${c.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : c.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>{c.status}</span></td>
                    <td className="p-4"><a href={`http://localhost:5000${c.file_url}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-bold text-xs uppercase tracking-tighter">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {certificates.length === 0 && <p className="text-center py-10 text-gray-500 font-bold">No certificates found matching criteria.</p>}
          </div>
        </div>
      )}

      {activeTab === 'broadcaster' && <NotificationBroadcaster />}
    </div>
  );
};

const NotificationBroadcaster = () => {
  const [formData, setFormData] = useState({ title: '', message: '', target_type: 'all_students', erp: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notifications/send', formData);
      toast.success('Broadcast transmitted successfully');
      setFormData({ title: '', message: '', target_type: 'all_students', erp: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-2xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Notification</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Push alerts to university frequencies</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Alert Target</label>
            <select
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm"
              value={formData.target_type}
              onChange={e => setFormData({ ...formData, target_type: e.target.value })}
            >
              <option value="all_students">Send Notification to All Students</option>
              <option value="all_admins">Send Notification to All Club Admins</option>
              <option value="single_user">Target Specific ERP ID</option>
            </select>
          </div>

          {formData.target_type === 'single_user' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-indigo-400">Recipient ERP</label>
              <input
                type="text"
                placeholder="Ex: 2021001"
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all font-mono text-sm"
                value={formData.erp}
                onChange={e => setFormData({ ...formData, erp: e.target.value })}
                required
              />
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Message Headline</label>
          <input
            type="text"
            placeholder="Alert Subject..."
            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all font-black"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Global Content</label>
          <textarea
            rows="4"
            placeholder="Type your message here..."
            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all text-sm leading-relaxed"
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
        >
          {loading ? 'Transmitting...' : 'Send'}
        </button>
      </form>
    </motion.div>
  );
};

export default SuperAdminDashboard;
