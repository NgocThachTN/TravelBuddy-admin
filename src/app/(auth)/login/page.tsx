"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  MapPin,
  Users,
  BarChart3,
  Globe,
  Compass,
  Mountain,
  Plane,
} from "lucide-react";

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const floatingIcons = [
  { Icon: Compass, x: "10%", y: "15%", size: 28, delay: 0 },
  { Icon: Mountain, x: "75%", y: "12%", size: 32, delay: 0.5 },
  { Icon: Plane, x: "85%", y: "55%", size: 26, delay: 1 },
  { Icon: Globe, x: "15%", y: "70%", size: 30, delay: 1.5 },
  { Icon: MapPin, x: "60%", y: "80%", size: 24, delay: 2 },
];

const features = [
  { icon: Users, label: "Quản lý người dùng" },
  { icon: MapPin, label: "Giám sát chuyến đi" },
  { icon: BarChart3, label: "Báo cáo & Phân tích" },
  { icon: Globe, label: "Tổng quan nền tảng" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center bg-sidebar relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(252,210,64,0.12) 0%, transparent 70%)",
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(252,210,64,0.08) 0%, transparent 70%)",
            }}
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(252,210,64,0.06) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating travel icons */}
        {floatingIcons.map(({ Icon, x, y, size, delay }, idx) => (
          <motion.div
            key={idx}
            className="absolute text-primary/15"
            style={{ left: x, top: y }}
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{
              duration: 5 + idx,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(252,210,64,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(252,210,64,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-lg px-16"
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={scaleIn} className="mb-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-5xl shadow-[4px_8px_24px_0_rgba(252,210,64,0.25)]">
              🌏
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl font-bold leading-tight tracking-tight text-white"
          >
            TravelBuddy
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-2 text-xl font-semibold text-primary"
          >
            Cổng quản trị
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-6 text-base leading-relaxed text-white/50"
          >
            Quản lý người dùng, giám sát chuyến đi và điều hành nền tảng kết nối
            những người đam mê du lịch khắp Việt Nam.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-10 h-px w-16 bg-primary/30"
          />

          <motion.div
            variants={fadeUp}
            custom={5}
            className="mt-8 grid grid-cols-2 gap-3"
          >
            {features.map(({ icon: FeatureIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FeatureIcon size={16} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-16 right-16 flex items-center justify-between text-xs text-white/25"
        >
          <span>© 2026 TravelBuddy</span>
          <span>v1.0.0</span>
        </motion.div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-[45%] relative">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          className="relative z-10 w-full max-w-[400px]"
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Brand */}
          <motion.div
            variants={scaleIn}
            className="mb-10 lg:hidden text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-4xl shadow-[4px_8px_24px_0_rgba(252,210,64,0.20)]">
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
            <h2 className="text-[28px] font-bold text-foreground tracking-tight">
              Chào mừng trở lại
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đăng nhập tài khoản quản trị để tiếp tục
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
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Địa chỉ email
              </label>
              <div className="relative">
                <div
                  className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_4px_rgba(252,210,64,0.08)]"
                  placeholder="admin@travelbuddy.vn"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2}>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div
                  className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Lock size={16} />
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
                  className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-11 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_0_4px_rgba(252,210,64,0.08)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:text-primary cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển mật khẩu"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[4px_8px_24px_0_rgba(252,210,64,0.20)] transition-all duration-200 hover:bg-primary-hover hover:shadow-[4px_12px_32px_0_rgba(252,210,64,0.30)] active:bg-primary-dark active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <motion.div
                    className="flex items-center gap-2"
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
                      whileHover={{ x: 3 }}
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
            className="mt-8 flex items-center gap-3"
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
            className="mt-6 text-center text-xs text-muted-foreground/60"
          >
            TravelBuddy Cổng Quản Trị · Kết nối những người đam mê du lịch Việt Nam
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
