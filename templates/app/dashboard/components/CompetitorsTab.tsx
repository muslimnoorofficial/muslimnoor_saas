"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { Theme } from "@/types/dashboard";
import { RADAR_DATA, COMPETITOR_DATA, OPPORTUNITIES } from "@/lib/data";
import { SectionHeader } from "./ui";

interface Props { t: Theme }

const COMP_COLORS = ["#00D4FF", "#FF4060", "#FFB800", "#A78BFA", "#3A4A62"];

export default function CompetitorsTab({ t }: Props) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* Radar */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Competitive Performance Radar" sub="Quick UC vs GoHealth vs CareNow" t={t} />
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke={t.grid} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: t.sub, fontSize: 11 }} />
              <Radar name="Quick UC" dataKey="QuickUC" stroke={t.accent} fill={t.accent} fillOpacity={0.18} strokeWidth={2} />
              <Radar name="GoHealth" dataKey="GoHealth" stroke={t.red}    fill={t.red}    fillOpacity={0.1}  strokeWidth={1.5} />
              <Radar name="CareNow"  dataKey="CareNow"  stroke={t.yellow} fill={t.yellow} fillOpacity={0.1}  strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Market share */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Search Impression Share" sub="Oklahoma urgent care market" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMPETITOR_DATA.map((c, i) => {
              const isUs = i === 0;
              return (
                <div key={i} style={{
                  padding: isUs ? "12px 14px" : "8px 14px",
                  borderRadius: 10,
                  border: `1px solid ${isUs ? t.accent : t.border}`,
                  background: isUs ? t.accentDim : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: isUs ? 800 : 600, color: isUs ? t.accent : t.text }}>
                      {c.name}{isUs ? " ← YOU" : ""}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COMP_COLORS[i] }}>{c.share}%</span>
                  </div>
                  <div style={{ height: 6, background: t.grid, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: `${c.share}%`, height: "100%", background: COMP_COLORS[i], borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 10, color: t.muted }}>CPC: <span style={{ color: t.text, fontWeight: 700 }}>${c.cpc}</span></span>
                    <span style={{ fontSize: 10, color: t.muted }}>QS: <span style={{ color: t.text, fontWeight: 700 }}>{c.qs}</span></span>
                    <span style={{ fontSize: 10, color: t.muted }}>Rank: <span style={{ color: t.text, fontWeight: 700 }}>{c.rank}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
        <SectionHeader title="Competitive Opportunities — AI Identified" sub="Campaign Agent analysis · updated today" t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {OPPORTUNITIES.map((o, i) => (
            <div key={i} style={{
              background: t.hover, borderRadius: 12, padding: 16,
              border: `1px solid ${o.color}33`,
              borderLeft: `3px solid ${o.color}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>🎯 {o.title}</div>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 10 }}>{o.action}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: o.color }}>{o.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
