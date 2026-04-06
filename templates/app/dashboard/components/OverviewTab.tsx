"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import type { Theme } from "@/types/dashboard";
import { TREND_DATA, LOCATION_DATA, KEYWORD_DATA, FUNNEL_DATA, QS_DATA, DEVICE_DATA } from "@/lib/data";
import { SectionHeader, ChartTooltip, ProgressBar } from "./ui";

interface Props { t: Theme }

const FUNNEL_COLORS = ["#00D4FF", "#3B9EFF", "#A78BFA", "#00E5A0", "#00FFB2"];

export default function OverviewTab({ t }: Props) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* Row 1 — Trend + Device */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* Spend vs ROI */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Ad Spend vs ROI Trend" sub="Daily performance — March 2026" t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRoi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={t.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="d" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="spend" name="Spend ($)" stroke={t.accent} fill="url(#gSpend)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="roi"   name="ROI (x)"   stroke={t.green} fill="url(#gRoi)"   strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Split */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Device Split" sub="Click source breakdown" t={t} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart width={170} height={170}>
              <Pie data={DEVICE_DATA} cx={82} cy={82} innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value">
                {DEVICE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {DEVICE_DATA.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <span style={{ color: t.sub, fontSize: 12 }}>{d.name}</span>
                </div>
                <span style={{ color: t.text, fontWeight: 700 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — Funnel + Location Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18, marginBottom: 18 }}>

        {/* Funnel */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Conversion Funnel" sub="Impressions → Patients" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FUNNEL_DATA.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: t.sub, fontSize: 11, fontWeight: 600 }}>{s.stage}</span>
                  <span style={{ color: t.text, fontWeight: 800, fontSize: 12 }}>
                    {s.value.toLocaleString()}{" "}
                    <span style={{ color: t.muted, fontSize: 10 }}>({s.pct}%)</span>
                  </span>
                </div>
                <ProgressBar value={s.pct} max={100} color={FUNNEL_COLORS[i]} t={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Location bars */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Location Performance" sub="Calls · Patients · Directions per clinic" t={t} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={LOCATION_DATA} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="name" tick={{ fill: t.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="calls"    name="Calls"      fill={t.accent}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="patients" name="Patients"   fill={t.green}   radius={[4, 4, 0, 0]} />
              <Bar dataKey="dir"      name="Directions" fill={t.purple}  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — QS + Line Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, marginBottom: 18 }}>

        {/* Quality Scores */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Ad Quality Score" sub="Google auction performance" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {QS_DATA.map((s, i) => {
              const pct = (s.score / s.max) * 100;
              const color = pct >= 80 ? t.green : pct >= 60 ? t.yellow : t.red;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: t.sub }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{s.score}/10</span>
                  </div>
                  <ProgressBar value={pct} color={color} t={t} height={8} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: t.greenDim, border: `1px solid ${t.green}22` }}>
            <div style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>✓ Paying 18% less per click than competitors</div>
          </div>
        </div>

        {/* Clicks + Conversions Line */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Clicks & Conversions Trend" sub="Daily — March 2026" t={t} />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="d" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="clicks" name="Clicks"      stroke={t.accent} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="conv"   name="Conversions" stroke={t.green}  strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="calls"  name="Calls"       stroke={t.purple} strokeWidth={2}   dot={false} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keyword Table */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
        <SectionHeader title="Top Performing Keywords" sub="Sorted by conversions — this month" t={t} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              {["Keyword", "Clicks", "CTR", "CPC", "Conversions", "Quality Score"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: t.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KEYWORD_DATA.map((k, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${t.border}22`, transition: "background 0.15s", cursor: "default" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: t.text, fontSize: 12 }}>{k.kw}</td>
                <td style={{ padding: "10px 12px", color: t.accent, fontWeight: 700 }}>{k.clicks}</td>
                <td style={{ padding: "10px 12px", color: t.green,  fontWeight: 700 }}>{k.ctr}%</td>
                <td style={{ padding: "10px 12px", color: t.text }}>${k.cpc}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ background: t.greenDim, color: t.green, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {k.conv}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: t.grid, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${k.qs * 10}%`, height: "100%", background: k.qs >= 9 ? t.green : t.yellow, borderRadius: 3 }} />
                    </div>
                    <span style={{ color: t.text, fontWeight: 700, fontSize: 12 }}>{k.qs}/10</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
