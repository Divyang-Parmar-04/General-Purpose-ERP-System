import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { BarChart3, ShieldCheck, Zap, ArrowRight, TrendingUp, Users, Globe, CheckCircle, ChevronRight, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/home/Navbar';
import Footer from '../../components/home/Footer';

/* ─── Floating Orb ─── */
const Orb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 dark:opacity-15 pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ─── Animated Counter ─── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Dashboard Preview Card ─── */
const MiniCard = ({ title, value, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/60 dark:border-gray-700/60 min-w-[130px] sm:min-w-[150px] flex-shrink-0"
  >
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    <p className={`text-xs mt-1 font-medium ${color}`}>{trend}</p>
  </motion.div>
);

/* ─── Mini Bar Chart ─── */
const MiniBarChart = () => {
  const bars = [40, 65, 50, 80, 60, 90, 75];
  return (
    <div className="flex items-end gap-1 h-10 sm:h-12">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-blue-500"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.07, ease: 'backOut' }}
          style={{ height: `${h}%`, transformOrigin: 'bottom', opacity: 0.5 + i * 0.07 }}
        />
      ))}
    </div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon: Icon, title, desc, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.12 }}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
    className="group relative bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color} rounded-2xl`} />
    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl mb-4 sm:mb-5 ${color} group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={22} className="text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

/* ─── Stat ─── */
const Stat = ({ label, value, suffix, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="text-center"
  >
    <p className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-200 dark:text-blue-300 mb-2">
      <Counter target={value} suffix={suffix} />
    </p>
    <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm font-medium">{label}</p>
  </motion.div>
);

/* ─── Main ─── */
const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const handleGetStarted = () => {
    if (user?.businessId) return navigate(`/${(user?.role?.name).toLowerCase()}/dashboard`);
    navigate("/auth");
  };

  const features = [
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor performance with live dashboards, custom reports, and deep business insights that actually matter.', color: 'bg-blue-50 dark:bg-blue-950/40' },
    { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Role-based access control, end-to-end encryption, and audit logs to keep your data locked down.', color: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { icon: Zap, title: 'Smart Automation', desc: 'Eliminate repetitive work with intelligent workflow automation and event-driven triggers.', color: 'bg-sky-50 dark:bg-sky-950/40' },
    { icon: Users, title: 'Team Management', desc: 'Onboard teams, assign roles, and manage permissions across your entire organization with ease.', color: 'bg-blue-50 dark:bg-blue-950/40' },
    { icon: Globe, title: 'Multi-region Support', desc: 'Deploy across regions with localization, timezone handling, and compliant data residency.', color: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { icon: TrendingUp, title: 'Growth Forecasting', desc: 'AI-powered predictions and scenario planning to help you make data-backed strategic decisions.', color: 'bg-sky-50 dark:bg-sky-950/40' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'CTO, NexaWave', text: 'Reduced our ops overhead by 60% in the first month. The automation alone paid for itself.', stars: 5 },
    { name: 'Marcus Reid', role: 'VP Ops, Buildify', text: 'The analytics dashboard is phenomenal. We finally have visibility across every department.', stars: 5 },
    { name: 'Priya Nair', role: 'CEO, Fundly', text: 'Onboarded our 200-person team in under a day. The role management is incredibly intuitive.', stars: 5 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">

        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/30" />

        {/* Animated blobs — clipped on mobile to avoid overflow */}
        <Orb className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-blue-400 dark:bg-blue-600 -top-20 -left-20 sm:-top-32 sm:-left-32" delay={0} />
        <Orb className="w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-indigo-300 dark:bg-indigo-700 -bottom-16 -right-16 sm:-bottom-24 sm:-right-24" delay={2} />
        <Orb className="hidden sm:block w-[300px] h-[300px] bg-sky-300 dark:bg-sky-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={4} />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 sm:px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Modern ERP Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 leading-[1.05] tracking-tight px-2"
          >
            <span className="text-gray-900 dark:text-white">Master That Drives</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Enterprise Growth
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 leading-relaxed px-2"
          >
            Transforming businesses with cutting-edge AI technology for efficiency, cost savings, and real-time insights — all in one unified platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 px-4 sm:px-0"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGetStarted}
              className="group flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-colors duration-200"
            >
              Try it for free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm transition-all duration-200"
            >
              See demo
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative mx-auto max-w-4xl px-2 sm:px-0"
          >
            {/* Main dashboard card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 dark:border-gray-800/80 p-3 sm:p-5 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium">Analytics Dashboard</div>
                <div className="w-12 sm:w-16 h-2 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Mini stats row — horizontally scrollable */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                <MiniCard title="Revenue" value="$128,450" trend="↑ 12.4% this month" color="text-green-500" delay={0.8} />
                <MiniCard title="Active Users" value="3,842" trend="↑ 8.1% vs last week" color="text-blue-500" delay={0.9} />
                <MiniCard title="Tasks Done" value="94%" trend="↑ 5% above target" color="text-indigo-500" delay={1.0} />
                <MiniCard title="Savings" value="$24,200" trend="↓ Cost reduced 18%" color="text-emerald-500" delay={1.1} />
              </div>

              {/* Bar chart preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-3 sm:mt-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Weekly Performance</p>
                  <span className="text-xs text-blue-500 font-medium">Last 7 days</span>
                </div>
                <MiniBarChart />
                <div className="flex justify-between mt-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <span key={d} className="text-[9px] sm:text-[10px] text-gray-400 flex-1 text-center">{d}</span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Floating badge — repositioned for mobile so it doesn't clip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              className="absolute -top-3 right-2 sm:-top-4 sm:-right-4 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg shadow-blue-500/40"
            >
              Live Data ✦
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <Stat label="Businesses Powered" value={12000} suffix="+" index={0} />
            <Stat label="Uptime Guarantee" value={99} suffix=".9%" index={1} />
            <Stat label="Hours Saved / Month" value={4500} suffix="+" index={2} />
            <Stat label="Countries Deployed" value={87} suffix="" index={3} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block mb-3 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Core Features</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Everything your team needs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              One platform with everything required to run, scale, and optimize your entire business operation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block mb-3 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Up and running in minutes</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8">
            {[
              { step: '01', title: 'Create your workspace', desc: 'Sign up and set up your organization in under 60 seconds. No credit card required.' },
              { step: '02', title: 'Invite your team', desc: 'Add team members and assign roles. Granular permissions keep everyone in their lane.' },
              { step: '03', title: 'Automate & grow', desc: 'Connect your tools, configure workflows, and watch your productivity skyrocket.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative pl-5 sm:pl-6 border-l-2 border-blue-100 dark:border-blue-900"
              >
                <div className="text-4xl sm:text-5xl font-black text-blue-100 dark:text-blue-900 mb-2 sm:mb-3 leading-none">{s.step}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-block mb-3 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Loved by operators</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 sm:mb-5 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 sm:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 sm:p-10 md:p-14 text-center shadow-2xl shadow-blue-500/30"
        >
          <Orb className="w-48 sm:w-64 h-48 sm:h-64 bg-white -top-12 sm:-top-16 -left-12 sm:-left-16 opacity-10" delay={0} />
          <Orb className="w-36 sm:w-48 h-36 sm:h-48 bg-indigo-300 -bottom-8 sm:-bottom-12 -right-8 sm:-right-12 opacity-10" delay={2} />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 sm:mb-4">Ready to scale your operations?</h2>
            <p className="text-blue-100 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">Join 12,000+ businesses already using the platform to automate, analyze, and grow.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto justify-center"
              >
                Get started free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
            <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-8 text-blue-100 text-xs sm:text-sm">
              {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} className="text-blue-200 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default Home;