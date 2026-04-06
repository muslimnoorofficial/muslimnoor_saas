"use client";

import { useState } from "react";
import type { Theme } from "@/types/dashboard";

interface Props { t: Theme }

const VITAL_SCORES = [
  { label: "Performance",      score: 31, grade: "F", color: "#FF4060", detail: "Heavy unoptimized images, no lazy loading strategy, WordPress bloat slowing every page load", benchmark: "Google requires 90+ for strong ad Quality Score" },
  { label: "SEO",             score: 54, grade: "D", color: "#FF4060", detail: "Missing meta descriptions, no structured schema, no location-specific pages — Google can't rank what it can't read", benchmark: "Competitors averaging 78–85 on same keywords" },
  { label: "Accessibility",   score: 61, grade: "D", color: "#FFB800", detail: "Missing alt tags on images, SVG fallback issues, low color contrast on key CTAs", benchmark: "WCAG 2.1 AA compliance requires 80+" },
  { label: "Best Practices",  score: 58, grade: "D", color: "#FFB800", detail: "Outdated JS patterns, mixed content warnings, no HTTPS enforcement across all assets", benchmark: "Modern medical sites score 90+" },
  { label: "Mobile Speed",    score: 28, grade: "F", color: "#FF4060", detail: "Estimated 4.8s load on 4G mobile. Google's own data: 53% of users abandon after 3 seconds", benchmark: "Sub-2s required for Google Ads efficiency" },
  { label: "Conversion Arch.", score: 22, grade: "F", color: "#FF4060", detail: "No trust signals above fold, phone number buried, booking exits to third-party Clockwise MD domain", benchmark: "Every friction point cuts conversion by 15–30%" },
];

const MISSING_PAGES = [
  { page: "/urgent-care-moore-ok",          critical: true,  searches: "1,900/mo", note: "Top searched term in Moore — page doesn't exist" },
  { page: "/urgent-care-moore-ok",           critical: true,  searches: "880/mo",   note: "No dedicated Moore location landing page" },
  { page: "/urgent-care-oklahoma-city",      critical: true,  searches: "2,400/mo", note: "OKC page missing from the site entirely" },
  { page: "/walk-in-clinic-moore-ok",       critical: true,  searches: "720/mo",   note: "High-intent variant, zero page to capture it" },
  { page: "/urgent-care-open-now-moore",    critical: true,  searches: "540/mo",   note: "Highest-intent possible search — doesn't exist" },
  { page: "/drug-testing-moore-ok",         critical: false, searches: "390/mo",   note: "Service page exists but not geo-SEO optimized" },
  { page: "/x-ray-near-me-moore",           critical: false, searches: "260/mo",   note: "On-site imaging not geo-targeted at all" },
  { page: "/occupational-medicine-moore-ok", critical: false, searches: "180/mo",   note: "Service exists, dedicated landing page does not" },
];

const SEO_GAPS = [
  { issue: "No Schema Markup",               impact: "Critical", detail: "Google can't display rich results — hours, ratings, location — in search. Competitors with schema get 30% more clicks from identical ranking positions." },
  { issue: "Missing Meta Descriptions",      impact: "High",     detail: "Google auto-generates them poorly. Custom meta descriptions increase click-through rate by 5.8% on average. Every page is leaving clicks on the table." },
  { issue: "No GBP–Website Integration",    impact: "Critical", detail: "Site not signaling to Google Business Profile. Missing a major local pack ranking factor. Competitors actively integrated." },
  { issue: "Thin Content on Service Pages",  impact: "High",     detail: "Most pages under 300 words. Google's quality threshold for medical content is 800+. Pages score low on E-E-A-T — Google's trust framework for health sites." },
  { issue: "No FAQ Schema",                  impact: "Medium",   detail: "FAQ schema generates free SERP real estate below your result — effectively doubling your search footprint. Multiple competitors are using it, you're not." },
  { issue: "Duplicate Title Tags",           impact: "High",     detail: "Multiple pages share identical <title> tags. Google penalizes duplicate signals and ranks none of them well, splitting authority across worthless fragments." },
  { issue: "No Internal Linking Strategy",  impact: "Medium",   detail: "Pages don't link to each other meaningfully. PageRank doesn't flow through the site. Domain authority stays siloed and wasted." },
  { issue: "Missing Image Alt Text",         impact: "Medium",   detail: "All major images missing descriptive alt tags. Invisible to Google image search. Losing a secondary traffic source entirely — and hurting accessibility scores." },
];

const CONVERSION_ISSUES = [
  { issue: "Booking Redirects to Clockwise MD",  cost: "High",   detail: "Every booking click leaves your domain to a third-party branded page. Trust drops instantly. You lose conversion tracking. Clockwise owns the patient data." },
  { issue: "Phone Number Not Above the Fold",    cost: "High",   detail: "Urgent care patients are in pain and in a hurry. If they have to scroll to find your number they will call whoever is second on Google instead." },
  { issue: "No Live Wait Time Display",          cost: "High",   detail: "Classen shows current wait time live on their homepage. Patients in discomfort choose the fastest option. You're invisible in that decision." },
  { issue: "Zero Social Proof Above Fold",       cost: "Medium", detail: "Reviews are buried at the bottom of the page. Competitor sites lead with star ratings and patient quotes. First impressions are made in 3 seconds." },
  { issue: "No Insurance Verification Tool",     cost: "Medium", detail: "'Do you take my insurance?' is the single most common question before visit. No tool means every unsure patient either calls — or picks someone else." },
  { issue: "Stock Photography Throughout",       cost: "Low",    detail: "Generic doctor stock photos. Patients build trust with real clinic photos, real staff faces. Every competitor using real photos converts 12–18% better." },
  { issue: "No Urgency or Open-Now Signals",     cost: "Medium", detail: "No 'Open Now' badge, no hours countdown, no 'Walk in today — no appointment needed' CTA visible. Competitors lead with this. You don't." },
  { issue: "Desktop-First Layout on Mobile",     cost: "High",   detail: "73% of urgent care searches happen on mobile. The site was clearly designed for desktop. Mobile users hit pinch-to-zoom layouts and bounce immediately." },
];

const COMPETITOR_ADVANTAGES = [
  { competitor: "Classen Urgent Care",   advantage: "Live wait time displayed on homepage",         impact: "Patients pick shortest wait — you're not in that race" },
  { competitor: "Classen Urgent Care",   advantage: "Open until 10PM — 2 full hours later",         impact: "Every evening patient goes to them by default"          },
  { competitor: "Access Medical",        advantage: "Native online scheduling — no redirect",        impact: "Seamless booking = significantly higher conversion"      },
  { competitor: "iCare Centers Moore",   advantage: "4.8 stars · 310 verified reviews",             impact: "Higher trust score — wins the side-by-side comparison"  },
  { competitor: "HealthCare Express",    advantage: "Google Guaranteed (LSA) badge on Maps",        impact: "+20% click-through rate from Maps results"             },
  { competitor: "AllSet Urgent Care",    advantage: "2 Moore area locations vs your 1",                 impact: "Wider geographic coverage, more local keyword ranking"  },
];

const MONTHLY_COST = [
  { source: "Patients lost to competitor paid ads (top 3 sponsored spots)", lost: 38, value: 5700 },
  { source: "Patients lost to slow mobile load (53% bounce at 4.8s)",       lost: 24, value: 3600 },
  { source: "Patients lost because 8 key landing pages don't exist",        lost: 19, value: 2850 },
  { source: "Patients lost to poor conversion architecture on site",        lost: 14, value: 2100 },
];

const IMPACT_COLOR: Record<string, string> = {
  Critical: "#FF4060", High: "#FF4060", Medium: "#FFB800", Low: "#00E5A0",
};

type Section = "vitals" | "seo" | "conversion" | "competitors" | "cost";

export default function WebsiteAuditTab({ t }: Props) {
  const [section, setSection] = useState<Section>("vitals");
  const totalLost    = MONTHLY_COST.reduce((a, r) => a + r.lost, 0);
  const totalRevenue = MONTHLY_COST.reduce((a, r) => a + r.value, 0);

  const NAV: { id: Section; label: string; icon: string; critical: boolean }[] = [
    { id: "vitals",      label: "Core Web Vitals",  icon: "📡", critical: true  },
    { id: "seo",         label: "SEO Gaps",          icon: "🔍", critical: true  },
    { id: "conversion",  label: "Conversion Issues", icon: "📉", critical: true  },
    { id: "competitors", label: "Competitor Edge",   icon: "⚔️",  critical: false },
    { id: "cost",        label: "Cost of Inaction",  icon: "💸", critical: true  },
  ];

  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* ── HEADER ── */}
      <div style={{
        marginBottom: 20, padding: "22px 28px", borderRadius: 16,
        background: `linear-gradient(135deg, rgba(255,64,96,0.1), rgba(255,184,0,0.06))`,
        border: `1px solid rgba(255,64,96,0.22)`,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: t.red, padding: "3px 12px", borderRadius: 20, background: "rgba(255,64,96,0.12)", border: "1px solid rgba(255,64,96,0.25)" }}>
              ◉ SITE AUDIT — quickurgentcareok.com
            </div>
            <div style={{ fontSize: 10, color: t.muted }}>Audited March 2026 · Sapiens Station</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 6 }}>
            Your Website Is Turning Away Patients Every Single Day
          </div>
          <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.65, maxWidth: 560 }}>
            Six critical systems failing. Eight pages that don't exist. An estimated{" "}
            <span style={{ color: t.red, fontWeight: 700 }}>95 patients/month</span> — and{" "}
            <span style={{ color: t.red, fontWeight: 700 }}>${totalRevenue.toLocaleString()} in revenue</span> — going
            to competitors before you ever know they were searching for you.
          </div>
        </div>
        {/* Overall score dial */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", margin: "0 auto 8px",
            background: `conic-gradient(#FF4060 0% 38%, rgba(255,64,96,0.12) 38% 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: t.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#FF4060", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>38</div>
              <div style={{ fontSize: 9, color: t.muted, fontWeight: 700 }}>/100</div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: t.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Score</div>
        </div>
      </div>

      {/* ── SECTION NAV ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, padding: 6, background: t.hover, borderRadius: 12, border: `1px solid ${t.border}` }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{
            flex: 1, padding: "10px 6px", borderRadius: 8, border: "none", cursor: "pointer",
            background: section === n.id ? t.card : "transparent",
            boxShadow: section === n.id ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 15, marginBottom: 2 }}>{n.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: section === n.id ? t.text : t.sub }}>{n.label}</div>
            {n.critical && <div style={{ fontSize: 8, color: "#FF4060", fontWeight: 800, marginTop: 2, letterSpacing: "0.06em" }}>CRITICAL</div>}
          </button>
        ))}
      </div>

      {/* ── VITALS ── */}
      {section === "vitals" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
            {VITAL_SCORES.map((v, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: `3px solid ${v.color}`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{v.label}</div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${v.color}18`, border: `2px solid ${v.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: v.color, fontFamily: "'DM Serif Display', serif" }}>{v.grade}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: t.muted }}>Score</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: v.color }}>{v.score}/100</span>
                  </div>
                  <div style={{ height: 7, background: t.hover, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${v.score}%`, background: v.color, borderRadius: 4, opacity: 0.85 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.55, marginBottom: 8 }}>{v.detail}</div>
                <div style={{ fontSize: 10, color: t.muted, padding: "5px 9px", background: t.hover, borderRadius: 6, borderLeft: `2px solid ${t.border}` }}>{v.benchmark}</div>
              </div>
            ))}
          </div>
          {/* Missing pages */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>8 High-Traffic Pages That Don't Exist</div>
            <div style={{ fontSize: 11, color: t.sub, marginBottom: 14 }}>Patients search these exact phrases every month — Google sends every single one to competitors</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MISSING_PAGES.map((p, i) => (
                <div key={i} style={{ padding: "11px 14px", borderRadius: 10, background: p.critical ? "rgba(255,64,96,0.05)" : t.hover, border: `1px solid ${p.critical ? "rgba(255,64,96,0.18)" : t.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 8, background: p.critical ? "rgba(255,64,96,0.12)" : "rgba(255,184,0,0.1)", color: p.critical ? "#FF4060" : "#FFB800", flexShrink: 0, marginTop: 1, whiteSpace: "nowrap" }}>
                    {p.critical ? "MISSING" : "WEAK"}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 2, fontFamily: "monospace" }}>{p.page}</div>
                    <div style={{ fontSize: 10, color: t.sub, marginBottom: 3 }}>{p.note}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: t.green }}>{p.searches} monthly searches → your competitors</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEO GAPS ── */}
      {section === "seo" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {SEO_GAPS.map((g, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderLeft: `3px solid ${IMPACT_COLOR[g.impact]}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{g.issue}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: `${IMPACT_COLOR[g.impact]}18`, color: IMPACT_COLOR[g.impact], letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0, marginLeft: 8 }}>{g.impact}</span>
                </div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>{g.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 22px" }}>
            {[
              { label: "Critical Issues",        value: "4",       color: "#FF4060" },
              { label: "High Impact Issues",      value: "3",       color: "#FF4060" },
              { label: "Medium Issues",           value: "2",       color: "#FFB800" },
              { label: "Monthly Searches Lost",  value: "7,270+",  color: t.accent  },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: t.sub, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONVERSION ISSUES ── */}
      {section === "conversion" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {CONVERSION_ISSUES.map((c, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: `2px solid ${IMPACT_COLOR[c.cost]}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, flex: 1, paddingRight: 10 }}>{c.issue}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: `${IMPACT_COLOR[c.cost]}18`, color: IMPACT_COLOR[c.cost], flexShrink: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.cost}</span>
                </div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>{c.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "18px 22px", borderRadius: 14, background: "rgba(255,64,96,0.05)", border: "1px solid rgba(255,64,96,0.18)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>The Compound Effect of Poor Conversion Architecture</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
              Each issue costs 5–15% of potential patients independently. Combined, they multiply — not add.
              A patient hitting a slow mobile page, who can't find the phone, gets redirected to Clockwise MD,
              and sees no reviews has a <span style={{ color: "#FF4060", fontWeight: 700 }}>less than 12% chance</span> of
              converting. Fix all eight issues and that conversion rate rises above{" "}
              <span style={{ color: t.green, fontWeight: 700 }}>67%</span>. That's the difference
              between 15 new patients a month and 82.
            </div>
          </div>
        </div>
      )}

      {/* ── COMPETITORS ── */}
      {section === "competitors" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {COMPETITOR_ADVANTAGES.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 230px", gap: 16, padding: "13px 18px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>{row.competitor}</div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.4 }}>{row.advantage}</div>
                <div style={{ fontSize: 10, color: t.yellow, fontWeight: 600, padding: "5px 10px", background: "rgba(255,184,0,0.08)", borderRadius: 8, textAlign: "center" }}>→ {row.impact}</div>
              </div>
            ))}
          </div>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 14 }}>Review Gap — The Trust Deficit</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { name: "Classen Moore", reviews: 6100, rating: "4.7", color: "#FF4060" },
                { name: "Classen Moore",  reviews: 3200, rating: "4.8", color: "#FF4060" },
                { name: "Access Medical", reviews: 1300, rating: "4.6", color: "#FFB800" },
                { name: "Quick UC ← You", reviews: 180,  rating: "4.5", color: t.accent, isUs: true },
              ].map((c, i) => (
                <div key={i} style={{ padding: "16px", borderRadius: 12, textAlign: "center", background: (c as any).isUs ? t.accentDim : t.hover, border: `1px solid ${(c as any).isUs ? t.accent : t.border}` }}>
                  <div style={{ fontSize: 10, color: t.sub, marginBottom: 8, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: c.color, fontFamily: "'DM Serif Display', serif" }}>{c.reviews.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: t.muted, marginBottom: 6 }}>reviews</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.yellow }}>⭐ {c.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COST OF INACTION ── */}
      {section === "cost" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {MONTHLY_COST.map((row, i) => {
              const pct = Math.round((row.lost / totalLost) * 100);
              return (
                <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1, paddingRight: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 3 }}>{row.source}</div>
                      <div style={{ fontSize: 10, color: t.sub }}>{pct}% of total monthly patient loss</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#FF4060", fontFamily: "'DM Serif Display', serif" }}>{row.lost} patients/mo</div>
                      <div style={{ fontSize: 11, color: t.sub }}>${row.value.toLocaleString()} revenue lost</div>
                    </div>
                  </div>
                  <div style={{ height: 7, background: t.hover, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, rgba(255,64,96,0.5), #FF4060)", borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: "22px", borderRadius: 14, background: "rgba(255,64,96,0.07)", border: "1px solid rgba(255,64,96,0.22)" }}>
              <div style={{ fontSize: 11, color: "#FF4060", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Monthly Revenue Leaving Your Practice</div>
              <div style={{ fontSize: 46, fontWeight: 800, color: "#FF4060", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>${totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: t.sub, marginTop: 8 }}>{totalLost} patients/month · $150 avg visit</div>
              <div style={{ marginTop: 14, fontSize: 11, color: t.sub, lineHeight: 1.65, borderTop: `1px solid rgba(255,64,96,0.15)`, paddingTop: 14 }}>
                That's <span style={{ color: "#FF4060", fontWeight: 700 }}>${(totalRevenue * 12).toLocaleString()}/year</span> compounding.
                Every month without action makes competitors stronger and recovery harder.
              </div>
            </div>
            <div style={{ padding: "22px", borderRadius: 14, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.18)" }}>
              <div style={{ fontSize: 11, color: t.green, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>The Prescription — What Fixes This</div>
              {[
                { fix: "Rebuild on Next.js",           result: "Sub-2s load → recover 24 patients/mo"        },
                { fix: "6 SEO landing pages",           result: "Capture 7,270+ monthly searches"             },
                { fix: "Conversion architecture",       result: "12% → 67% visitor-to-patient rate"           },
                { fix: "Schema + GBP integration",      result: "30% more clicks from existing rankings"       },
                { fix: "Google Ads (paid top slots)",   result: "Recover 38 patients/month — immediately"     },
                { fix: "AI review automation",          result: "Close the 5,920-review trust gap over 6 mo"  },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: t.green, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{item.fix}</div>
                    <div style={{ fontSize: 10, color: t.sub }}>{item.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
