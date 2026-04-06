"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { Theme } from "@/types/dashboard";
import { SectionHeader, ChartTooltip, ProgressBar } from "./ui";

interface Props { t: Theme }

// ── BUDGET SCENARIOS ──────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "starter",
    label: "Starter",
    budget: 1200,
    budgetLabel: "$1,200/mo",
    desc: "One campaign · Moore location first · Prove ROI first",
    color: "#00D4FF",
    calls: 45,
    patients: 36,
    revenue: 5400,
    roi: 4.5,
    cpa: 33,
    reviewsAdded: 8,
    rankImprovement: "Top 5",
  },
  {
    id: "recommended",
    label: "Recommended",
    budget: 2000,
    budgetLabel: "$2,000/mo",
    desc: "2 campaigns · Both locations · Full AI automation",
    color: "#00E5A0",
    calls: 82,
    patients: 66,
    revenue: 9900,
    roi: 4.95,
    cpa: 24,
    reviewsAdded: 15,
    rankImprovement: "Top 3",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    budget: 3500,
    budgetLabel: "$3,500/mo",
    desc: "Full market domination · Competitor targeting · LSA",
    color: "#A78BFA",
    calls: 156,
    patients: 125,
    revenue: 18750,
    roi: 5.36,
    cpa: 22,
    reviewsAdded: 28,
    rankImprovement: "#1 Position",
  },
];

// ── 12-MONTH PROJECTION (Recommended scenario) ────────────────────────────
const buildProjection = (multiplier: number) => [
  { month: "Apr", before: 15, after: Math.round(22 * multiplier), spend: Math.round(1200 * multiplier / 1000 * 1000) },
  { month: "May", before: 15, after: Math.round(31 * multiplier), spend: Math.round(1200 * multiplier / 1000 * 1000) },
  { month: "Jun", before: 16, after: Math.round(40 * multiplier), spend: Math.round(1300 * multiplier / 1000 * 1000) },
  { month: "Jul", before: 16, after: Math.round(50 * multiplier), spend: Math.round(1300 * multiplier / 1000 * 1000) },
  { month: "Aug", before: 17, after: Math.round(58 * multiplier), spend: Math.round(1400 * multiplier / 1000 * 1000) },
  { month: "Sep", before: 17, after: Math.round(66 * multiplier), spend: Math.round(1400 * multiplier / 1000 * 1000) },
  { month: "Oct", before: 18, after: Math.round(75 * multiplier), spend: Math.round(1500 * multiplier / 1000 * 1000) },
  { month: "Nov", before: 18, after: Math.round(82 * multiplier), spend: Math.round(1500 * multiplier / 1000 * 1000) },
  { month: "Dec", before: 19, after: Math.round(91 * multiplier), spend: Math.round(1600 * multiplier / 1000 * 1000) },
  { month: "Jan", before: 20, after: Math.round(99 * multiplier), spend: Math.round(1600 * multiplier / 1000 * 1000) },
  { month: "Feb", before: 20, after: Math.round(108 * multiplier), spend: Math.round(1700 * multiplier / 1000 * 1000) },
  { month: "Mar", before: 21, after: Math.round(118 * multiplier), spend: Math.round(1700 * multiplier / 1000 * 1000) },
];

// ── BEFORE vs AFTER SCORECARD ─────────────────────────────────────────────
const SCORECARD = [
  { label: "Google Ads Presence",  before: "None",        after: "2 campaigns live",    unit: "" },
  { label: "Monthly Calls",        before: "~20",         after: "82",                  unit: "calls" },
  { label: "New Patients/Month",   before: "~15 organic", after: "66 paid + organic",   unit: "" },
  { label: "Monthly Revenue",      before: "~$2,250",     after: "~$9,900",             unit: "" },
  { label: "Google Review Count",  before: "~180",        after: "195+ (AI responding)",unit: "" },
  { label: "Search Position",      before: "Not visible", after: "Top 3 paid slots",    unit: "" },
  { label: "Cost Per Patient",     before: "N/A",         after: "$24",                 unit: "" },
  { label: "ROI on Ad Spend",      before: "0x",          after: "4.95x",               unit: "" },
  { label: "AI Automation",        before: "None",        after: "5 agents running 24/7", unit: "" },
  { label: "Weekly Mgmt Time",     before: "0 hrs",       after: "30 min/week",         unit: "" },
];

// ── LTV MATH ──────────────────────────────────────────────────────────────
const LTV_ROWS = [
  { label: "Avg Visit Revenue",           value: "$150" },
  { label: "Avg Visits/Patient/Year",     value: "1.8x" },
  { label: "Avg Patient Retention",       value: "5 years" },
  { label: "Patient LTV (no referrals)",  value: "$1,350" },
  { label: "Avg Referrals per Patient",   value: "1.2 people" },
  { label: "Patient LTV (with referrals)", value: "$2,970" },
  { label: "Cost to Acquire (Recommended)", value: "$24" },
  { label: "ROI Per Acquired Patient",    value: "123x lifetime" },
];

export default function PredictiveTab({ t }: Props) {
  const [selectedScenario, setSelectedScenario] = useState(1); // default: recommended
  const scenario = SCENARIOS[selectedScenario];
  const multipliers = [0.6, 1, 1.75];
  const projectionData = buildProjection(multipliers[selectedScenario]);

  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* ── SCENARIO SELECTOR ── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Investment Scenarios — Choose Your Growth Speed" sub="All projections based on Oklahoma City market data + competitor analysis" t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(i)}
              style={{
                background: selectedScenario === i ? `${s.color}15` : t.card,
                border: `2px solid ${selectedScenario === i ? s.color : t.border}`,
                borderRadius: 14, padding: "20px 22px", cursor: "pointer",
                textAlign: "left", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: selectedScenario === i ? s.color : t.text, fontFamily: "'DM Serif Display', serif" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>
                  {s.budgetLabel}
                </div>
              </div>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 14 }}>{s.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  [`${s.calls} calls/mo`, t.accent],
                  [`${s.patients} new patients/mo`, t.green],
                  [`$${s.revenue.toLocaleString()} revenue`, t.green],
                  [`${s.roi}x ROI`, s.color],
                  [s.rankImprovement, t.yellow],
                ].map(([val, color], j) => (
                  <div key={j} style={{ fontSize: 12, color: color as string, fontWeight: 700 }}>
                    ✓ {val as string}
                  </div>
                ))}
              </div>
              {selectedScenario === i && (
                <div style={{ marginTop: 12, padding: "6px 12px", borderRadius: 20, background: `${s.color}22`, display: "inline-block" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>● SELECTED</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ROW 1: Projection chart + LTV math ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* 12-month patient projection */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader
            title={`New Patients / Month — ${scenario.label} Scenario`}
            sub="Before advertising (organic only) vs After Sapiens Station activation"
            t={t}
          />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="gBefore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.red}   stopOpacity={0.2} />
                  <stop offset="95%" stopColor={t.red}   stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAfter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={scenario.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={scenario.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="month" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine x="Jun" stroke={t.yellow} strokeDasharray="4 3" label={{ value: "Break-even", fill: t.yellow, fontSize: 10 }} />
              <Area type="monotone" dataKey="before" name="Without Ads (organic)" stroke={t.red}          fill="url(#gBefore)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              <Area type="monotone" dataKey="after"  name="With Sapiens Station"  stroke={scenario.color} fill="url(#gAfter)"  strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Key callouts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
            {[
              { label: "Month 1 Patients",   value: projectionData[0].after,  color: t.accent },
              { label: "Month 6 Patients",   value: projectionData[5].after,  color: scenario.color },
              { label: "Month 12 Patients",  value: projectionData[11].after, color: t.green },
            ].map((s, i) => (
              <div key={i} style={{ background: t.hover, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LTV math */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Patient Lifetime Value Math" sub="Why $24 cost per patient is a steal" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {LTV_ROWS.map((row, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "9px 0",
                borderBottom: i < LTV_ROWS.length - 1 ? `1px solid ${t.border}22` : "none",
              }}>
                <span style={{ fontSize: 11, color: t.sub }}>{row.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  color: row.label.includes("ROI") ? t.green :
                         row.label.includes("LTV") ? t.accent : t.text,
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: t.greenDim, border: `1px solid ${t.green}33` }}>
            <div style={{ fontSize: 11, color: t.sub, marginBottom: 4 }}>12-Month Cumulative Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: t.green, fontFamily: "'DM Serif Display', serif" }}>
              ${(scenario.patients * 12 * 150).toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>
              from {scenario.patients * 12} new patients at avg $150/visit
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Before vs After scorecard + Revenue bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* Scorecard */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Before vs After — Full Scorecard" sub={`Recommended scenario · $2,000/mo · ${scenario.label}`} t={t} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {["Metric", "RIGHT NOW", "AFTER 90 DAYS"].map((h, i) => (
                  <th key={h} style={{
                    padding: "8px 10px", textAlign: i === 0 ? "left" : "center",
                    fontSize: 10, color: i === 1 ? t.red : i === 2 ? t.green : t.sub,
                    fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCORECARD.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${t.border}22` }}>
                  <td style={{ padding: "9px 10px", fontSize: 11, color: t.sub, fontWeight: 600 }}>{row.label}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center", fontSize: 11, color: t.red, fontWeight: 700 }}>{row.before}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center", fontSize: 11, color: t.green, fontWeight: 700 }}>{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue comparison bar chart */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Annual Revenue Impact" sub="3 scenarios vs current trajectory" t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Current",     revenue: 27000, color: t.red },
              { name: "Starter",     revenue: 64800  },
              { name: "Recommended", revenue: 118800 },
              { name: "Aggressive",  revenue: 225000 },
            ]} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="name" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Annual Revenue"]}
                contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="revenue" name="Annual Revenue" radius={[6, 6, 0, 0]}>
                {[t.red, t.accent, t.green, t.purple].map((color, i) => (
                  <rect key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Quick ROI */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {SCENARIOS.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: selectedScenario === i ? `${s.color}15` : t.hover, border: `1px solid ${selectedScenario === i ? s.color : t.border}` }}>
                <span style={{ fontSize: 11, color: t.sub }}>{s.label} · {s.budgetLabel}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.roi}x ROI</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VISIBILITY SCORE BEFORE VS AFTER ── */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <SectionHeader title="Visibility Score — Before vs After 6 Months" sub="Across all 8 digital dimensions" t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Google Ads Presence",   before: 0,  after: 90 },
            { label: "Review Volume",         before: 12, after: 35 },
            { label: "SEO Landing Pages",     before: 15, after: 85 },
            { label: "Search Position",       before: 40, after: 88 },
          ].map((item, i) => (
            <div key={i} style={{ background: t.hover, borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 12, fontWeight: 700 }}>{item.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: t.muted }}>Now</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: t.red }}>{item.before}/100</span>
                  </div>
                  <ProgressBar value={item.before} color={t.red} t={t} height={6} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: t.muted }}>After 6mo</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: t.green }}>{item.after}/100</span>
                  </div>
                  <ProgressBar value={item.after} color={t.green} t={t} height={6} />
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: t.green }}>
                +{item.after - item.before} pts ↑
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
