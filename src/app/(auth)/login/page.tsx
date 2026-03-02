"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { loginAdmin } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  AlertCircle,
  Users,
  MapPin,
  BarChart3,
  Globe,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ── Glassmorphism Stats ── */
const stats = [
  { icon: Users, value: "12,450+", label: "Người dùng", x: "8%", y: "18%", delay: 0.6 },
  { icon: TrendingUp, value: "3,200+", label: "Chuyến đi", x: "58%", y: "12%", delay: 1.0 },
  { icon: Shield, value: "99.9%", label: "Uptime", x: "68%", y: "72%", delay: 1.4 },
];

/* ── Floating Particles ── */
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 6,
}));

const features = [
  { icon: Users, label: "Quản lý người dùng" },
  { icon: MapPin, label: "Giám sát chuyến đi" },
  { icon: BarChart3, label: "Báo cáo & Phân tích" },
  { icon: Globe, label: "Tổng quan nền tảng" },
];

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /** Normalize VN phone: 0xxx → +84xxx, 84xxx → +84xxx, keep +84xxx as-is */
  function normalizePhone(raw: string): string {
    const trimmed = raw.trim().replace(/\s+/g, "");
    if (trimmed.startsWith("+84")) return trimmed;
    if (trimmed.startsWith("84")) return `+${trimmed}`;
    if (trimmed.startsWith("0")) return `+84${trimmed.slice(1)}`;
    return trimmed;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(normalizePhone(phoneNumber), password);
      window.location.replace(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel: Hero Image + Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Hero Background Image */}
        <Image
          src="/images/login-hero.png"
          alt="Vietnam landscape"
          fill
          sizes="55vw"
          className="object-cover"
          priority
          quality={90}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2532]/90 via-[#1B2532]/75 to-[#1B2532]/60" />

        {/* Golden ambient glow */}
        <motion.div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(252,210,64,0.12) 0%, transparent 65%)",
          }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-48 -right-48 h-[700px] w-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(252,210,64,0.08) 0%, transparent 65%)",
          }}
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating golden particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/30"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Glassmorphism stat cards */}
        {stats.map(({ icon: StatIcon, value, label, x, y, delay }, idx) => (
          <motion.div
            key={idx}
            className="absolute z-20"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.08] px-5 py-3.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5 + idx * 0.5,
                delay: delay + 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                <StatIcon size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-[11px] font-medium text-white/50">{label}</div>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Branding content */}
        <motion.div
          className="relative z-10 flex flex-col justify-end p-16 pb-24 w-full"
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={scaleIn} className="mb-8">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-primary text-[42px] shadow-[0_8px_32px_rgba(252,210,64,0.35)]">
              🌏
            </div>
          </motion.div>

          <motion.h1
            variants={slideInLeft}
            custom={0}
            className="text-[52px] font-extrabold leading-[1.1] tracking-tight text-white"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            TravelBuddy
          </motion.h1>
          <motion.p
            variants={slideInLeft}
            custom={1}
            className="mt-2 text-xl font-bold text-primary"
            style={{ textShadow: "0 2px 12px rgba(252,210,64,0.3)" }}
          >
            Cổng quản trị
          </motion.p>
          <motion.p
            variants={slideInLeft}
            custom={2}
            className="mt-5 max-w-md text-base leading-relaxed text-white/55"
          >
            Quản lý người dùng, giám sát chuyến đi và điều hành nền tảng kết nối
            những người đam mê du lịch khắp Việt Nam.
          </motion.p>

          <motion.div
            variants={slideInLeft}
            custom={3}
            className="mt-8 h-px w-16 bg-primary/40"
          />

          <motion.div
            variants={slideInLeft}
            custom={4}
            className="mt-7 grid grid-cols-2 gap-3 max-w-md"
          >
            {features.map(({ icon: FeatureIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <FeatureIcon size={16} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-16 right-16 z-10 flex items-center justify-between text-xs text-white/25"
        >
          <span>© 2026 TravelBuddy</span>
          <span>v1.0.0</span>
        </motion.div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-[45%] relative">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Golden accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <motion.div
          className="relative z-10 w-full max-w-[420px]"
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Brand */}
          <motion.div
            variants={scaleIn}
            className="mb-10 lg:hidden text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-4xl shadow-[0_8px_24px_rgba(252,210,64,0.20)]">
              🌏
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              TravelBuddy
            </h1>
            <p className="mt-1 text-sm text-primary font-semibold">
              Cổng quản trị
            </p>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin Portal
              </span>
            </div>
            <h2 className="text-[32px] font-extrabold text-foreground tracking-tight leading-tight">
              Chào mừng trở lại
            </h2>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
              Đăng nhập tài khoản quản trị để tiếp tục quản lý nền tảng
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-6"
              >
                <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeUp} custom={1}>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Số điện thoại
              </label>
              <div className="relative group">
                <div
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "phoneNumber"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Phone size={18} />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onFocus={() => setFocusedField("phoneNumber")}
                  onBlur={() => setFocusedField(null)}
                  className="h-[52px] w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_4px_rgba(252,210,64,0.08)] hover:border-primary/40"
                  placeholder="+84xxxxxxxxx"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2}>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-foreground"
                >
                  Mật khẩu
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div
                  className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="h-[52px] w-full rounded-xl border border-border bg-card pl-11 pr-12 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_4px_rgba(252,210,64,0.08)] hover:border-primary/40"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 focus:outline-none focus:text-primary cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển mật khẩu"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-[52px] w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(252,210,64,0.25)] transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_12px_36px_rgba(252,210,64,0.35)] hover:-translate-y-0.5 active:bg-primary-dark active:translate-y-0 active:shadow-[0_4px_12px_rgba(252,210,64,0.20)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:pointer-events-none disabled:translate-y-0 cursor-pointer"
              >
                {loading ? (
                  <motion.div
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang đăng nhập…
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-2">
                    Đăng nhập
                    <motion.span
                      className="inline-block"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      →
                    </motion.span>
                  </span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-10 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
              Chỉ dành cho quản trị viên
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={5}
            className="mt-6 text-center text-xs text-muted-foreground/50"
          >
            TravelBuddy Cổng Quản Trị · Kết nối những người đam mê du lịch Việt Nam
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
