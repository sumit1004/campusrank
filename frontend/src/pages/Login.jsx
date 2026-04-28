import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear old data before login
    localStorage.clear();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error('Please fill in all fields');
    try {
      setLoading(true);
      const res = await api.post('/auth/login', formData);
      const loggedInUser = res.data.user;

      console.log("USER:", loggedInUser);

      login(loggedInUser, res.data.token);
      toast.success('Welcome back!');

      if (loggedInUser.role === 'superadmin') {
        navigate('/superadmin-dashboard');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0F19]">
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /><span>Back home</span>
      </Link>

      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md bg-[#111827] p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2rem] relative z-10 border border-white/5 shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-500">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#0B0F19] border border-white/5 shadow-lg shadow-indigo-500/10 flex items-center justify-center mb-6 transform -rotate-6 group-hover:rotate-0 transition-all p-3">
            <img src="/logo.png" alt="CampusRank Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">CampusRank</h1>
          <p className="text-gray-400 font-medium">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0B0F19] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 shadow-inner group-hover:border-white/10" placeholder="student@campus.edu" />
          </div>
          <div className="space-y-2 pb-2 group">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0B0F19] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 shadow-inner group-hover:border-white/10" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 hover:from-purple-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 transform hover:-translate-y-1 text-white font-bold rounded-xl py-4 disabled:opacity-70 text-lg">
            {loading ? <span className="animate-pulse font-bold">Authenticating...</span> : <span className="font-bold">Login</span>}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 font-medium">
          New to CampusRank? <Link to="/signup" className="text-white hover:text-indigo-400 transition-colors ml-1 font-bold">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
