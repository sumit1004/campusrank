import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Target, Trophy, ArrowRight, Activity, Zap, Star } from 'lucide-react';

const clubNames = ["Coding Club", "Robotics Society", "Debate Team", "Entrepreneurship Cell", "Music Club", "Drama Society", "Sports Committee", "Art Club"];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/20 mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-accent/20 mix-blend-screen filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar Minimal */}
      <nav className="w-full flex items-center justify-between p-6 max-w-7xl mx-auto absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center font-extrabold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20">
            CR
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">CampusRank</span>
        </div>
        <div className="flex items-center space-x-8">
          <Link to="/login" className="text-gray-300 hover:text-white font-bold transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-gradient px-8 py-3 rounded-full text-base">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 cursor-pointer shadow-xl"
          >
            <Zap size={16} className="text-accent" fill="currentColor" />
            <span className="text-sm font-bold text-gray-200 tracking-wider">REDEFINING STUDENT REPUTATION</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
            Gamify Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
              Campus Life.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-normal">
            Upload certificates, gain permanent reputation across student clubs, and dominate the university leaderboard. The ultimate proof of work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full">
            <Link to="/signup" className="w-full sm:w-auto btn-gradient rounded-2xl flex items-center justify-center space-x-2 text-xl py-4 px-10">
              <span>Start Climbing</span>
              <ArrowRight size={22} />
            </Link>
            <Link to="/leaderboard" className="w-full sm:w-auto px-10 py-4 rounded-2xl border-2 border-white/10 bg-surface/50 hover:bg-surfaceLight hover:border-white/20 text-white font-bold transition-all shadow-xl text-xl flex items-center justify-center">
              View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 w-full text-left relative z-20">
          {[
            { icon: <Shield size={28} className="text-accent" />, title: "Verified Credentials", desc: "Admins verify every certificate uploaded to ensure a fully trusted, fraud-free ecosystem." },
            { icon: <Target size={28} className="text-primary" />, title: "Earn Reputation", desc: "Accumulate points dynamically based on your specific podium rank in cross-club events." },
            { icon: <Trophy size={28} className="text-yellow-400" />, title: "Global Leaderboard", desc: "Climb the ranks and aggressively compete against peers across the entire university." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ delay: 0.3 + (idx * 0.1), type: "spring", stiffness: 300 }}
              className="glass-card p-10 rounded-[2.5rem] group relative overflow-hidden flex flex-col justify-between h-full"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
              
              <div className="w-16 h-16 rounded-[1.25rem] bg-surfaceLight border border-white/10 flex items-center justify-center mb-8 shadow-inner relative z-10 group-hover:bg-white/10 transition-colors">
                {feature.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium text-lg">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Animated Club Strip */}
      <div className="w-full overflow-hidden whitespace-nowrap py-10 mt-16 border-y border-white/5 bg-surface/50 backdrop-blur-md relative transform -skew-y-1 z-10">
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        <div className="animate-marquee inline-flex space-x-16 px-6 items-center">
          {[...clubNames, ...clubNames, ...clubNames].map((club, idx) => (
            <div key={idx} className="flex items-center space-x-4 text-gray-400 font-black text-3xl tracking-tighter opacity-40 hover:opacity-100 hover:text-white transition-all cursor-default">
              <Star size={20} className="text-primary opacity-50" fill="currentColor" />
              <span>{club}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Landing;
