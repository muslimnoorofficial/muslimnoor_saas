"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { Theme } from "@/types/dashboard";
import { LOCATION_DATA, TREND_DATA } from "@/lib/data";
import { SectionHeader, ChartTooltip } from "./ui";

interface Props { t: Theme }

export default function CampaignsTab({ t }: Props) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* Per-location scorecards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
        {LOCATION_DATA.map((loc, i) => {
          const roi = (loc.revenue / loc.spend).toFixed(1);
          const rows: [string, string | number, string][] = [
            ["Spend",         `$${loc.spend}`,               t.accent],
            ["Revenue",       `$${loc.revenue.toLocaleString()}`, t.green],
            ["Clicks",         loc.clicks,                   t.text],
            ["Calls",          loc.calls,                    t.purple],
            ["Patients",       loc.patients,                 t.text],
            ["CTR",           `${loc.ctr}%`,                 t.yellow],
            ["CPC",           `$${loc.cpc}`,                 t.text],
            ["Quality Score", `${loc.qs}/10`,                t.green],
          ];
          return (
            <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif" }}>{loc.name}</div>
                  <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>Search · Urgent Care · {loc.name}</div>
                </div>
                <div style={{
                  background: t.greenDim, border: `1px solid ${t.green}33`,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: 10, fontWeight: 700, color: t.green,
                }}>
                  ● ACTIVE
                </div>
              </div>

              {rows.map(([label, val, color], j) => (
                <div key={j} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: j < rows.length - 1 ? `1px solid ${t.border}22` : "none",
                }}>
                  <span style={{ color: t.sub, fontSize: 12 }}>{label}</span>
                  <span style={{ color, fontWeight: 700, fontSize: 12 }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: t.accentDim }}>
                <div style={{ fontSize: 11, color: t.sub }}>ROI</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.accent, fontFamily: "'DM Serif Display', serif" }}>
                  {roi}x
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impressions vs Clicks bar chart */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
        <SectionHeader title="Impressions vs Clicks" sub="All campaigns — March 2026" t={t} />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="d" tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: t.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={(props) => <ChartTooltip {...props} t={t} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="impr"   name="Impressions" fill={t.accent} fillOpacity={0.4} stroke={t.accent} strokeWidth={1} radius={[4, 4, 0, 0]} />
            <Bar dataKey="clicks" name="Clicks"      fill={t.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
