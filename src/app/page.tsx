"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Wrench,
  BarChart2,
  Shield,
  Users,
  Globe,
  Zap,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Check,
  ChevronDown,
  Layers,
  Star,
  Menu,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: Boxes, title: "Asset Registry", desc: "Centralized register for every asset across all your locations — IT, facilities, vehicles, equipment, and more." },
    { icon: Wrench, title: "Maintenance Management", desc: "Schedule, track, and log all maintenance activities. Automated reminders before due dates so nothing slips." },
    { icon: BarChart2, title: "Real-Time Analytics", desc: "Live dashboards with depreciation curves, utilization rates, and cost-of-ownership breakdowns." },
    { icon: Shield, title: "Compliance & Audit", desc: "Stay audit-ready at all times. Automated compliance checks against your policies and regulatory requirements." },
    { icon: Users, title: "Team & Role Management", desc: "Granular permissions for every department. Asset managers, technicians, and viewers all see exactly what they need." },
    { icon: Globe, title: "Multi-Site Support", desc: "Manage assets across unlimited locations, warehouses, and offices from a single unified workspace." },
  ];

  const stats = [
    { value: "12,400+", label: "Assets Managed" },
    { value: "98.2%", label: "Uptime SLA" },
    { value: "340+", label: "Organizations" },
    { value: "$2.1B", label: "Assets Tracked" },
  ];

  const plans = [
    {
      name: "Starter", price: annualBilling ? 29 : 39, desc: "For small teams getting started with asset tracking.",
      features: ["Up to 500 assets", "3 users", "Basic reporting", "Email support", "2 locations"],
      cta: "Start free trial", highlight: false,
    },
    {
      name: "Professional", price: annualBilling ? 79 : 99, desc: "For growing organizations managing complex asset portfolios.",
      features: ["Up to 5,000 assets", "25 users", "Advanced analytics", "Priority support", "Unlimited locations", "API access", "Custom fields"],
      cta: "Start free trial", highlight: true,
    },
    {
      name: "Enterprise", price: null, desc: "For large enterprises with mission-critical asset operations.",
      features: ["Unlimited assets", "Unlimited users", "Custom reporting", "Dedicated CSM", "SSO & SCIM", "SLA guarantee", "Custom integrations", "On-prem option"],
      cta: "Contact sales", highlight: false,
    },
  ];

  const faqs = [
    { q: "How long does onboarding take?", a: "Most teams are fully onboarded within 2–3 days. We provide bulk import tools for CSV/Excel asset lists, and our team handles migration for Enterprise customers." },
    { q: "Can I import existing asset data?", a: "Yes. AssetFlow supports CSV, Excel, and API-based imports. We also have native connectors for SAP, Salesforce, and ServiceNow." },
    { q: "Is my data secure?", a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified and GDPR compliant. Enterprise plans include data residency options." },
    { q: "Do you offer a free trial?", a: "Yes — all Starter and Professional plans come with a 14-day free trial, no credit card required." },
    { q: "Can I change plans later?", a: "Absolutely. Upgrade or downgrade at any time. Changes take effect immediately and we prorate the billing difference." },
  ];

  const testimonials = [
    { name: "Sarah Okonkwo", role: "Head of Operations, Meridian Group", quote: "AssetFlow cut our audit prep time from 3 weeks to 2 days. The compliance dashboard alone was worth the switch.", avatar: "SO" },
    { name: "Thomas Brauer", role: "IT Director, NordTech AG", quote: "We manage 8,000+ assets across 14 sites. The multi-location support and role-based access are exactly what we needed.", avatar: "TB" },
    { name: "Priya Nair", role: "CFO, Brightline Logistics", quote: "The depreciation tracking and TCO reports gave us visibility we never had before. It directly changed how we budget capex.", avatar: "PN" },
  ];

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">AssetFlow</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
            {[
              { name: "Features", href: "#features" },
              { name: "Pricing", href: "#pricing" },
              { name: "Customers", href: "#customers" },
              { name: "Docs", href: "/api/docs" },
            ].map((n) => (
              <a key={n.name} href={n.href} className="hover:text-white transition-colors">
                {n.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
              Get started
            </Link>
          </div>

          <button onClick={() => setMobileMenu(m => !m)} className="md:hidden text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-white/5 bg-black px-5 py-4 flex flex-col gap-3">
            {[
              { name: "Features", href: "#features" },
              { name: "Pricing", href: "#pricing" },
              { name: "Customers", href: "#customers" },
              { name: "Docs", href: "/api/docs" },
            ].map((n) => (
              <a
                key={n.name}
                href={n.href}
                onClick={() => setMobileMenu(false)}
                className="text-sm text-white/60 hover:text-white py-1"
              >
                {n.name}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-white/5">
              <Link href="/login" className="flex-1 text-center text-sm border border-white/10 text-white/70 px-3 py-2 rounded-lg hover:bg-white/5">Sign in</Link>
              <Link href="/signup" className="flex-1 text-center text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg font-medium">Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-400 mb-8 font-medium">
            <Zap size={11} />
            Now with AI-powered predictive maintenance
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            Enterprise asset
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
              management, unified.
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            AssetFlow gives operations teams a single source of truth for every asset — from IT hardware to heavy machinery — with real-time tracking, maintenance scheduling, and audit-ready compliance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/25"
            >
              Start for free
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
            >
              View live demo
            </Link>
          </div>

          <p className="text-xs text-white/30 mt-5">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>

        {/* Mock dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10 pointer-events-none rounded-2xl" style={{ top: "50%" }} />
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Fake titlebar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-1 text-[11px] text-white/30">
                  <span>app.assetflow.io/dashboard</span>
                </div>
              </div>
            </div>
            {/* Inner UI preview */}
            <div className="flex h-48">
              {/* Sidebar stub */}
              <div className="w-44 bg-[#080808] border-r border-white/5 p-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center"><Layers size={9} className="text-white" /></div>
                  <span className="text-[11px] font-semibold text-white/80">AssetFlow</span>
                </div>
                {[{ icon: LayoutDashboard, label: "Dashboard", active: true }, { icon: Boxes, label: "Assets" }, { icon: Wrench, label: "Maintenance" }, { icon: FileText, label: "Reports" }].map(n => (
                  <div key={n.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 ${n.active ? "bg-indigo-600/20 text-indigo-400" : "text-white/30"}`}>
                    <n.icon size={10} />
                    <span className="text-[10px]">{n.label}</span>
                  </div>
                ))}
              </div>
              {/* Main stub */}
              <div className="flex-1 p-4 grid grid-cols-4 gap-3 content-start">
                {[["212", "Total Assets", "indigo"], ["$948K", "Asset Value", "violet"], ["24", "In Maintenance", "amber"], ["94.2%", "Compliance", "emerald"]].map(([v, l, c]) => (
                  <div key={l} className="bg-white/5 rounded-xl p-3">
                    <div className={`text-xs font-semibold text-${c}-400 mb-1`}>{v}</div>
                    <div className="text-[9px] text-white/30">{l}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-white/5 rounded-xl p-3">
                  <div className="text-[9px] text-white/30 mb-2">Asset Trend</div>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 55, 48, 65, 58, 72, 68].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/40 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-white/5 rounded-xl p-3">
                  <div className="text-[9px] text-white/30 mb-2">Active Alerts</div>
                  {[["HVAC overdue", "red"], ["Forklift service", "amber"], ["Server inspection", "blue"]].map(([t, c]) => (
                    <div key={t} className="flex items-center gap-1.5 mb-1">
                      <span className={`w-1 h-1 rounded-full bg-${c}-500`} />
                      <span className="text-[9px] text-white/40">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-semibold text-white mb-1">{s.value}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Everything your team needs</h2>
            <p className="text-white/45 max-w-md mx-auto text-sm leading-relaxed">One platform for the full asset lifecycle — acquisition, tracking, maintenance, compliance, and disposal.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-600/20 transition-colors">
                  <f.icon size={17} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="customers" className="py-20 px-5 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Trusted by operations leaders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <p className="text-sm text-white/60 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-white/45 text-sm mb-6">Scale as you grow. No hidden fees.</p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-1">
              <button onClick={() => setAnnualBilling(false)} className={`px-4 py-1.5 rounded-lg text-sm transition-all ${!annualBilling ? "bg-white/10 text-white font-medium" : "text-white/50"}`}>Monthly</button>
              <button onClick={() => setAnnualBilling(true)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${annualBilling ? "bg-white/10 text-white font-medium" : "text-white/50"}`}>
                Annual
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Save 25%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(p => (
              <div key={p.name} className={`relative rounded-2xl p-6 flex flex-col border ${p.highlight ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20" : "bg-white/[0.03] border-white/5"}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full">Most popular</span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mb-6">
                  {p.price !== null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-semibold text-white">${p.price}</span>
                      <span className="text-white/40 text-sm mb-1">/mo</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-semibold text-white">Custom</div>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                      <Check size={13} className={p.highlight ? "text-indigo-400 flex-shrink-0" : "text-white/30 flex-shrink-0"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.cta === "Contact sales" ? "/login" : "/signup"}
                  className={`w-full py-2.5 rounded-xl text-center text-sm font-medium transition-all ${p.highlight ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 block" : "border border-white/10 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/5 block"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-5 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10">Frequently asked</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:bg-white/3 transition-colors"
                >
                  {faq.q}
                  <ChevronDown size={15} className={`text-white/40 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative bg-white/[0.03] border border-white/5 rounded-3xl px-8 py-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Ready to take control of your assets?
            </h2>
            <p className="text-white/45 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Join 340+ organizations already using AssetFlow. Start your 14-day free trial — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/20">
                Get started free <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center justify-center">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <Layers size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold">AssetFlow</span>
            </div>
            <nav className="flex flex-wrap items-center gap-5 text-xs text-white/40">
              {["Privacy", "Terms", "Security", "Status", "Docs", "Blog"].map(l => (
                <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
              ))}
            </nav>
          </div>
          <p className="text-center text-xs text-white/25">© 2026 AssetFlow Technologies, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
