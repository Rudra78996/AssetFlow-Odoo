"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppProvider } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Package2, Mail, Lock, ArrowRight, ShieldCheck, BadgeCheck, Cloud, User, Info, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const { addToast, setUser } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "MANAGER" | "ADMIN",
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (mode === "signup") {
      if (!form.firstName) e.firstName = "First name is required";
      if (!form.lastName) e.lastName = "Last name is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password, role: form.role }
          : { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? "Something went wrong");
      }

      // Set user in context from the API response
      setUser(data.data);
      addToast({
        message: mode === "login" ? `Welcome back, ${data.data.name}!` : "Account created successfully!",
        type: "success",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      addToast({ message: msg, type: "error" });
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-16 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Package2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-black">AssetFlow</h1>
            <p className="text-body-md text-white/70">Enterprise Resource &amp; Asset Management</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md relative z-10">
          <h2 className="font-headline-lg text-headline-lg mb-6">
            Real-time asset intelligence for modern enterprises
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md mb-1">Real-time Visibility</h3>
                <p className="text-body-md text-white/70">
                  Track enterprise resources across global locations with sub-second latency and intelligent auditing.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md mb-1">Predictive Maintenance</h3>
                <p className="text-body-md text-white/70">
                  Utilize ML-driven insights to schedule maintenance before hardware failure occurs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-white/60 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-label-md uppercase">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-label-md uppercase">SOC2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            <span className="text-label-md uppercase">99.9% Uptime</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Package2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-headline-lg text-headline-lg font-black text-on-surface">AssetFlow</h1>
          </div>

          {/* Global form error */}
          {errors.form && (
            <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded-md flex items-center gap-2">
              <Info className="w-4 h-4 text-error flex-shrink-0" />
              <p className="text-label-md text-error">{errors.form}</p>
            </div>
          )}

          {mode === "login" ? (
            <>
              <h2 className="font-headline-md text-headline-md text-on-surface">Welcome back</h2>
              <p className="text-body-md text-on-surface-variant mb-8">
                Enter your credentials to access your dashboard.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label-field">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field pl-9"
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && <p className="text-label-md text-error mt-1">{errors.email}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label-field mb-0">Password</label>
                    <button type="button" className="text-label-md text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-9 pr-9"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-label-md text-error mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="label-field mb-2">Login as Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["EMPLOYEE", "MANAGER", "ADMIN"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={cn(
                          "px-3 py-2 rounded-md border-2 text-label-md font-bold transition-colors",
                          form.role === role
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant text-on-surface-variant hover:border-primary/30"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-outline-variant" />
                  <span className="text-body-md text-on-surface-variant select-none">Stay signed in for 30 days</span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
              <p className="text-body-md text-on-surface-variant text-center mt-6">
                Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("signup"); setErrors({}); }} className="text-primary font-bold hover:underline">
                  Create employee account
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-headline-md text-headline-md text-on-surface">Create account</h2>
              <p className="text-body-md text-on-surface-variant mb-6">
                Join your organization&apos;s AssetFlow network.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">First Name</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="input-field"
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-label-md text-error mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="label-field">Last Name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="input-field"
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-label-md text-error mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="label-field">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field pl-9"
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && <p className="text-label-md text-error mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label-field">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-9 pr-9"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Info className="w-3.5 h-3.5 text-outline" />
                    <p className="text-label-md text-outline">Include a mix of letters, numbers, and symbols.</p>
                  </div>
                  {errors.password && <p className="text-label-md text-error mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="label-field mb-2">Create account as Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["EMPLOYEE", "MANAGER", "ADMIN"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={cn(
                          "px-3 py-2 rounded-md border-2 text-label-md font-bold transition-colors",
                          form.role === role
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant text-on-surface-variant hover:border-primary/30"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-secondary-container/30 rounded-md">
                  <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-label-md text-secondary leading-normal">
                    Registration creates an account with the selected role. Admin privileges should be used carefully.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <>Create Employee Account <User className="w-4 h-4" /></>
                  )}
                </button>
              </form>
              <p className="text-body-md text-on-surface-variant text-center mt-4">
                Already have an account?{" "}
                <button onClick={() => { setMode("login"); setErrors({}); }} className="text-primary font-bold hover:underline">
                  Sign in here
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppProvider>
      <LoginForm />
    </AppProvider>
  );
}
