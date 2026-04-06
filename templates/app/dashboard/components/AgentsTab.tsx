"use client";

import type { Theme } from "@/types/dashboard";
import { AGENT_LOGS, AGENT_STATUS, AI_VALUE } from "@/lib/data";
import { SectionHeader, LiveDot } from "./ui";

interface Props { t: Theme }

const STATUS_COLOR = { active: "#00E5A0", pending: "#FFB800", warning: "#FF4060" } as const;

export default function AgentsTab({ t }: Props) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

        {/* Agent status */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="AI Agent Status" sub="Sapiens Station swarm — live" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AGENT_STATUS.map((agent, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", background: t.hover,
                borderRadius: 10, border: `1px solid ${t.border}`,
              }}>
                <LiveDot color={agent.status === "active" ? t.green : t.yellow} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: t.sub, marginTop: 1 }}>{agent.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>{agent.saved} saved</div>
                  <div style={{ fontSize: 10, color: t.muted }}>{agent.runs} runs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionHeader title="Agent Activity Log" sub="Real-time automation feed" t={t} />
            <LiveDot color={t.green} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
            {AGENT_LOGS.map((log, i) => {
              const borderColor = STATUS_COLOR[log.status];
              const tagColor    = log.status === "success" ? t.green : log.status === "pending" ? t.yellow : t.red;
              const tagBg       = log.status === "success" ? t.greenDim : log.status === "pending" ? t.yellowDim : t.redDim;
              return (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: t.hover, border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: tagColor, background: tagBg, padding: "1px 7px", borderRadius: 10 }}>
                      {log.agent}
                    </span>
                    <span style={{ fontSize: 10, color: t.muted }}>{log.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.5 }}>{log.action}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI value summary */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
        <SectionHeader title="AI Automation Value This Month" sub="Estimated labor hours saved + revenue impact" t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {AI_VALUE.map((s, i) => (
            <div key={i} style={{ background: t.hover, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 10, color: t.sub, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: t.muted, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
