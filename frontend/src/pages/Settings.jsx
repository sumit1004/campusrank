import React, { useState, useEffect } from 'react';
import { getUser, logout } from '../utils/auth';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const user = getUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', password: '' });

  // SuperAdmin specialized states
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [newClubName, setNewClubName] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin' && activeTab === 'superadmin') {
      fetchSuperAdminData();
    }
  }, [activeTab]);

  const fetchSuperAdminData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/superadmin/users'), 
        api.get('/clubs')
      ]);
      setUsers(uRes.data.data);
      setClubs(cRes.data.data);
    } catch(err) { toast.error('Failed to load superadmin specific data'); }
  };

  // Shared: Update Profile Settings
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/auth/profile', profile);
      toast.success('Profile updated successfully! Please re-login to see all changes.');
      logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally { setLoading(false); }
  };

  // Superadmin: Create Club
  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClubName) return;
    try {
      await api.post('/clubs', { name: newClubName });
      toast.success('Club added');
      setNewClubName('');
      fetchSuperAdminData();
    } catch (err) { toast.error('Failed to add club'); }
  };

  // Superadmin: Delete Club
  const handleDeleteClub = async (id) => {
    if (!window.confirm('Delete this club forever?')) return;
    try {
      await api.delete(`/clubs/${id}`);
      toast.success('Club deleted');
      fetchSuperAdminData();
    } catch (err) { toast.error('Failed to delete club'); }
  };

  // Superadmin: Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user completely? This will wipe their certificates.')) return;
    try {
      await api.delete(`/superadmin/user/${id}`);
      toast.success('User deleted');
      fetchSuperAdminData();
    } catch (err) { toast.error('Failed to delete user'); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Settings Navigation */}
      <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
        <button 
          onClick={()=>setActiveTab('profile')} 
          className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          My Profile
        </button>
        {user?.role === 'superadmin' && (
          <button 
            onClick={()=>setActiveTab('superadmin')} 
            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'superadmin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            System Management
          </button>
        )}
      </div>

      {/* Profile Form (All Users) */}
      {activeTab === 'profile' && (
        <div className="bg-[#111827] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Update Name</label>
              <input type="text" value={profile.name} onChange={(e)=>setProfile({...profile, name: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Update Email</label>
              <input type="email" value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">New Password (optional)</label>
              <input type="password" placeholder="Leave blank to keep current" value={profile.password} onChange={(e)=>setProfile({...profile, password: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Superadmin specific panel */}
      {activeTab === 'superadmin' && user?.role === 'superadmin' && (
        <div className="space-y-8">
          
          {/* Manage Clubs */}
          <div className="bg-[#111827] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Manage Clubs</h2>
            <form onSubmit={handleCreateClub} className="flex flex-col sm:flex-row gap-4 mb-6">
              <input type="text" placeholder="New club name..." value={newClubName} onChange={(e)=>setNewClubName(e.target.value)} className="flex-1 bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500" required />
              <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors w-full sm:w-auto">Add Club</button>
            </form>
            <div className="space-y-3">
              {clubs.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                  <span className="font-semibold text-gray-200">{c.name}</span>
                  <button onClick={()=>handleDeleteClub(c.id)} className="text-red-400 hover:text-red-300 font-bold text-sm">Delete</button>
                </div>
              ))}
              {clubs.length === 0 && <p className="text-gray-500 text-sm">No clubs found.</p>}
            </div>
          </div>

          {/* Manage Users (Deletions) */}
          <div className="bg-[#111827] border border-red-500/10 p-6 md:p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-red-400">Manage Users Component</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[400px]">
                <thead className="bg-[#0B0F19] text-gray-400 text-xs uppercase tracking-widest">
                  <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3 text-right">Danger Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="p-3 text-white">{u.name} <br/><span className="text-xs text-gray-500">{u.email}</span></td>
                      <td className="p-3"><span className="text-xs font-mono text-gray-400">{u.role}</span></td>
                      <td className="p-3 text-right">
                        {u.id !== user.id && (
                          <button onClick={()=>handleDeleteUser(u.id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded text-sm font-bold transition-all">Destroy</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}

    </div>
  );
};
export default Settings;
