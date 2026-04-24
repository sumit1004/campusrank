import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUser } from '../utils/auth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Users, Activity, FileText, Search, UserMinus, UserPlus, Bell, ClipboardList, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminDashboard = () => {
  const location = useLocation();
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
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // States Certificates
  const [certificates, setCertificates] = useState([]);
  const [certFilter, setCertFilter] = useState({ club: '', status: '', search: '' });

  // States Activities
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // States Monitoring
  const [formsMonitor, setFormsMonitor] = useState([]);
  const [badgeAudit, setBadgeAudit] = useState([]);
  const [selectedFormRegistrations, setSelectedFormRegistrations] = useState(null);

  const viewRegistrations = async (formId) => {
    try {
      const { data } = await api.get(`/forms/${formId}/submissions`);
      setSelectedFormRegistrations(data.data);
    } catch (e) {
      toast.error('Failed to load registration data');
    }
  };

  // Pagination States
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [certsPage, setCertsPage] = useState(1);
  const [certsTotal, setCertsTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync activeTab with URL parameters
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('analytics');
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'roles') loadRoleData();
    if (activeTab === 'certificates') loadCertificates();
    if (activeTab === 'activities') loadActivities();
    if (activeTab === 'forms-monitor') loadFormsMonitoring();
    if (activeTab === 'badges-audit') loadBadgesAudit();
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

  const loadRoleData = async (page = 1) => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        api.get(`/superadmin/users?page=${page}&limit=50`), 
        api.get('/clubs')
      ]);
      const sortedUsers = uRes.data.data.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return 0;
      });
      setUsers(sortedUsers);
      setUsersTotal(uRes.data.total);
      setClubs(cRes.data.data);
    } catch (e) {
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/superadmin/certificates?club=${certFilter.club}&status=${certFilter.status}&search=${certFilter.search}&page=${page}&limit=50`);
      setCertificates(data.data);
      setCertsTotal(data.total);
      if (!clubs.length) {
        const cRes = await api.get('/clubs');
        setClubs(cRes.data.data);
      }
    } catch (e) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);
      const { data } = await api.get('/superadmin/activities');
      setActivities(data.data);
    } catch (e) { 
      toast.error('Failed to load activity logs');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadFormsMonitoring = async () => {
    try {
      const { data } = await api.get('/superadmin/forms-monitoring');
      setFormsMonitor(data.data);
    } catch (e) { toast.error('Failed to load events monitor'); }
  };

  const loadBadgesAudit = async () => {
    try {
      const { data } = await api.get('/superadmin/badges-audit');
      setBadgeAudit(data.data);
    } catch (e) { toast.error('Failed to load badge audit'); }
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
      {/* Top Navigation Shifted to Sidebar */}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Users</p>
              <h2 className="text-4xl text-white font-black">{analytics.totalUsers}</h2>
            </div>
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Manual Uploads</p>
              <h2 className="text-4xl text-white font-black">{analytics.totalCerts}</h2>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Approved Manual</p>
              <h2 className="text-4xl text-indigo-100 font-black">{analytics.approvedCerts}</h2>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">Pending Manual</p>
              <h2 className="text-4xl text-purple-100 font-black">{analytics.pendingCerts}</h2>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-center text-center md:text-left">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">E-Certificates</p>
              <h2 className="text-4xl text-emerald-100 font-black">{analytics.totalECerts}</h2>
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
                    <span className="text-white font-bold">{c.total_manual}</span> manual / <span className="text-purple-400">{c.pending_manual}</span> pending / <span className="text-emerald-400">{c.total_e_certs}</span> e-certs
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
        <div className="space-y-8">
          {/* Local Search Header */}
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                  <Users className="text-indigo-500" size={28} />
                  Role Management Hub
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Found {users.length} total identities in system</p>
              </div>
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by name, ERP, or email..."
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" size={24} />
              Platform Administrators
            </h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
              <table className="w-full text-left min-w-[800px]">
                <thead className="sticky top-0 bg-[#111827] z-10 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  <tr><th className="p-4">Name / Email</th><th className="p-4">Role</th><th className="p-4">Club Hub</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users
                    .filter(u => (u.role === 'admin' || u.role === 'superadmin') && 
                      (u.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) || 
                       u.erp.toLowerCase().includes(roleSearchQuery.toLowerCase()) || 
                       u.email.toLowerCase().includes(roleSearchQuery.toLowerCase())))
                    .map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white uppercase tracking-tight">{u.name}</div>
                        <div className="text-xs font-mono text-gray-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'}`}>{u.role}</span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-400">
                        {clubs.find(c => c.id === u.club_id)?.name || <span className="text-gray-700">-</span>}
                      </td>
                      <td className="p-4 text-xs">
                        {u.role !== 'superadmin' && (
                          <div className="flex items-center gap-2">
                            <select className="bg-[#0B0F19] text-gray-300 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500" value={selectedClubId[u.id] || ''} onChange={e => setSelectedClubId({ ...selectedClubId, [u.id]: e.target.value })}>
                              <option value="">Shift Hub...</option>
                              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button onClick={() => handleChangeClub(u.id)} className="bg-white/10 hover:bg-white/20 text-white font-black px-3 py-1.5 rounded-lg transition uppercase tracking-tighter">Shift</button>
                            <button onClick={() => handleRemoveAdmin(u.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black px-3 py-1.5 rounded-lg transition uppercase tracking-tighter">Demote</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Section */}
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              <Users className="text-amber-500" size={24} />
              Platform Scholars (Students)
            </h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
              <table className="w-full text-left min-w-[800px]">
                <thead className="sticky top-0 bg-[#111827] z-10 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  <tr><th className="p-4">Student Profile</th><th className="p-4">Points</th><th className="p-4">Elite Promotion</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users
                    .filter(u => u.role === 'student' && 
                      (u.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) || 
                       u.erp.toLowerCase().includes(roleSearchQuery.toLowerCase()) || 
                       u.email.toLowerCase().includes(roleSearchQuery.toLowerCase())))
                    .map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white uppercase tracking-tight">{u.name}</div>
                        <div className="text-xs font-mono text-gray-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-amber-500 font-black tabular-nums">{u.total_points}</span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase ml-1">XP</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select className="bg-[#0B0F19] text-gray-300 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-48" value={selectedClubId[u.id] || ''} onChange={e => setSelectedClubId({ ...selectedClubId, [u.id]: e.target.value })}>
                            <option value="">Select Club Assignment...</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <button onClick={() => handleMakeAdmin(u.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2 rounded-xl transition-all uppercase tracking-tighter shadow-lg shadow-indigo-600/20 whitespace-nowrap">Promote to Admin</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Students */}
            {usersTotal > 50 && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  disabled={usersPage === 1 || loading}
                  onClick={() => { setUsersPage(p => p - 1); loadRoleData(usersPage - 1); }}
                  className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-30 transition-all"
                >
                  Previous
                </button>
                <span className="text-gray-500 font-bold text-xs flex items-center">
                  Page {usersPage} of {Math.ceil(usersTotal / 50)}
                </span>
                <button
                  disabled={usersPage * 50 >= usersTotal || loading}
                  onClick={() => { setUsersPage(p => p + 1); loadRoleData(usersPage + 1); }}
                  className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-30 transition-all"
                >
                  Next
                </button>
              </div>
            )}
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

          {/* Pagination for Certificates */}
          {certsTotal > 50 && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                disabled={certsPage === 1 || loading}
                onClick={() => { setCertsPage(p => p - 1); loadCertificates(certsPage - 1); }}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <span className="text-gray-500 font-bold text-xs flex items-center">
                Page {certsPage} of {Math.ceil(certsTotal / 50)}
              </span>
              <button
                disabled={certsPage * 50 >= certsTotal || loading}
                onClick={() => { setCertsPage(p => p + 1); loadCertificates(certsPage + 1); }}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Global Activity Audit</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time surveillance of all club admin actions</p>
              </div>
              <button 
                onClick={loadActivities}
                disabled={activitiesLoading}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <Activity size={20} className={activitiesLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[600px] sm:max-h-[650px] custom-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead className="text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5 sticky top-0 bg-[#111827] z-10">
                  <tr>
                    <th className="px-4 py-4">Timestamp</th>
                    <th className="px-4 py-4">Administrator</th>
                    <th className="px-4 py-4">Club Hub</th>
                    <th className="px-4 py-4">Action Signature</th>
                    <th className="px-4 py-4">Entity Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activities.map((log, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="text-xs font-mono text-gray-400">{new Date(log.created_at).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-white uppercase tracking-tight">{log.admin_name}</div>
                        <div className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${log.admin_role === 'superadmin' ? 'text-purple-400' : 'text-indigo-400'}`}>{log.admin_role}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase">{log.club_name || 'System Level'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-white uppercase border border-white/5 group-hover:border-indigo-500/30 transition-all">
                          {log.action_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[250px] truncate text-[10px] font-bold text-gray-600 bg-black/20 p-2 rounded-lg border border-white/5 group-hover:bg-black/40 transition-all">
                          {log.metadata ? JSON.stringify(log.metadata) : 'No metadata context'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activities.length === 0 && !activitiesLoading && (
                <div className="p-20 text-center text-gray-500 font-bold italic border-2 border-dashed border-white/5 rounded-3xl mt-4">
                  The logs are currently empty. Awaiting admin activity...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forms-monitor' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Event Registration Monitor</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Surveillance of all club-created registration forms</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Live Feed</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-4 py-4">Event / Club</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-4 py-4 text-center">Registrations</th>
                    <th className="px-4 py-4">Window (Start - End)</th>
                    <th className="px-4 py-4">Event Date</th>
                    <th className="px-4 py-4 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {formsMonitor.map((form, i) => {
                    const now = new Date();
                    const start = form.start_date ? new Date(form.start_date) : null;
                    const end = form.end_date ? new Date(form.end_date) : null;
                    let calculatedStatus = form.status;
                    if (form.status === 'active') {
                      if (start && now < start) calculatedStatus = 'coming-soon';
                      else if (end && now > end) calculatedStatus = 'expired';
                      else calculatedStatus = 'open';
                    }

                    return (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="font-bold text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{form.title}</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{form.club_name || 'Unlinked Club'}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                            calculatedStatus === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            calculatedStatus === 'coming-soon' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {calculatedStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-xl font-black text-white tracking-tighter">{form.submission_count}</div>
                          <div className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Entries</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[10px] font-bold text-gray-400">
                            {form.start_date ? new Date(form.start_date).toLocaleDateString() : 'N/A'} — 
                            {form.end_date ? new Date(form.end_date).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Registration Window</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[10px] font-black text-gray-300">{new Date(form.event_date).toLocaleDateString()}</div>
                          <div className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">Event Scheduled</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => viewRegistrations(form.id)}
                            className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            View Data
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {formsMonitor.length === 0 && (
              <div className="p-20 text-center text-gray-500 font-bold italic border-2 border-dashed border-white/5 rounded-3xl mt-4">
                No club events found in system.
              </div>
            )}
          </div>

          {/* Registration Data Modal */}
          {selectedFormRegistrations && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedFormRegistrations(null)}></div>
              <div className="bg-[#111827] border border-white/10 w-full max-w-5xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col">
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F19]">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Registration Data</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">List of students who enrolled via this form</p>
                  </div>
                  <button onClick={() => setSelectedFormRegistrations(null)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  {selectedFormRegistrations.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 font-black uppercase tracking-widest italic opacity-50">No submissions captured yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-gray-500 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                          <tr>
                            <th className="px-4 py-3">Student Identity</th>
                            <th className="px-4 py-3">ERP / Email</th>
                            <th className="px-4 py-3">Submission Date</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedFormRegistrations.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-4 font-bold text-white uppercase italic">{sub.student_name}</td>
                              <td className="px-4 py-4">
                                <div className="text-xs font-mono text-indigo-400">{sub.student_erp}</div>
                                <div className="text-[10px] text-gray-500 lowercase">{sub.student_email}</div>
                              </td>
                              <td className="px-4 py-4 text-xs text-gray-400 font-bold">{new Date(sub.created_at).toLocaleString()}</td>
                              <td className="px-4 py-4 text-right">
                                <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">Details</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges-audit' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-8">Badge Milestone Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#0B0F19] text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 font-black">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4 text-center">Current Tier</th>
                    <th className="p-4 text-center">Total Momentum</th>
                    <th className="p-4 text-right">Badge Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {badgeAudit.map((student, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white uppercase tracking-tight">{student.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{student.erp}</div>
                      </td>
                      <td className="p-4 text-center text-indigo-400 font-black italic">{student.badge_tier}</td>
                      <td className="p-4 text-center">
                        <span className="text-xl font-black text-white tabular-nums">{student.total_points}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase ml-1">XP</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {student.total_points >= 500 && <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400" title="Level 1"><Star size={12} fill="currentColor" /></div>}
                          {student.total_points >= 800 && <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400" title="Level 2"><Star size={12} fill="currentColor" /></div>}
                          {student.total_points >= 1000 && <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400" title="Level 3"><Star size={12} fill="currentColor" /></div>}
                          {student.total_points >= 1500 && <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400" title="Elite Badge"><Star size={12} fill="currentColor" /></div>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
