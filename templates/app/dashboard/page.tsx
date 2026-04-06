"use client";

import { useState } from "react";
import type { ThemeKey, TabKey, LocationFilter } from "@/types/dashboard";
import { THEMES } from "@/lib/data";
import { StatCard, LiveDot } from "./components/ui";
import dynamic from "next/dynamic";

// Dynamically import chart-heavy tabs (no SSR — recharts is client-only)
const OverviewTab       = dynamic(() => import("./components/OverviewTab"),       { ssr: false });
const CampaignsTab      = dynamic(() => import("./components/CampaignsTab"),      { ssr: false });
const CallsTab          = dynamic(() => import("./components/CallsTab"),          { ssr: false });
const AgentsTab         = dynamic(() => import("./components/AgentsTab"),         { ssr: false });
const CompetitorsTab    = dynamic(() => import("./components/CompetitorsTab"),    { ssr: false });
const CurrentStatusTab  = dynamic(() => import("./components/CurrentStatusTab"),  { ssr: false });
const PredictiveTab     = dynamic(() => import("./components/PredictiveTab"),     { ssr: false });
const PricingTab        = dynamic(() => import("./components/PricingTab"),        { ssr: false });
const WebsiteAuditTab   = dynamic(() => import("./components/WebsiteAuditTab"),   { ssr: false });

const TABS: TabKey[] = ["overview", "campaigns", "calls", "ai agents", "competitors", "current status", "website audit", "predictive", "pricing"];
const LOCATIONS: LocationFilter[] = ["All", "Moore", "OKC"];

export default function DashboardPage() {
  const [themeKey,  setThemeKey]  = useState<ThemeKey>("dark");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeLoc, setActiveLoc] = useState<LocationFilter>("All");

  const t = THEMES[themeKey];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }
        @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:0.4 } }
        @keyframes fadeUp  { from{ opacity:0; transform:translateY(12px) } to{ opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 60,
        background: t.panel, borderBottom: `1px solid ${t.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Brand + Client */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🦾</div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, letterSpacing: "-0.01em" }}>Sapiens Station</div>
            <div style={{ fontSize: 10, color: t.sub }}>AI Automation Agency</div>
          </div>

          <div style={{ width: 1, height: 28, background: t.border, margin: "0 6px" }} />

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>QuickUrgentCare.com</div>
            <div style={{ fontSize: 10, color: t.sub }}>Moore · Oklahoma City · 2 Locations</div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LiveDot color={t.green} />
            <span style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ fontSize: 11, color: t.sub }}>Mar 31, 2026 · 7:42 PM CT</div>
          <button
            onClick={() => setThemeKey(themeKey === "dark" ? "light" : "dark")}
            style={{
              background: t.tag, border: `1px solid ${t.border}`, borderRadius: 8,
              color: t.text, padding: "5px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {themeKey === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* ── TABS + LOCATION FILTER ── */}
      <nav style={{
        display: "flex", alignItems: "stretch", padding: "0 28px",
        background: t.panel, borderBottom: `1px solid ${t.border}`,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none", border: "none",
              padding: "12px 16px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.03em",
              color: activeTab === tab ? t.accent : t.sub,
              borderBottom: activeTab === tab ? `2px solid ${t.accent}` : "2px solid transparent",
              transition: "color 0.2s",
            }}
          >
            {tab}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setActiveLoc(loc)}
              style={{
                background: activeLoc === loc ? t.accentDim : "none",
                border: `1px solid ${activeLoc === loc ? t.accent : t.border}`,
                borderRadius: 6, padding: "4px 10px",
                fontSize: 11, fontWeight: 700,
                color: activeLoc === loc ? t.accent : t.sub,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </nav>

      {/* ── BODY ── */}
      <main style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto" }}>

        {/* KPI Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
          <StatCard label="Total Ad Spend"       value={1230}  prefix="$"  delta={8.2}   sub="vs last month"      t={t} />
          <StatCard label="Revenue Attributed"   value={28200} prefix="$"  delta={22.4}  sub="from ads"           t={t} color={t.green}  />
          <StatCard label="Gross ROI"            value={8.6}   suffix="x"  decimals={1} delta={14.3} sub="return on ad spend" t={t} color={t.accent} />
          <StatCard label="New Patients"         value={150}               delta={18.7}  sub="from campaigns"     t={t} color={t.purple} />
        </div>

        {/* KPI Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard label="Phone Calls"          value={188}               delta={26.1}  sub="from ads this month" t={t} color={t.green}  />
          <StatCard label="Direction Clicks"     value={290}               delta={19.4}  sub="map intent signals"  t={t} color={t.accent} />
          <StatCard label="Avg CPC"              value={4.72} prefix="$"  decimals={2}  delta={-8.3} sub="blended all locations" t={t} />
          <StatCard label="Quality Score"        value={8.4}              decimals={1}  delta={4.2}  sub="avg across keywords"  t={t} color={t.yellow} />
        </div>

        {/* Tab content */}
        {activeTab === "overview"     && <OverviewTab    t={t} />}
        {activeTab === "campaigns"    && <CampaignsTab   t={t} />}
        {activeTab === "calls"        && <CallsTab       t={t} />}
        {activeTab === "ai agents"    && <AgentsTab      t={t} />}
        {activeTab === "competitors"  && <CompetitorsTab t={t} />}
        {activeTab === "current status" && <CurrentStatusTab t={t} />}
        {activeTab === "predictive"     && <PredictiveTab    t={t} />}
        {activeTab === "website audit"   && <WebsiteAuditTab t={t} />}
        {activeTab === "pricing"        && <PricingTab       t={t} />}

        {/* Footer */}
        <footer style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: t.muted }}>
            🦾 <span style={{ color: t.accent, fontWeight: 700 }}>Sapiens Station</span> · AI Automation Agency · Powered by Claude API + n8n
          </div>
          <div style={{ fontSize: 11, color: t.muted }}>
            Refreshes every 15 min · Last sync: 7:42 PM CT · <span style={{ color: t.green }}>All systems operational</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
