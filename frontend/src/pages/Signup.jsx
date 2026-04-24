import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', erp: '', email: '', password: '', course: '', branch: '', semester: '', college: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.erp || !formData.email || !formData.password) {
      return toast.error('Please fill in all fields');
    }
    try {
      setLoading(true);
      await api.post('/auth/signup', formData);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /><span>Back home</span>
      </Link>

      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 blur-[130px] rounded-full pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md glass-panel p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2rem] z-10 border border-white/10 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary shadow-lg shadow-secondary/30 flex items-center justify-center text-white mb-6 transform -rotate-6 group-hover:rotate-0 transition-all">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Join CampusRank</h1>
          <p className="text-gray-400 font-medium">Start proving your achievements</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
            <input type="text" name="name" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="Sumit Kumar" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">ERP / Student ID</label>
            <input type="text" name="erp" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="6601234" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="student@campus.edu" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
            <input type="password" name="password" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Course</label>
              <input type="text" name="course" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="B.Tech" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Semester</label>
              <input type="text" name="semester" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="4th" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Branch</label>
            <input type="text" name="branch" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="Computer Science" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">College Name</label>
            <input type="text" name="college" onChange={handleChange} className="w-full bg-surfaceLight border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="RISU/RCET" />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-gradient py-4 mt-4 text-lg">
            {loading ? <span className="animate-pulse font-bold">Creating Account...</span> : <span className="font-bold">Sign Up Free</span>}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 font-medium">
          Already have an account? <Link to="/login" className="text-white hover:text-primary font-bold transition-colors ml-1">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Signup;
