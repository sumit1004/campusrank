import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Crown,
  FileCheck2,
  Flame,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  Users,
  Diamond,
  Gem,
} from 'lucide-react';

import api from '../services/api';

const COLLEGE_NAME = 'Rungta International Skills University';
const POWERED_BY = 'Powered by RIU';

// Assets are served from Vite `public/` at runtime.
// Use BASE_URL so this works in dev + production (even if deployed under a sub-path).
const BASE_URL = import.meta.env.BASE_URL || '/';
const CAMPUS_IMG = `${BASE_URL}college-image.png`;
const CAMPUS_IMG_FALLBACK = `${BASE_URL}college-image.png`;
const LOGO_IMG = `${BASE_URL}logos.png`;
const LOGO_IMG_FALLBACK = `${BASE_URL}logos.png`;
const SUMIT_IMG = `${BASE_URL}myimg.jpg`;
const SUMIT_IMG_FALLBACK = `${BASE_URL}myimg.jpg`;

const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`relative w-full px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-24 ${className.replace(/py-\d+|pt-\d+|pb-\d+|sm:py-\d+|sm:pt-\d+|sm:pb-\d+/g, '')}`}>
    <div className="mx-auto w-full max-w-7xl">{children}</div>
  </section>
);

const GlowCard = ({ children, className = '' }) => (
  <div
    className={[
      'relative overflow-hidden rounded-3xl border',
      'border-white/10 bg-white/5 shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl',
      'transition-all will-change-transform hover:-translate-y-1 hover:shadow-[0_18px_70px_rgba(0,0,0,0.65)]',
      className,
    ].join(' ')}
  >
    <div className="pointer-events-none absolute -inset-32 opacity-60 blur-3xl">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-indigo-500/25 dark:bg-indigo-500/20" />
      <div className="absolute right-10 top-24 h-56 w-56 rounded-full bg-cyan-400/25 dark:bg-cyan-400/15" />
      <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 dark:bg-fuchsia-500/15" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

const BadgeCard = ({ name, tier, icon: Icon, progress, status, color }) => {
  const isLocked = status === 'Locked';
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -10 }}
      className="relative group"
    >
      <div
        className="relative w-full aspect-[4/5] p-[1px]"
        style={{
          clipPath: 'polygon(0 0, 85% 0, 100% 12%, 100% 100%, 15% 100%, 0 88%)',
          background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`
        }}
      >
        <div
          className="w-full h-full bg-[#111319] flex flex-col items-center justify-between py-6 px-3 sm:py-10 sm:px-6"
          style={{
            clipPath: 'polygon(0 0, 85% 0, 100% 12%, 100% 100%, 15% 100%, 0 88%)',
          }}
        >
          {/* Icon Box */}
          <div className="relative mb-2">
            <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-[0.8rem] sm:rounded-2xl border-2 flex items-center justify-center bg-white/[0.03] ${color.border} shadow-2xl`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color.text}`} strokeWidth={1.5} />
            </div>
            {/* Inner Glow */}
            <div className={`absolute inset-0 blur-2xl opacity-20 ${color.bg} rounded-full`} />
          </div>

          <div className="text-center">
            <h3 className="text-sm sm:text-2xl font-bold text-white tracking-tight">{name}</h3>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mt-1">{tier}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full px-1 sm:px-2">
            <div className="h-1 sm:h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full ${color.progressBg} relative rounded-full`}
              >
                {progress > 0 && (
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-4 sm:h-4 blur-md ${color.bg} rounded-full`} />
                )}
              </motion.div>
            </div>
          </div>

          <button className={`w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all border ${isLocked
            ? 'bg-white/[0.02] border-white/10 text-white/20'
            : `bg-white/[0.03] ${color.border} ${color.text} shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:scale-[1.02]`
            }`}>
            {status}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProcessStep = ({ number, title, desc, icon: Icon, color, isFirst, isLast }) => {
  return (
    <motion.div
      variants={fadeUp}
      className="relative w-full group"
    >
      {/* Desktop Chevron Shape */}
      <div
        className="hidden lg:block relative p-[1px]"
        style={{
          clipPath: isFirst
            ? 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)'
            : isLast
              ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 15% 50%)'
              : 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)',
          background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))`
        }}
      >
        <div
          className={`relative h-[350px] bg-[#0F1117] flex flex-col items-center justify-between py-12 ${isFirst ? 'px-10' : 'pl-20 pr-12'}`}
          style={{
            clipPath: isFirst
              ? 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)'
              : isLast
                ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 15% 50%)'
                : 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500" style={{ background: color.gradient }} />

          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:scale-110 group-hover:text-white transition-all duration-500`}>
              <Icon size={24} />
            </div>
            <span className="text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors duration-500 leading-none">{number}</span>
          </div>

          <div className="relative z-10 text-center">
            <h3 className="text-xl font-black text-white mb-3 tracking-wider uppercase leading-tight">{title}</h3>
            <p className="text-sm text-white/40 font-medium leading-relaxed max-w-[220px] mx-auto">
              {desc}
            </p>
          </div>

          <div className="w-24 h-1 rounded-full relative overflow-hidden bg-white/5">
            <motion.div
              initial={{ x: '-100%' }}
              whileInView={{ x: '0%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`absolute inset-0 ${color.solid}`}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Card Shape */}
      <div className="lg:hidden relative p-[1px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/10 to-transparent">
        <div className="relative bg-[#0F1117] p-8 rounded-[2rem] overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${color.solid} -translate-y-1/2 translate-x-1/2`} />

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-white/20">{number}</span>
              <h3 className="text-lg font-black text-white tracking-widest uppercase">{title}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <Icon size={18} />
            </div>
          </div>

          <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">
            {desc}
          </p>

          <div className="h-1 w-full rounded-full bg-white/5 relative overflow-hidden">
            <div className={`absolute left-0 top-0 h-full w-1/3 ${color.solid}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardCard = ({ data, rank, isMain }) => {
  if (!data) return null;

  const config = {
    1: {
      bg: 'bg-amber-500',
      glow: 'shadow-[0_0_50px_rgba(251,191,36,0.2)]',
      border: 'border-amber-500/30',
      badge: 'bg-amber-400 text-black',
      imgBg: 'bg-gradient-to-t from-amber-600 to-amber-400',
      rankText: 'RANK #01',
      showStats: true,
      clubColor: 'text-amber-400',
    },
    2: {
      bg: 'bg-slate-400',
      glow: 'shadow-none',
      border: 'border-white/10',
      badge: 'bg-slate-600 text-white',
      imgBg: 'bg-slate-800',
      rankText: '2',
      showStats: false,
      clubColor: 'text-white/40',
    },
    3: {
      bg: 'bg-rose-500',
      glow: 'shadow-none',
      border: 'border-white/10',
      badge: 'bg-rose-600 text-white',
      imgBg: 'bg-gradient-to-t from-rose-700 to-rose-500',
      rankText: '3',
      showStats: false,
      clubColor: 'text-white/40',
    },
  }[rank] || {};

  return (
    <motion.div
      variants={fadeUp}
      className={`relative ${isMain ? 'w-[36%] lg:w-[42%] order-1 lg:order-2 shrink-0' : 'w-[28%] lg:w-[29%] order-2 lg:order-1 shrink-0'} group`}
    >
      <div
        className={`h-full rounded-2xl sm:rounded-[2.5rem] bg-[#111319] border ${isMain ? config.border : 'border-white/5'} p-2 sm:p-8 flex flex-col items-center transition-all duration-500 group-hover:bg-[#151821] ${isMain ? config.glow : ''}`}
      >
        {isMain && (
          <div className="absolute top-2 left-2 sm:top-8 sm:left-8 text-amber-500">
            <Crown className="w-4 h-4 sm:w-8 sm:h-8" fill="currentColor" />
          </div>
        )}

        {/* Avatar Section */}
        <div className="relative mb-5 sm:mb-8 mt-2 sm:mt-0">
          <div className={`relative ${isMain ? 'w-20 h-20 sm:w-48 sm:h-48' : 'w-14 h-14 sm:w-32 sm:h-32'} mx-auto overflow-hidden rounded-xl sm:rounded-3xl p-[2px] ${isMain ? 'bg-amber-500/50' : 'bg-white/10'}`}>
            <div className={`w-full h-full rounded-xl sm:rounded-3xl overflow-hidden ${config.imgBg} relative`}>
              <img
                src={SUMIT_IMG}
                alt={data.name}
                className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Rank Badge */}
          {isMain ? (
            <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-6 py-0.5 sm:py-2 rounded-lg sm:rounded-xl bg-amber-400 text-black font-black text-[8px] sm:text-xs shadow-xl min-w-[60px] sm:min-w-[100px] text-center whitespace-nowrap">
              {config.rankText}
            </div>
          ) : (
            <div className={`absolute -right-1 sm:-right-2 -bottom-2 sm:bottom-6 w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-xl ${config.badge} flex items-center justify-center font-black text-[10px] sm:text-sm shadow-xl`}>
              {config.rankText}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center mb-4 sm:mb-8">
          <h3 className={`${isMain ? 'text-xs sm:text-4xl' : 'text-[10px] sm:text-2xl'} font-black text-white mb-1 md:mb-2 truncate w-[70px] sm:w-auto mx-auto`}>{data.name}</h3>
          <p className={`text-[6px] sm:text-xs font-black uppercase tracking-[0.2em] ${config.clubColor} truncate w-[60px] sm:w-auto mx-auto`}>{data.club}</p>
        </div>

        {/* Stats */}
        <div className={`w-full grid ${isMain ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2 sm:gap-4 pt-2 sm:pt-8 border-t border-white/5`}>
          <div className="text-center">
            <p className="text-[6px] sm:text-[10px] uppercase font-black text-white/30 tracking-widest mb-1 sm:mb-2">Total Points</p>
            <p className={`${isMain ? 'text-sm sm:text-3xl' : 'text-xs sm:text-2xl'} font-black text-white`}>{data.points ? data.points.toLocaleString() : 0}</p>
          </div>
          {isMain && (
            <div className="hidden sm:block text-center border-l border-white/5">
              <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Win Rate</p>
              <p className="text-3xl font-black text-white">94%</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const Landing = () => {
  const prefersReducedMotionReal = useReducedMotion();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const prefersReducedMotion = prefersReducedMotionReal;
  const [campusSrc, setCampusSrc] = useState(CAMPUS_IMG);
  const [logoSrc, setLogoSrc] = useState(LOGO_IMG);
  const [points, setPoints] = useState(0);
  const [clubs, setClubs] = useState([
    'Infnity Coders',
    'Infinity E-sports',
    'Rangmanch',
    'Rangvijay',
    'Carpedium',
    'Rag',
    'RUBI',
    'Radiction',
    'Toast Masters',
    'Radiance',
    'RISE',
    'NSS',
    'Beacon',
    'COPE',
    'Raise'
  ]);
  const [top3, setTop3] = useState([
    { name: 'Sumit', club: 'Infinity eSports', points: 1280 },
    { name: 'Sumit', club: 'Infinity Coders', points: 1195 },
    { name: 'Sumit', club: 'Rangmanch', points: 1110 },
  ]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPoints(240);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const durationMs = 1000;
    const target = 240;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setPoints(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [clubsRes, lbRes] = await Promise.allSettled([api.get('/clubs'), api.get('/leaderboard')]);

        if (!cancelled && clubsRes.status === 'fulfilled') {
          const data = clubsRes.value?.data?.data;
          if (Array.isArray(data) && data.length) {
            const names = data.map((c) => c?.name).filter(Boolean);
            if (names.length) setClubs(names);
          }
        }

        if (!cancelled && lbRes.status === 'fulfilled') {
          const rows = lbRes.value?.data?.data;
          if (Array.isArray(rows) && rows.length) {
            const normalized = rows
              .slice(0, 3)
              .map((r, idx) => ({
                name: r?.name || `User ${idx + 1}`,
                club: r?.club_name || r?.club || 'Campus',
                points: Number(r?.total_points ?? r?.points ?? 0),
              }))
              .filter((r) => r.name);
            if (normalized.length >= 3) setTop3(normalized);
          }
        }
      } catch {
        // Keep visual fallbacks on landing
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const palette = useMemo(
    () => ({
      pageBg: 'bg-[#0B0F19]',
      sectionBg: '',
      cardBg: 'bg-white/5',
      text: 'text-white',
      muted: 'text-white/70',
      border: 'border-white/10',
      primary: 'text-white',
    }),
    []
  );

  const navLinks = useMemo(
    () => [
      { label: 'How it works', href: '#how' },
      { label: 'Badges', href: '#badges' },
      { label: 'Clubs', href: '#clubs' },
      { label: 'Leaderboard', href: '#leaderboard' },
      { label: 'About', href: '#about' },
    ],
    []
  );

  const flow = useMemo(
    () => [
      { label: 'Certificate', icon: FileCheck2, tint: 'from-indigo-500/30 to-cyan-400/15' },
      { label: 'Verified', icon: BadgeCheck, tint: 'from-emerald-500/25 to-cyan-400/10' },
      { label: `+${points} pts`, icon: Flame, tint: 'from-fuchsia-500/25 to-indigo-500/10' },
      { label: 'Rank ↑', icon: Trophy, tint: 'from-amber-400/25 to-fuchsia-500/10' },
      { label: 'Badge', icon: Award, tint: 'from-cyan-400/25 to-emerald-400/10' },
    ],
    [points]
  );

  const MotionWrapper = prefersReducedMotion ? 'div' : motion.div;

  return (
    <div className={`min-h-screen ${palette.text} overflow-x-hidden`}>
      {/* HERO BACKDROP */}
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <img
            src={campusSrc}
            alt={`${COLLEGE_NAME} campus`}
            className="h-[100vh] w-full object-cover"
            onError={() => {
              if (campusSrc !== CAMPUS_IMG_FALLBACK) setCampusSrc(CAMPUS_IMG_FALLBACK);
            }}
          />
          <div className="absolute inset-0 bg-[rgb(0_0_0/56%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0B0F19]" />
          <div className="absolute inset-0 backdrop-blur-[5px]" />
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl dark:bg-indigo-500/20" />
          <div className="pointer-events-none absolute -right-24 top-28 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-400/15" />
        </div>

        {/* NAVBAR */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/45 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-1 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden">
                <img
                  src={logoSrc}
                  alt={`${COLLEGE_NAME} logo`}
                  className="h-15 w-15 object-contain"
                  onError={() => {
                    if (logoSrc !== LOGO_IMG_FALLBACK) setLogoSrc(LOGO_IMG_FALLBACK);
                  }}
                />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight">CampusRank</span>
                  <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/70 sm:inline">
                    {POWERED_BY}
                  </span>
                </div>
                <div className={`hidden text-xs ${palette.muted} sm:block`}>{COLLEGE_NAME}</div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden rounded-2xl px-3 py-2 text-sm font-semibold text-white/70 hover:text-white md:inline">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(99,102,241,0.35)] transition hover:scale-[1.02] active:scale-[0.99]"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <Section className="pt-14 sm:pt-20">
          <div className="grid grid-cols-1 items-center gap-12 sm:gap-10 pb-8 lg:grid-cols-2 lg:pb-16">
            <MotionWrapper
              {...(!prefersReducedMotion
                ? { initial: 'hidden', animate: 'show', variants: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } } }
                : {})}
              className="relative pt-4 sm:pt-0"
            >
              <motion.div variants={fadeUp} className="inline-flex self-start items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-extrabold tracking-wide text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <Sparkles size={14} />
                <span>Certificates → Rank, instantly visual</span>
              </motion.div>

              {/* MOBILE TEXT */}
              <div className="block sm:hidden">
                <motion.h1
                  variants={fadeUp}
                  className="mt-6 text-4xl font-black tracking-tight leading-tight"
                >
                  Track your achievements, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">rank up.</span>
                </motion.h1>

                <motion.p variants={fadeUp} className={`mt-4 text-[13px] font-medium ${palette.muted} leading-relaxed`}>
                  Turn your participation certificates into campus rankings, exclusive badges, and undeniable proof of your skills.
                </motion.p>
              </div>

              {/* DESKTOP TEXT */}
              <div className="hidden sm:block">
                <motion.h1
                  variants={fadeUp}
                  className="mt-5 text-6xl md:text-7xl font-black tracking-tight"
                >
                  CampusRank
                </motion.h1>

                <motion.p variants={fadeUp} className={`mt-3 text-xl font-semibold ${palette.muted}`}>
                  Your Certificates. Your Rank.
                </motion.p>
              </div>

              {/* VISUAL FLOW */}
              <motion.div
                variants={fadeUp}
                className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
              >
                <div className="flex justify-between items-center sm:grid sm:grid-cols-5 sm:gap-2">
                  {flow.map((f, idx) => {
                    const Icon = f.icon;
                    const isLast = idx === flow.length - 1;
                    return (
                      <motion.div
                        key={f.label}
                        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? undefined : { delay: 0.12 + idx * 0.12, duration: 0.5, ease: 'easeOut' }}
                        className="relative"
                      >
                        <div
                          className="relative flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] p-2 sm:p-4 sm:flex-col sm:items-start sm:justify-start backdrop-blur-md"
                        >
                          <div className={`absolute inset-0 -z-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.tint}`} />
                          <div className="flex flex-col items-center gap-1.5 sm:gap-3 sm:items-start">
                            <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 text-white">
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            {/* MOBILE LABEL */}
                            <div className="block sm:hidden min-w-0 text-white text-center">
                              <div className="text-[9px] font-extrabold tracking-tight leading-tight max-w-[50px] truncate">{f.label}</div>
                            </div>
                            {/* DESKTOP LABEL */}
                            <div className="hidden sm:block min-w-0 text-white">
                              <div className="text-sm font-extrabold tracking-tight">{f.label}</div>
                              <div className="text-xs text-white/50">{idx === 1 ? 'Admin check' : idx === 3 ? 'Climb' : ' '}</div>
                            </div>
                          </div>

                          {idx === 2 && (
                            <div className="hidden sm:block">
                              <motion.div
                                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                                transition={prefersReducedMotion ? undefined : { delay: 0.7, duration: 0.4 }}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-white/70 uppercase tracking-widest"
                              >
                                +{points}
                              </motion.div>
                            </div>
                          )}

                          {isLast && (
                            <motion.div
                              initial={prefersReducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
                              animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                              transition={prefersReducedMotion ? undefined : { delay: 0.9, type: 'spring', stiffness: 240, damping: 16 }}
                              className="absolute -right-2 -top-2 hidden sm:block"
                            >
                              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-white shadow-[0_0_30px_rgba(251,191,36,0.35)] ring-1 ring-black/10 dark:ring-white/10">
                                <Crown size={18} />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* ARROWS */}
                        {idx < flow.length - 1 && (
                          <div className="hidden sm:block">
                            <motion.div
                              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                              transition={prefersReducedMotion ? undefined : { delay: 0.22 + idx * 0.12, duration: 0.4 }}
                              className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/25"
                            >
                              <ArrowRight size={18} />
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:scale-105 active:scale-[0.99] sm:w-auto"
                >
                  Get Started
                  <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/leaderboard"
                  className="hidden sm:inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-extrabold text-white/90 shadow-sm transition hover:bg-white/10 sm:w-auto"
                >
                  View Leaderboard
                  <Trophy size={18} />
                </Link>
              </motion.div>

              <motion.a
                variants={fadeUp}
                href="#how"
                className={`mt-10 inline-flex items-center gap-2 text-sm font-semibold ${palette.muted} hover:opacity-80`}
              >
                <ChevronDown size={16} />
                <span>Scroll</span>
              </motion.a>
            </MotionWrapper>

            {/* RIGHT HERO VISUAL */}
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 24 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? undefined : { duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="relative"
            >
              <GlowCard className="p-5 sm:p-6 bg-[#111827]/40 ring-1 ring-white/10">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white">Verification</div>
                          <div className="text-xs text-white/40">Trusted by admins</div>
                        </div>
                      </div>
                      <motion.div
                        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                        transition={prefersReducedMotion ? undefined : { delay: 0.55, type: 'spring', stiffness: 260, damping: 18 }}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-extrabold text-white/60"
                      >
                        Verified
                      </motion.div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-full bg-white/5">
                        <motion.div
                          initial={prefersReducedMotion ? undefined : { width: '15%' }}
                          animate={prefersReducedMotion ? undefined : { width: '88%' }}
                          transition={prefersReducedMotion ? undefined : { duration: 1.1, ease: 'easeOut', delay: 0.35 }}
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        />
                      </div>
                      <div className="text-xs text-white/40 uppercase tracking-widest font-black text-[8px]">Auto-logged approvals</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                          <LayoutDashboard size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold">Live Rank</div>
                          <div className="text-xs text-white/40">Updates instantly</div>
                        </div>
                      </div>
                      <motion.div
                        initial={prefersReducedMotion ? undefined : { y: 6, opacity: 0 }}
                        animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
                        transition={prefersReducedMotion ? undefined : { delay: 0.65, duration: 0.45 }}
                        className="text-sm font-black text-white/80"
                      >
                        #02
                      </motion.div>
                    </div>
                    <div className="mt-6 flex items-end justify-center gap-3">
                      {[
                        { name: 'Sumit', rank: 2, h: 'h-16', img: `${SUMIT_IMG}` },
                        { name: 'Sumit', rank: 1, h: 'h-20', img: `${SUMIT_IMG}` },
                        { name: 'Sumit', rank: 3, h: 'h-14', img: `${SUMIT_IMG}` },
                      ].map((u, i) => (
                        <motion.div
                          key={u.rank}
                          initial={prefersReducedMotion ? undefined : { y: 15, opacity: 0 }}
                          animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
                          transition={prefersReducedMotion ? undefined : { delay: 0.6 + i * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.05 }}
                          className={`relative flex flex-col items-center gap-2 ${u.h} w-16 group transition-all`}
                        >
                          <div className="relative w-full h-full">
                            <img
                              src={u.img}
                              alt={u.name}
                              className="h-full w-full object-cover rounded-xl border border-white/20 shadow-xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl" />
                            {u.rank === 1 && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                <Crown size={14} fill="currentColor" />
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-1.5 py-0.5 text-[7px] font-black text-white shadow-lg backdrop-blur-md border border-white/20">
                              #{u.rank}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] font-black leading-none">{u.name}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-white">
                        <Award size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white">Badge Unlock</div>
                        <div className="text-xs text-white/40">Progress feels rewarding</div>
                      </div>
                    </div>
                    <motion.div
                      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={prefersReducedMotion ? undefined : { delay: 0.85, type: 'spring', stiffness: 240, damping: 14 }}
                      className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70"
                    >
                      <CheckCircle2 size={18} />
                    </motion.div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {['Bronze', 'Silver', 'Gold', 'Elite'].map((b, i) => (
                      <motion.div
                        key={b}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="text-[11px] font-extrabold text-white">{b}</div>
                        <div className="mt-1 text-[10px] text-white/40 uppercase tracking-widest font-black text-[7px]">{i < 2 ? 'Unlocked' : 'Locked'}</div>
                        {i >= 2 && (
                          <div className="absolute right-2 top-2 text-white/10">
                            <Lock size={14} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </Section>
      </div>

      {/* HOW IT WORKS */}
      <Section id="how" className="py-24 sm:py-32 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center lg:text-left"
        >
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Workflow</div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
            Three steps. All momentum.
          </h2>
          <p className="text-lg text-white/40 font-medium max-w-2xl mx-auto lg:mx-0">
            A frictionless ecosystem designed to verify your achievements and boost your campus reputation instantly.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } },
          }}
          className="flex flex-col lg:flex-row items-center justify-center lg:gap-[-20px]"
        >
          {[
            {
              number: '01',
              title: 'Upload Certificate',
              desc: 'Visual progress, minimal effort. Our AI instantly parses your document for key metadata and validates authenticity.',
              icon: Upload,
              color: {
                gradient: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                solid: 'bg-blue-600'
              },
              isFirst: true
            },
            {
              number: '02',
              title: 'Admin Verification',
              desc: 'Visual progress, minimal effort. Human-in-the-loop validation ensures 100% data integrity and campus-wide trust.',
              icon: ShieldCheck,
              color: {
                gradient: 'linear-gradient(135deg, #10B981, #34D399)',
                solid: 'bg-emerald-500'
              }
            },
            {
              number: '03',
              title: 'Earn Points',
              desc: 'Visual progress, minimal effort. Your verified achievements translate directly into campus rank and exclusive rewards.',
              icon: Gem,
              color: {
                gradient: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
                solid: 'bg-purple-600'
              },
              isLast: true
            }
          ].map((step, idx) => (
            <ProcessStep key={step.number} {...step} />
          ))}
        </motion.div>
      </Section>

      {/* DASHBOARD PREVIEW */}
      <Section className="hidden sm:block pb-16 sm:pb-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -22 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>Dashboard preview</div>
            <div className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Everything you need at a glance</div>
            <div className={`mt-3 text-sm ${palette.muted}`}>Points, rank, uploads, approvals, and badges—made instantly readable.</div>
            <div className="mt-6 flex gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_55px_rgba(99,102,241,0.28)] transition hover:scale-[1.02] active:scale-[0.99]"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-extrabold text-white/90 shadow-sm transition hover:bg-white/10 sm:w-auto"
              >
                Open Dashboard
                <LayoutDashboard size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: 22 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <GlowCard className="p-5 sm:p-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                  </div>
                  <div className={`text-xs font-extrabold ${palette.muted}`}>CampusRank</div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-extrabold ${palette.muted}`}>Your Rank</div>
                      <div className="text-sm font-black">#02</div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-extrabold ${palette.muted}`}>Points</div>
                      <div className="text-sm font-black">{points}</div>
                    </div>
                    <div className={`mt-2 text-[11px] ${palette.muted}`}>Verified uploads boost faster</div>
                  </div>
                </div>
                <div className="mt-3 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl transition-all hover:-translate-y-1 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-extrabold ${palette.muted}`}>Recent activity</div>
                    <div className={`text-[11px] ${palette.muted}`}>Live</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      { icon: FileCheck2, text: 'Certificate uploaded', chip: 'Pending' },
                      { icon: BadgeCheck, text: 'Verified by Admin', chip: 'Approved' },
                      { icon: Award, text: 'Badge progress updated', chip: 'Unlocked' },
                    ].map((a) => {
                      const Icon = a.icon;
                      return (
                        <div key={a.text} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/10 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-black/5 text-white/70 dark:bg-white/5 dark:text-white/75">
                              <Icon size={16} />
                            </div>
                            <div className="text-sm font-semibold">{a.text}</div>
                          </div>
                          <div className="rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-extrabold text-white/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                            {a.chip}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </Section>

      {/* BADGES */}
      <Section id="badges" className="py-20 sm:py-32">
        <div className="relative mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Campus Milestone Badges
            </h2>
            <p className="text-lg text-white/40 font-medium max-w-xl">
              Elevate your campus journey to unlock premium honors and elite performance recognition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 self-start md:self-auto"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Season 01 Active
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
        >
          {[
            {
              name: 'Bronze',
              tier: 'Foundation Tier',
              icon: Award,
              progress: 100,
              status: 'Unlocked',
              color: {
                text: 'text-orange-400',
                border: 'border-orange-500/30',
                bg: 'bg-orange-500',
                progressBg: 'bg-gradient-to-r from-orange-400 to-amber-600 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
              }
            },
            {
              name: 'Silver',
              tier: 'Practitioner Tier',
              icon: BadgeCheck,
              progress: 45,
              status: 'Unlocked',
              color: {
                text: 'text-blue-400',
                border: 'border-blue-500/30',
                bg: 'bg-blue-500',
                progressBg: 'bg-gradient-to-r from-blue-400 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
              }
            },
            {
              name: 'Gold',
              tier: 'Mastery Tier',
              icon: Trophy,
              progress: 30,
              status: 'Locked',
              color: {
                text: 'text-amber-400',
                border: 'border-amber-500/30',
                bg: 'bg-amber-500',
                progressBg: 'bg-gradient-to-r from-amber-400 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
              }
            },
            {
              name: 'Elite',
              tier: 'Visionary Tier',
              icon: Diamond,
              progress: 0,
              status: 'Locked',
              color: {
                text: 'text-cyan-400',
                border: 'border-cyan-500/30',
                bg: 'bg-cyan-500',
                progressBg: 'bg-white/10',
              }
            },
          ].map((badge) => (
            <BadgeCard key={badge.name} {...badge} />
          ))}
        </motion.div>



      </Section>

      {/* CLUB SYSTEM */}
      <Section id="clubs" className="py-20 sm:h-[80vh] relative flex flex-col items-center justify-center overflow-hidden bg-[#0B0F19]">

        {/* CONTENT OVERLAY */}
        <div className="relative z-30 text-center select-none pointer-events-none mb-10 sm:mb-0">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-[#5850EC] shadow-2xl">
            The Network
          </div>
          <h2 className="text-4xl sm:text-9xl font-black tracking-tighter text-white sm:blur-[1px]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/5 opacity-70 ">
              Active Clubs
            </span>
          </h2>
          <p className="mt-4 text-[10px] sm:text-sm font-bold text-white/30 tracking-[0.4em] uppercase">
            Join the ecosystem
          </p>
        </div>

        {/* STRIPS LAYER - Positioned behind/around the text */}
        <div className="relative sm:absolute inset-0 flex flex-col items-center justify-center overflow-hidden pointer-events-auto h-40 sm:h-auto z-10 sm:-z-0">
          <style>{`
            @keyframes horizontalMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .club-strip-container {
              position: absolute;
              width: 150vw;
              min-width: 150vw;
              overflow: hidden;
              left: 50%;
              transform: translateX(-50%);
            }
            .club-strip-content {
              display: flex;
              white-space: nowrap;
              width: max-content;
            }
          `}</style>

          {/* STRIP 1 - Slanted Downwards (Decreased height) */}
          <div className="club-strip-container z-10 translate-y-[-20px] sm:translate-y-0" style={{ transform: 'translateX(-50%) rotate(var(--tilt-angle, 12deg))' }}>
            <div className="bg-[#5850EC] py-2.5 sm:py-3.5 shadow-[0_10px_60px_rgba(88,80,236,0.4)]">
              <div className="club-strip-content animate-[horizontalMarquee_45s_linear_infinite]">
                {[...clubs, ...clubs, ...clubs, ...clubs].map((c, idx) => (
                  <div key={`strip1-${idx}`} className="flex items-center">
                    <span className="text-white text-base sm:text-xl font-bold uppercase tracking-wider px-8 sm:px-12 transition-all hover:scale-110">
                      {c}
                    </span>
                    <span className="text-white/40 text-lg sm:text-2xl font-light">|</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STRIP 2 - Slanted Upwards (Decreased height) */}
          <div className="club-strip-container z-20 translate-y-[20px] sm:translate-y-0" style={{ transform: 'translateX(-50%) rotate(var(--tilt-angle-neg, -12deg))' }}>
            <div className="bg-[#5850EC] py-2.5 sm:py-3.5 shadow-[0_10px_60px_rgba(88,80,236,0.4)] border-y border-white/20">
              <div className="club-strip-content animate-[horizontalMarquee_55s_linear_infinite]" style={{ direction: 'rtl' }}>
                {[...clubs, ...clubs, ...clubs, ...clubs].map((c, idx) => (
                  <div key={`strip2-${idx}`} className="flex items-center">
                    <span className="text-white text-base sm:text-xl font-bold uppercase tracking-wider px-8 sm:px-12 transition-all hover:scale-110">
                      {c}
                    </span>
                    <span className="text-white/40 text-lg sm:text-2xl font-light">|</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CSS Variables for Responsive Rotation */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root { --tilt-angle: 12deg; --tilt-angle-neg: -12deg; }
          @media (min-width: 640px) {
            :root { --tilt-angle: 6deg; --tilt-angle-neg: -6deg; }
          }
        `}} />
      </Section>

      {/* LEADERBOARD PREVIEW */}
      <Section id="leaderboard" className="py-24 sm:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Campus Standings</div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white italic">
              Top 3 Preview
            </h2>
          </div>
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-black text-white transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)]"
          >
            View full leaderboard
            <ArrowRight size={18} />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          className="flex flex-row md:flex-row items-end justify-center gap-2 md:gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Order: Rank 2, Rank 1, Rank 3 */}
          <LeaderboardCard data={top3[1]} rank={2} />
          <LeaderboardCard data={top3[0]} rank={1} isMain={true} />
          <LeaderboardCard data={top3[2]} rank={3} />
        </motion.div>
      </Section>



      {/* COLLEGE SECTION */}
      <Section id="about" className="py-10 sm:py-20">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 items-center gap-6 sm:gap-10">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -22 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>About</div>
            <div className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{COLLEGE_NAME}</div>
            <div className={`mt-3 text-sm ${palette.muted}`}>
              A modern campus ecosystem where verified achievements turn into visible reputation—across clubs, events, and communities.
            </div>

          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: 22 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <GlowCard className="p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5">
                <img
                  src={campusSrc}
                  alt={`${COLLEGE_NAME} campus`}
                  className="h-72 w-full object-cover sm:h-80"
                  onError={() => {
                    if (campusSrc !== CAMPUS_IMG_FALLBACK) setCampusSrc(CAMPUS_IMG_FALLBACK);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-extrabold text-white backdrop-blur">
                    <BadgeCheck size={16} />
                    {POWERED_BY}
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className={`border-t ${palette.border} bg-white/5 py-5 backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_18px_50px_rgba(99,102,241,0.25)]">
              <BadgeCheck size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold">CampusRank</div>
              <div className={`text-xs ${palette.muted}`}>{COLLEGE_NAME}</div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${palette.muted}`}>{POWERED_BY}</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
