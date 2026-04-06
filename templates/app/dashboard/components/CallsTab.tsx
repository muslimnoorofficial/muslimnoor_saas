"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { Theme } from "@/types/dashboard";
import { CALL_DATA } from "@/lib/data";
import { SectionHeader, ChartTooltip, ProgressBar } from "./ui";

interface Props { t: Theme }

const CALL_SOURCES = [
  { label: "Calls from Google Ads",     value: 188, total: 312 },
  { label: "Calls from Organic Search", value: 87,  total: 312 },
  { label: "Calls from Google Maps",    value: 37,  total: 312 },
];

const CALL_METRICS: [string, string][] = [
  ["Avg Call Duration", "3m 24s"],
  ["Answer Rate",       "94%"],
  ["Cost Per Call",     "$6.54"],
  ["Calls → Visits",    "79.8%"],
];

const SOURCE_COLORS = ["#00D4FF", "#00E5A0", "#FFB800"];
const METRIC_COLORS = ["#00D4FF", "#00E5A0", "#EDF2FF", "#A78BFA"];

export default function CallsTab({ t }: Props) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Hourly volume */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Call Volume by Hour" sub="When patients call — all locations" t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CALL_DATA}>
              <defs>
                <linearGradient id="gCall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="hour" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
              <Area type="monotone" dataKey="calls" name="Calls" stroke={t.green} fill="url(#gCall)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: t.greenDim, border: `1px solid ${t.green}22` }}>
            <div style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>🔥 Peak: 5PM–7PM — +25% bid boost active</div>
            <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>After-hours drives 42% of total call volume</div>
          </div>
        </div>

        {/* Attribution + metrics */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Call Attribution" sub="Source breakdown this month" t={t} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            {CALL_SOURCES.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.sub }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: SOURCE_COLORS[i] }}>
                    {s.value}{" "}
                    <span style={{ fontSize: 10, color: t.muted }}>({Math.round((s.value / s.total) * 100)}%)</span>
                  </span>
                </div>
                <ProgressBar value={(s.value / s.total) * 100} color={SOURCE_COLORS[i]} t={t} height={8} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CALL_METRICS.map(([label, value], i) => (
              <div key={i} style={{ background: t.grid, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: t.sub, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: METRIC_COLORS[i], fontFamily: "'DM Serif Display', serif" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
