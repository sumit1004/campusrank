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
  <section id={id} className={`relative w-full px-5 sm:px-6 ${className}`}>
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const Landing = () => {
  const prefersReducedMotion = useReducedMotion();
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
    { name: 'Diya', club: 'Robotics Society', points: 1195 },
    { name: 'Ishaan', club: 'Debate Team', points: 1110 },
  ]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
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
    <div className={`min-h-screen ${palette.pageBg} ${palette.text} overflow-x-hidden`}>
      {/* HERO BACKDROP */}
      <div className="relative">
        <div className="absolute inset-0 -z-10">
          <img
            src={campusSrc}
            alt={`${COLLEGE_NAME} campus`}
            className="h-[92vh] w-full object-cover"
            onError={() => {
              if (campusSrc !== CAMPUS_IMG_FALLBACK) setCampusSrc(CAMPUS_IMG_FALLBACK);
            }}
          />
          <div className="absolute inset-0 bg-[#0B0F19]/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0B0F19]" />
          <div className="absolute inset-0 backdrop-blur-[10px]" />
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
          <div className="grid grid-cols-1 items-center gap-10 pb-8 lg:grid-cols-2 lg:pb-16">
            <MotionWrapper
              {...(!prefersReducedMotion
                ? { initial: 'hidden', animate: 'show', variants: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } } }
                : {})}
              className="relative"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-extrabold tracking-wide text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <Sparkles size={14} />
                <span>Certificates → Rank, instantly visual</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-5 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
              >
                CampusRank
              </motion.h1>

              <motion.p variants={fadeUp} className={`mt-3 text-lg font-semibold sm:text-xl ${palette.muted}`}>
                Your Certificates. Your Rank.
              </motion.p>

              {/* VISUAL FLOW */}
              <motion.div
                variants={fadeUp}
                className="mt-7 rounded-3xl border border-black/10 bg-white/70 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-2">
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
                          className={[
                            'relative flex items-center justify-between gap-3 rounded-2xl border p-4 sm:flex-col sm:items-start sm:justify-start',
                            'border-black/10 bg-white/75',
                            'dark:border-white/10 dark:bg-white/5',
                          ].join(' ')}
                        >
                          <div className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${f.tint}`} />
                          <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white/85 text-black/80 dark:border-white/10 dark:bg-white/10 dark:text-white">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold tracking-tight">{f.label}</div>
                              <div className={`text-xs ${palette.muted}`}>{idx === 1 ? 'Admin check' : idx === 3 ? 'Climb' : ' '}</div>
                            </div>
                          </div>

                          {idx === 2 && (
                            <div className="hidden sm:block">
                              <motion.div
                                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                                transition={prefersReducedMotion ? undefined : { delay: 0.7, duration: 0.4 }}
                                className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-extrabold text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
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
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:scale-105 active:scale-[0.99] sm:w-auto"
                >
                  Get Started
                  <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-extrabold text-white/90 shadow-sm transition hover:bg-white/10 sm:w-auto"
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
              <GlowCard className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_70px_rgba(0,0,0,0.65)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg ring-1 ring-black/10 dark:ring-white/10">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold">Verification</div>
                          <div className={`text-xs ${palette.muted}`}>Trusted by admins</div>
                        </div>
                      </div>
                      <motion.div
                        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                        transition={prefersReducedMotion ? undefined : { delay: 0.55, type: 'spring', stiffness: 260, damping: 18 }}
                        className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-extrabold text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                      >
                        Verified
                      </motion.div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                        <motion.div
                          initial={prefersReducedMotion ? undefined : { width: '15%' }}
                          animate={prefersReducedMotion ? undefined : { width: '88%' }}
                          transition={prefersReducedMotion ? undefined : { duration: 1.1, ease: 'easeOut', delay: 0.35 }}
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        />
                      </div>
                      <div className={`text-xs ${palette.muted}`}>Auto-logged approvals</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_70px_rgba(0,0,0,0.65)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white shadow-lg ring-1 ring-black/10 dark:ring-white/10">
                          <LayoutDashboard size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold">Live Rank</div>
                          <div className={`text-xs ${palette.muted}`}>Updates instantly</div>
                        </div>
                      </div>
                      <motion.div
                        initial={prefersReducedMotion ? undefined : { y: 6, opacity: 0 }}
                        animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
                        transition={prefersReducedMotion ? undefined : { delay: 0.65, duration: 0.45 }}
                        className="text-sm font-black text-black/70 dark:text-white/70"
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

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.55)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_70px_rgba(0,0,0,0.65)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-white shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                        <Award size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold">Badge Unlock</div>
                        <div className={`text-xs ${palette.muted}`}>Progress feels rewarding</div>
                      </div>
                    </div>
                    <motion.div
                      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={prefersReducedMotion ? undefined : { delay: 0.85, type: 'spring', stiffness: 240, damping: 14 }}
                      className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-black/5 text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/75"
                    >
                      <CheckCircle2 size={18} />
                    </motion.div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {['Bronze', 'Silver', 'Gold', 'Elite'].map((b, i) => (
                      <motion.div
                        key={b}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                        className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="text-[11px] font-extrabold">{b}</div>
                        <div className={`mt-1 text-[10px] ${palette.muted}`}>{i < 2 ? 'Unlocked' : 'Locked'}</div>
                        {i >= 2 && (
                          <div className="absolute right-2 top-2 text-black/35 dark:text-white/35">
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
      <Section id="how" className="py-16 sm:py-20">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>How it works</div>
              <div className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Three steps. All momentum.</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            { icon: Upload, title: 'Upload Certificate', tint: 'from-indigo-500/35 to-cyan-400/10' },
            { icon: ShieldCheck, title: 'Admin Verification', tint: 'from-emerald-500/30 to-cyan-400/10' },
            { icon: Flame, title: 'Earn Points', tint: 'from-fuchsia-500/30 to-indigo-500/10' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} variants={fadeUp} whileHover={prefersReducedMotion ? undefined : { y: -6 }}>
                <GlowCard className="p-5">
                  <div className="relative overflow-hidden rounded-2xl px-6 py-8">
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${s.tint} opacity-50`} />
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10">
                        <Icon size={20} />
                      </div>
                      <div className={`text-xs font-black tracking-widest ${palette.muted} opacity-50`}>0{['Upload Certificate', 'Admin Verification', 'Earn Points'].indexOf(s.title) + 1}</div>
                    </div>
                    <div className="mt-8 text-2xl font-black tracking-tight">{s.title}</div>
                    <div className={`mt-2 text-sm font-semibold ${palette.muted}`}>Visual progress, minimal effort.</div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* DASHBOARD PREVIEW */}
      <Section className="pb-16 sm:pb-20">
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
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-5 py-3 text-sm font-extrabold text-black/80 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:hover:bg-white/10"
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
              <div className="rounded-3xl border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                  </div>
                  <div className={`text-xs font-extrabold ${palette.muted}`}>CampusRank</div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-extrabold ${palette.muted}`}>Your Rank</div>
                      <div className="text-sm font-black">#02</div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-extrabold ${palette.muted}`}>Points</div>
                      <div className="text-sm font-black">{points}</div>
                    </div>
                    <div className={`mt-2 text-[11px] ${palette.muted}`}>Verified uploads boost faster</div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
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
                        <div key={a.text} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-black/5 text-black/70 dark:bg-white/5 dark:text-white/75">
                              <Icon size={16} />
                            </div>
                            <div className="text-sm font-semibold">{a.text}</div>
                          </div>
                          <div className="rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-extrabold text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
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
      <Section id="badges" className="py-16 sm:py-20">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>Badges</div>
          <div className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Unlock status—visually</div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.25 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { name: 'Bronze', color: 'from-[#CD7F32]/30 to-[#0B0F19]', unlocked: true, icon: Award },
            { name: 'Silver', color: 'from-[#94A3B8]/30 to-[#0B0F19]', unlocked: true, icon: Award },
            { name: 'Gold', color: 'from-[#F59E0B]/30 to-[#0B0F19]', unlocked: false, icon: Award },
            { name: 'Elite', color: 'from-[#7C3AED]/30 to-[#0B0F19]', unlocked: false, icon: Crown },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <motion.div key={b.name} variants={fadeUp} whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}>
                <GlowCard className="p-5">
                  <div className="relative overflow-hidden rounded-2xl px-7 py-8">
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${b.color} opacity-60`} />
                    <div className="flex items-start justify-between">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-sm">
                        <Icon size={22} />
                      </div>
                      {!b.unlocked ? (
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/20 text-white/30 backdrop-blur-md">
                          <Lock size={18} />
                        </div>
                      ) : (
                        <motion.div
                          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                          transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: 'easeOut' }}
                          className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/80 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-sm"
                        >
                          <CheckCircle2 size={18} />
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-10 text-xl font-black">{b.name}</div>
                    <div className={`mt-1 text-sm font-bold ${palette.muted} ${b.unlocked ? 'text-emerald-400/80' : ''}`}>
                      {b.unlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* CLUB SYSTEM */}
      <Section id="clubs" className="h-screen relative flex items-center justify-center overflow-hidden bg-[#0B0F19] py-0">

        {/* MASSIVE UNCONSTRAINED GLOW - Positioned at the very back */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-[#5850EC]/20 blur-[200px] pointer-events-none rounded-full z-0" /> */}

        {/* CONTENT OVERLAY */}
        <div className="relative z-30 text-center select-none pointer-events-none">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-[#5850EC] shadow-2xl">
            The Network
          </div>
          <h2 className="text-6xl sm:text-9xl font-black tracking-tighter text-white blur-[1px]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/5 opacity-70 ">
              Active Clubs
            </span>
          </h2>
          <p className="mt-4 text-[10px] sm:text-sm font-bold text-white/30 tracking-[0.4em] uppercase">
            Join the ecosystem
          </p>
        </div>

        {/* STRIPS LAYER - Positioned behind/around the text */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-auto">
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
      <Section id="leaderboard" className="py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>Leaderboard</div>
            <div className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Top 3 preview</div>
          </div>
          <Link
            to="/leaderboard"
            className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 shadow-sm transition hover:bg-white/10 md:inline-flex"
          >
            View full leaderboard
            <ArrowRight size={16} />
          </Link>
        </div>

        <motion.div
          initial={prefersReducedMotion ? undefined : 'hidden'}
          whileInView={prefersReducedMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.25 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {top3.map((u, i) => {
            const isOne = i === 0;
            return (
              <motion.div key={`${u.name}-${i}`} variants={fadeUp} whileHover={prefersReducedMotion ? undefined : { y: -6, scale: isOne ? 1.02 : 1.01 }}>
                <GlowCard className={`p-3 ${isOne ? 'ring-2 ring-amber-400/40' : ''}`}>
                  <div className="relative overflow-hidden rounded-2xl px-6 py-8">
                    <div
                      className={`absolute inset-0 -z-10 bg-gradient-to-br ${isOne ? 'from-amber-400/30 via-fuchsia-500/15 to-cyan-400/15' : 'from-indigo-500/20 to-cyan-400/10'
                        } opacity-60`}
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`text-xs font-extrabold tracking-widest ${palette.muted} opacity-70 uppercase`}>Rank</div>
                        <div className="mt-1 text-4xl font-black tracking-tighter">#{String(i + 1).padStart(2, '0')}</div>
                      </div>
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-2xl ${isOne
                          ? 'bg-gradient-to-r from-amber-400 to-fuchsia-500 text-white shadow-[0_0_35px_rgba(251,191,36,0.3)] ring-1 ring-white/20'
                          : 'border border-white/10 bg-white/10 text-white backdrop-blur-md'
                          }`}
                      >
                        {isOne ? <Crown size={20} /> : <Trophy size={20} />}
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="text-2xl font-black tracking-tight">{u.name}</div>
                      <div className={`mt-1 text-sm font-bold ${palette.muted} opacity-80 uppercase tracking-wider`}>{u.club}</div>
                    </div>
                    <div className={`mt-8 flex items-center justify-between rounded-2xl border ${isOne ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/10 bg-white/5'} px-5 py-4 backdrop-blur-sm`}>
                      <div className={`text-xs font-black uppercase tracking-widest ${palette.muted} opacity-60`}>Total Points</div>
                      <div className={`text-lg font-black ${isOne ? 'text-amber-400' : 'text-white'}`}>
                        {Number.isFinite(u.points) ? u.points.toLocaleString() : 0}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* CTA */}
      <Section className="py-16 sm:py-20">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <GlowCard className="p-8 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className={`text-sm font-extrabold tracking-wide ${palette.muted}`}>{POWERED_BY}</div>
                <div className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Start Building Your Campus Rank Today</div>
              </div>
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-7 py-4 text-base font-extrabold text-white shadow-[0_22px_70px_rgba(99,102,241,0.35)] transition hover:scale-[1.02] active:scale-[0.99] md:w-auto"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
          </GlowCard>
        </motion.div>
      </Section>

      {/* COLLEGE SECTION */}
      <Section id="about" className="py-16 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-extrabold text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <ShieldCheck size={16} />
                Verified credentials
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-extrabold text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <Trophy size={16} />
                Leaderboards
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-extrabold text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <Award size={16} />
                Badges
              </div>
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
