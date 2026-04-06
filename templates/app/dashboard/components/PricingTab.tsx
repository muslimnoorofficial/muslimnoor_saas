"use client";

import { useState } from "react";
import type { Theme } from "@/types/dashboard";

interface Props { t: Theme }

// ─── TIER FEATURES — 20 / 15 / 15 items grouped into 5 categories each ──

const TIER1_GROUPS = [
  {
    category: "Website Build", color: "#00D4FF", items: [
      "Next.js 14 website built from scratch — not WordPress",
      "Homepage — conversion-optimized, 12-section layout",
      "2 location pages — Moore · Oklahoma City",
      "6 service pages — X-ray, vaccines, drug testing, etc.",
    ],
  },
  {
    category: "SEO Foundation", color: "#00E5A0", items: [
      "6 SEO landing pages — city + service keyword combos",
      "Mobile-first build — sub-2 second load time guaranteed",
      "Schema markup — LocalBusiness, FAQ, MedicalClinic",
      "Sanity CMS — staff edits content without a developer",
    ],
  },
  {
    category: "Tracking & Ads", color: "#FFB800", items: [
      "GTM + GA4 + full conversion tracking installed",
      "Call tracking numbers configured — 1 per location",
      "Google Ads campaign architecture — all 2 locations",
      "6 ad groups · 30 keywords · negative keyword list built",
    ],
  },
  {
    category: "Ad Creative", color: "#A78BFA", items: [
      "Ad copy written — 3 variants per group (27 total ads)",
      "All ad extensions configured — call, location, sitelink",
    ],
  },
  {
    category: "AI Infrastructure", color: "#FF9040", items: [
      "5 AI agents deployed and tested — Campaign, Content, Review, SEO, Reporting",
      "n8n automation workflows live and connected",
      "Slack approval pipeline configured",
      "HIPAA guardrails on all AI outputs",
      "Performance dashboard (this dashboard) delivered",
      "30-day post-launch monitoring included",
    ],
  },
];

const TIER2_GROUPS = [
  {
    category: "Google Ads Management", color: "#00D4FF", items: [
      "Google Ads managed — all 2 locations, every day",
      "Weekly bid optimization via Campaign Agent (AI)",
      "Monthly keyword expansion and pruning",
      "A/B testing — 2 new ad variants per month",
    ],
  },
  {
    category: "Ongoing SEO", color: "#00E5A0", items: [
      "Search terms audit — negatives added weekly",
      "4 SEO blog posts written and published (AI-authored)",
      "Search Console monitoring — ranking opportunities flagged",
      "Landing page performance analysis monthly",
    ],
  },
  {
    category: "Reputation", color: "#FFB800", items: [
      "Google review responses — 100% response rate (AI)",
      "Competitor ad monitoring — monthly snapshot",
    ],
  },
  {
    category: "Reporting", color: "#A78BFA", items: [
      "Weekly performance PDF sent automatically",
      "Live dashboard updated every 15 minutes",
      "Monthly budget pacing report",
    ],
  },
  {
    category: "Support", color: "#FF9040", items: [
      "Ad extension updates as needed",
      "Email support — 48hr response time",
    ],
  },
];

const TIER3_GROUPS = [
  {
    category: "Advanced Campaigns", color: "#00D4FF", items: [
      "Everything in Tier 2 — Growth",
      "Competitor conquest campaigns — bid on their brand terms",
      "Local Services Ads (Google Guaranteed badge) setup + mgmt",
      "Display remarketing — re-target visitors who didn't call",
    ],
  },
  {
    category: "AI Chatbot", color: "#00E5A0", items: [
      "AI chatbot included — $149/mo value at no extra charge",
      "Advanced chatbot — booking redirect + live handoff",
      "Voicemail transcription via Whisper API",
      "Personalized landing pages per UTM campaign source",
    ],
  },
  {
    category: "Content Scale", color: "#FFB800", items: [
      "8 blog posts per month — double the Growth tier",
      "Quarterly website refresh — copy, offers, new pages",
    ],
  },
  {
    category: "Strategy", color: "#A78BFA", items: [
      "Monthly 30-minute strategy video call",
      "Annual strategy audit and 12-month roadmap",
      "First access to new AI features we develop",
    ],
  },
  {
    category: "Guarantee", color: "#FF9040", items: [
      "Same-day Slack support channel — dedicated",
      "Performance guarantee — 3× ROI by Month 3 or Month 4 retainer is free",
    ],
  },
];

// ─── 12-PARAMETER COMPARISON TABLE ───────────────────────────────────────
// Groups: Website · Ads · AI · Transparency · Support · Results
const PARAM_GROUPS = [
  {
    group: "Website",
    params: [
      { label: "Build Technology",      t1: "Next.js 14",  t2: "WordPress",    t3: "WordPress/Webflow", t4: "Custom/CMS",   us: "Next.js 14"    },
      { label: "Mobile Load Time",      t1: "Sub-2s",      t2: "4–6s",         t3: "3–5s",              t4: "2–3s",         us: "Sub-2s"        },
      { label: "SEO Landing Pages",     t1: "6 included",  t2: "Not included", t3: "2–3 extra cost",    t4: "Full strategy",us: "6 included"    },
      { label: "Schema Markup",         t1: "Full",        t2: "None",         t3: "Basic",             t4: "Full",         us: "Full"          },
    ],
  },
  {
    group: "Ads & SEO",
    params: [
      { label: "Google Ads Management", t1: "Not managed", t2: "Basic mgmt",   t3: "Full managed",      t4: "Full managed", us: "AI-managed 24/7" },
      { label: "Ad Spend Markup",       t1: "N/A",         t2: "+15–20%",      t3: "+15–20%",           t4: "+15–20%",      us: "0% — $0 markup" },
      { label: "Blog Content",          t1: "Not included",t2: "Not included", t3: "Manual — extra",    t4: "Manual — extra",us: "AI · 4–8/mo"   },
    ],
  },
  {
    group: "AI & Automation",
    params: [
      { label: "AI Agents Running",     t1: "None",        t2: "None",         t3: "None",              t4: "None",         us: "5 agents · 24/7" },
      { label: "Review Automation",     t1: "None",        t2: "None",         t3: "Partial — manual",  t4: "Partial",      us: "100% automated" },
      { label: "Reporting",             t1: "Monthly PDF", t2: "Monthly PDF",  t3: "Monthly PDF",       t4: "Custom reports",us: "Live + weekly PDF" },
    ],
  },
  {
    group: "Transparency & Support",
    params: [
      { label: "Account Ownership",     t1: "Agency owns", t2: "Agency owns",  t3: "Agency owns",       t4: "Agency owns",  us: "You own it always" },
      { label: "Contract Required",     t1: "12 months",   t2: "6–12 months",  t3: "12 months",         t4: "12–24 months", us: "30-day notice only" },
    ],
  },
];

// ─── $3,199 TRANSPARENCY ─────────────────────────────────────────────────
const RETAINER_BREAKDOWN = [
  { item: "Campaign Agent — bid optimization, 24/7 monitoring",   category: "AI",      hours: 20, rate: 0,   ai: true  },
  { item: "Content Agent — 4 SEO blog posts written + published", category: "AI",      hours: 12, rate: 0,   ai: true  },
  { item: "Review Response Agent — 100% GMB reply rate",          category: "AI",      hours: 6,  rate: 0,   ai: true  },
  { item: "SEO Agent — Search Console, ranking opportunities",     category: "AI",      hours: 6,  rate: 0,   ai: true  },
  { item: "Reporting Agent — weekly PDF auto-generated",          category: "AI",      hours: 4,  rate: 0,   ai: true  },
  { item: "Human strategy review + campaign approvals",            category: "Human",   hours: 3,  rate: 185, ai: false },
  { item: "Monthly recommendations + client communication",       category: "Human",   hours: 2,  rate: 185, ai: false },
];

const AGENCY_EQUIV_RATE = 170; // blended hourly rate for equivalent manual work

// ─── 3-MONTH COST COMPARISON ─────────────────────────────────────────────
// Month 1 = build + retainer + ads. Month 2–3 = retainer + ads only.
const AGENCY_DATA = [
  {
    name: "Type 1 — Local",
    color: "#FF4060",
    build: 7500,
    monthlyRetainer: 425,
    adSpend: 1200,
    adMarkup: 0,      // They don't manage ads
    managesAds: false,
    hasAI: false,
    contract: "12 months",
    owns: false,
  },
  {
    name: "Type 2 — Mid-Size",
    color: "#FFB800",
    build: 13000,
    monthlyRetainer: 1200,
    adSpend: 1200,
    adMarkup: 0.18,   // 18% markup on ad spend
    managesAds: true,
    hasAI: false,
    contract: "6–12 months",
    owns: false,
  },
  {
    name: "Type 3 — Enterprise",
    color: "#A78BFA",
    build: 40000,
    monthlyRetainer: 4000,
    adSpend: 2500,
    adMarkup: 0.17,
    managesAds: true,
    hasAI: false,
    contract: "12–24 months",
    owns: false,
  },
  {
    name: "Sapiens Station",
    color: "#00E5A0",
    build: 4997,
    monthlyRetainer: 1999,
    adSpend: 1200,
    adMarkup: 0,       // 0% markup — guaranteed
    managesAds: true,
    hasAI: true,
    contract: "30-day notice",
    owns: true,
    isUs: true,
  },
];

function calc3Month(a: typeof AGENCY_DATA[0]) {
  const realAdM1 = a.adSpend * (1 + a.adMarkup);
  const realAdOngoing = a.adSpend * (1 + a.adMarkup);
  const m1 = a.build + a.monthlyRetainer + realAdM1;
  const m23 = (a.monthlyRetainer + realAdOngoing) * 2;
  return { m1: Math.round(m1), m23: Math.round(m23), total: Math.round(m1 + m23) };
}

type View = "tiers" | "breakdown" | "comparison" | "summary";

export default function PricingTab({ t }: Props) {
  const [view, setView]               = useState<View>("tiers");
  const [selectedTier, setSelectedTier] = useState(1);
  const [openGroup, setOpenGroup]     = useState<number | null>(null);

  const aiHours    = RETAINER_BREAKDOWN.filter(r => r.ai).reduce((a, r) => a + r.hours, 0);
  const humanHours = RETAINER_BREAKDOWN.filter(r => !r.ai).reduce((a, r) => a + r.hours, 0);
  const totalHours = aiHours + humanHours;
  const aiPct      = Math.round((aiHours / totalHours) * 100);
  const agencyEquiv = Math.round(totalHours * AGENCY_EQUIV_RATE);

  const VIEWS: { id: View; label: string }[] = [
    { id: "tiers",      label: "Tier Comparison"    },
    { id: "breakdown",  label: "$3,199 Breakdown"   },
    { id: "comparison", label: "Agency vs Us"        },
    { id: "summary",    label: "3-Month Cost"        },
  ];

  const TIERS = [
    { label: "Tier 1 — Launch",    price: "$4,997",    sub: "one-time",    color: "#00D4FF", groups: TIER1_GROUPS },
    { label: "Tier 2 — Growth",    price: "$1,999/mo", sub: "+ ad spend",  color: "#00E5A0", groups: TIER2_GROUPS },
    { label: "Tier 3 — Domination",price: "$1,999/mo", sub: "full package",color: "#A78BFA", groups: TIER3_GROUPS },
  ];

  const tier = TIERS[selectedTier];

  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* ── HEADLINE ── */}
      <div style={{ marginBottom: 20, padding: "20px 26px", borderRadius: 16, background: `linear-gradient(135deg, ${t.accentDim}, ${t.greenDim})`, border: `1px solid ${t.accent}28`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>Sapiens Station — Full Pricing & Value Breakdown</div>
          <div style={{ fontSize: 12, color: t.sub }}>Complete transparency · No hidden fees · 0% ad spend markup · 30-day cancellation</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: t.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Traditional Agency Equivalent</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: t.red, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>$5,800+/mo</div>
          <div style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>for the same scope of work</div>
        </div>
      </div>

      {/* ── VIEW NAV ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, padding: 5, background: t.hover, borderRadius: 12, border: `1px solid ${t.border}` }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", cursor: "pointer",
            background: view === v.id ? t.card : "transparent",
            boxShadow: view === v.id ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
            fontSize: 12, fontWeight: 700,
            color: view === v.id ? t.text : t.sub,
            transition: "all 0.2s",
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1 — TIER COMPARISON                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {view === "tiers" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          {/* Tier selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
            {TIERS.map((tier, i) => (
              <button key={i} onClick={() => setSelectedTier(i)} style={{
                background: selectedTier === i ? `${tier.color}10` : t.card,
                border: `2px solid ${selectedTier === i ? tier.color : t.border}`,
                borderRadius: 14, padding: "18px 20px", cursor: "pointer",
                textAlign: "left", transition: "all 0.2s",
                boxShadow: selectedTier === i ? `0 0 20px ${tier.color}18` : "none",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: selectedTier === i ? tier.color : t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{tier.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: tier.color }}>{tier.price}</span>
                  <span style={{ fontSize: 11, color: t.muted }}>{tier.sub}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feature groups for selected tier */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tier.groups.map((group, gi) => (
              <div key={gi} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
                  style={{ width: "100%", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{group.category}</span>
                    <span style={{ fontSize: 10, color: t.muted, fontWeight: 600 }}>{group.items.length} deliverables</span>
                  </div>
                  <span style={{ fontSize: 16, color: group.color, transition: "transform 0.2s", transform: openGroup === gi ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openGroup === gi && (
                  <div style={{ padding: "0 18px 16px" }}>
                    <div style={{ height: 1, background: t.border, marginBottom: 14 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {group.items.map((item, ii) => (
                        <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: group.color, fontSize: 12, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>✓</span>
                          <span style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chatbot add-on callout */}
          <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 12, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.purple, marginBottom: 2 }}>🤖 AI Chatbot Add-on</div>
              <div style={{ fontSize: 11, color: t.sub }}>Available on Tier 2 · Included free on Tier 3 · FAQ answering, booking redirect, HIPAA-safe</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.purple }}>$149/mo</div>
              <div style={{ fontSize: 10, color: t.muted }}>Free on Tier 3</div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2 — $3,199 TRANSPARENCY BREAKDOWN                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {view === "breakdown" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>

          {/* Visual split */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            {[
              { label: "Goes to Google", amount: 1200, pct: 37.6, color: "#FFB800", sub: "100% of your ad spend goes directly to Google Ads. We don't touch it, markup it, or take a cut. Ever.", icon: "🔵" },
              { label: "Sapiens Station Retainer", amount: 1999, pct: 62.4, color: t.green, sub: "This covers everything — AI agents running 24/7, human strategy oversight, content, reviews, reporting, support.", icon: "🟢" },
            ].map((s, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: s.color, marginBottom: 8 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif", lineHeight: 1, marginBottom: 4 }}>${s.amount.toLocaleString()}</div>
                <div style={{ fontSize: 14, color: t.sub, marginBottom: 14 }}>{s.pct}% of your total</div>
                {/* Bar */}
                <div style={{ height: 8, background: t.hover, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Retainer line items */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>Where Your $1,999 Retainer Goes — Line by Line</div>
                <div style={{ fontSize: 11, color: t.sub }}>{totalHours} hours/month of work delivered · {aiPct}% by AI agents · equivalent agency cost ${agencyEquiv.toLocaleString()}/mo</div>
              </div>
              {/* AI vs Human bar */}
              <div style={{ flexShrink: 0, textAlign: "right", minWidth: 160 }}>
                <div style={{ fontSize: 10, color: t.sub, marginBottom: 5 }}>AI {aiPct}% · Human {100 - aiPct}%</div>
                <div style={{ height: 8, background: t.hover, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${aiPct}%`, background: t.purple, borderRadius: "4px 0 0 4px" }} />
                  <div style={{ width: `${100 - aiPct}%`, background: t.accent, borderRadius: "0 4px 4px 0" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {RETAINER_BREAKDOWN.map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: row.ai ? "rgba(167,139,250,0.06)" : t.hover, borderRadius: 10, border: `1px solid ${row.ai ? "rgba(167,139,250,0.15)" : t.border}` }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: row.ai ? "rgba(167,139,250,0.15)" : t.accentDim, color: row.ai ? t.purple : t.accent, flexShrink: 0, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {row.ai ? "🤖 AI" : "👤 HUMAN"}
                  </span>
                  <span style={{ fontSize: 12, color: t.sub, flex: 1 }}>{row.item}</span>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{row.hours}h/mo</div>
                    {!row.ai && <div style={{ fontSize: 9, color: t.muted }}>${row.rate}/hr</div>}
                    {row.ai && <div style={{ fontSize: 9, color: t.purple }}>automated</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { label: "Agency Equivalent Cost",  value: `$${agencyEquiv.toLocaleString()}/mo`, color: t.red    },
                { label: "You Pay",                  value: "$1,999/mo",                           color: t.green  },
                { label: "You Save",                 value: `$${(agencyEquiv - 1999).toLocaleString()}/mo`,  color: t.accent },
              ].map((s, i) => (
                <div key={i} style={{ padding: "14px", background: t.hover, borderRadius: 10, textAlign: "center", border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 10, color: t.sub, marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparency promises */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { icon: "🚫", title: "0% Ad Markup",       desc: "Your $1,200 goes 100% to Google. Most agencies skim 15–20% off the top. We charge zero on pass-through spend." },
              { icon: "📊", title: "Full Account Access", desc: "You have admin access to your own Google Ads account. Every click, every dollar visible in real time. It's your account." },
              { icon: "🔓", title: "30-Day Exit",         desc: "No lock-in contracts. 30-day cancellation notice — that's it. You keep your campaigns, data, and website if you leave." },
            ].map((item, i) => (
              <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 3 — AGENCY COMPARISON TABLE (12 parameters grouped)          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {view === "comparison" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "200px repeat(4, 1fr)", background: t.hover, padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>Parameter</div>
              {["Type 1 — Local", "Type 2 — Mid-Size", "Type 3 — Enterprise", "Sapiens Station"].map((h, i) => (
                <div key={h} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: i === 3 ? t.green : t.sub, paddingLeft: 8 }}>{h}</div>
              ))}
            </div>

            {/* Grouped rows */}
            {PARAM_GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* Group header */}
                <div style={{ padding: "8px 16px", background: `${t.hover}88`, borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: t.sub, textTransform: "uppercase", letterSpacing: "0.1em" }}>{group.group}</span>
                </div>
                {group.params.map((row, ri) => {
                  const vals = [row.t1, row.t2, row.t3, row.us];
                  return (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "200px repeat(4, 1fr)", padding: "11px 16px", borderBottom: `1px solid ${t.border}22`, alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: t.sub, fontWeight: 600 }}>{row.label}</div>
                      {vals.map((val, vi) => {
                        const isUs = vi === 3;
                        const isBad = !isUs && (val.includes("None") || val.includes("Not") || val.includes("+15") || val.includes("owns") || val.includes("12 months") || val.includes("24"));
                        const isGood = val.includes("Sub-2") || val.includes("0%") || val.includes("24/7") || val.includes("You own") || val.includes("30-day") || val.includes("6 included") || val.includes("AI") || val.includes("Full") || val.includes("100%");
                        return (
                          <div key={vi} style={{ textAlign: "center", paddingLeft: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: isUs ? 800 : 600,
                              color: isUs ? t.green : isBad ? t.red : isGood ? t.green : t.sub,
                              background: isUs ? t.greenDim : "transparent",
                              padding: isUs ? "3px 8px" : "0",
                              borderRadius: isUs ? 6 : 0,
                            }}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Build cost row */}
            <div style={{ background: t.hover, borderTop: `1px solid ${t.border}` }}>
              <div style={{ padding: "8px 16px", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: t.sub, textTransform: "uppercase", letterSpacing: "0.1em" }}>Investment</span>
              </div>
              {[
                { label: "Build / Launch Fee", vals: ["$7,500", "$13,000", "$40,000", "$4,997"] },
                { label: "Monthly Retainer",   vals: ["$350–500", "$1,200", "$4,000+", "$1,999"] },
                { label: "Ad Spend (est.)",    vals: ["Self-managed", "$1,416 w/markup", "$2,925 w/markup", "$1,200 direct"] },
                { label: "Real Monthly Total", vals: ["$1,550–1,700", "$2,616", "$6,925+", "$3,199"] },
              ].map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "200px repeat(4, 1fr)", padding: "10px 16px", borderBottom: `1px solid ${t.border}22`, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: t.sub, fontWeight: 600 }}>{row.label}</div>
                  {row.vals.map((v, vi) => (
                    <div key={vi} style={{ textAlign: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: vi === 3 ? t.green : vi === 2 ? t.red : t.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 12, background: t.greenDim, border: `1px solid ${t.green}22`, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
            <span style={{ color: t.green, fontWeight: 700 }}>Why our monthly looks higher than Type 2:</span> Their $1,200 retainer excludes ad management — clients handle their own spend, unguided, with no AI. Their real total including ad spend and hidden markup is $2,616/mo for far less service.
            Our $3,199 = $1,200 going <span style={{ color: t.green, fontWeight: 700 }}>directly to Google</span> + $1,999 covering everything — 5 AI agents, full management, automated content, 24/7 optimization. You're paying <span style={{ color: t.green, fontWeight: 700 }}>$583/mo more than Type 2</span> and getting 10× the output.
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW 4 — 3-MONTH COST SUMMARY                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {view === "summary" && (
        <div style={{ animation: "fadeUp 0.3s ease forwards" }}>

          {/* Our invoice */}
          <div style={{ background: t.card, border: `1px solid ${t.green}33`, borderRadius: 14, padding: "22px 26px", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
              <span>Sapiens Station — 3-Month Investment Summary</span>
              <span style={{ fontSize: 12, color: t.sub, fontWeight: 600 }}>Growth Tier · Recommended</span>
            </div>

            {/* Month 1 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: t.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, padding: "6px 10px", background: t.accentDim, borderRadius: 8, display: "inline-block" }}>
                Month 1 — Launch
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Website Rebuild",         amount: 1999, note: "one-time" },
                  { label: "Google Ads Setup",         amount: 1499, note: "one-time" },
                  { label: "AI Agent Deployment",      amount: 1499, note: "one-time" },
                  { label: "Month 1 Retainer",         amount: 1999, note: "recurring begins" },
                  { label: "Ad Spend → Google",        amount: 1200, note: "direct, 0% markup" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: t.hover, borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: 10, color: t.muted, marginLeft: 8 }}>{row.note}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>${row.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 12px", background: t.accentDim, borderRadius: 8, border: `1px solid ${t.accent}22` }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>Month 1 Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: t.accent }}>$8,196</span>
                </div>
              </div>
            </div>

            {/* Month 2–3 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: t.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, padding: "6px 10px", background: t.greenDim, borderRadius: 8, display: "inline-block" }}>
                Months 2 & 3 — Optimize & Scale
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Monthly Retainer × 2", amount: 3998, note: "$1,999 × 2 months" },
                  { label: "Ad Spend × 2 → Google", amount: 2400, note: "$1,200 × 2 months" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: t.hover, borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: 10, color: t.muted, marginLeft: 8 }}>{row.note}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>${row.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 12px", background: t.greenDim, borderRadius: 8, border: `1px solid ${t.green}22` }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>3-Month Grand Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: t.green }}>$14,594</span>
                </div>
              </div>
            </div>

            {/* Prepay option */}
            <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 12, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.22)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.purple, marginBottom: 4 }}>6-Month Prepay Option — Waive the Launch Fee</div>
                <div style={{ fontSize: 11, color: t.sub }}>Pay 6 months retainer upfront ($11,994) · Launch fee ($4,997) completely waived · You save $4,997</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.purple, fontFamily: "'DM Serif Display', serif" }}>$11,994</div>
                <div style={{ fontSize: 10, color: t.muted }}>saves $4,997</div>
              </div>
            </div>
          </div>

          {/* 3-month comparison — all 4 agencies */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>3-Month Total Cost — All Agencies Side by Side</div>
            <div style={{ fontSize: 11, color: t.sub, marginBottom: 18 }}>Includes build fee + retainer + ad spend (with markup where applicable)</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {AGENCY_DATA.map((a, i) => {
                const c = calc3Month(a);
                const maxTotal = 75000;
                const pct = Math.min((c.total / maxTotal) * 100, 100);
                return (
                  <div key={i} style={{ background: (a as any).isUs ? `${a.color}08` : t.hover, border: `1px solid ${(a as any).isUs ? a.color + "33" : t.border}`, borderRadius: 12, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: (a as any).isUs ? a.color : t.text, marginBottom: 4 }}>{a.name}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {[
                            { label: `Build: $${a.build.toLocaleString()}` },
                            { label: `Retainer: $${a.monthlyRetainer}/mo` },
                            { label: a.adMarkup > 0 ? `Ad markup: +${Math.round(a.adMarkup * 100)}%` : "0% ad markup", highlight: a.adMarkup === 0 },
                            { label: a.hasAI ? "AI agents: ✓" : "AI agents: ✗", highlight: a.hasAI },
                            { label: `Contract: ${a.contract}` },
                          ].map((tag, ti) => (
                            <span key={ti} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: tag.highlight ? `${a.color}18` : t.card, color: tag.highlight ? a.color : t.muted, fontWeight: tag.highlight ? 800 : 500, border: `1px solid ${tag.highlight ? a.color + "33" : t.border}` }}>
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ fontSize: 9, color: t.muted, fontWeight: 700, marginBottom: 2 }}>3-MONTH TOTAL</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: a.color, fontFamily: "'DM Serif Display', serif" }}>${c.total.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ height: 8, background: t.card, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: a.color, borderRadius: 4, opacity: 0.8 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 9, color: t.muted }}>M1: ${c.m1.toLocaleString()}</span>
                      <span style={{ fontSize: 9, color: t.muted }}>M2–3: ${c.m23.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The punchline */}
            <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 12, background: t.greenDim, border: `1px solid ${t.green}22` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.text, marginBottom: 6 }}>The Punchline</div>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
                Over 3 months, Sapiens Station costs <span style={{ color: t.green, fontWeight: 700 }}>$2,246 less than Type 2</span> — while delivering AI automation, 0% ad markup, full ownership, and no lock-in contract. Type 3 Enterprise costs <span style={{ color: t.red, fontWeight: 700 }}>4.5× more</span> for the same outcome. Our 6-month prepay at $16,994 total is cheaper than Type 2's 6-month at $21,096 — and you get <span style={{ color: t.green, fontWeight: 700 }}>everything Type 3 delivers</span>.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
