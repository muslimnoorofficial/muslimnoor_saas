"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Theme } from "@/types/dashboard";
import { TooltipProps } from "recharts";

// ─── AnimatedNumber ────────────────────────────────────────────────────────
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}
export function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let current = 0;
    const end = value;
    const duration = 1800;
    const stepMs = 16;
    const increment = end / (duration / stepMs);
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, stepMs);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

// ─── StatCard ──────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  delta: number;
  t: Theme;
  color?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}
export function StatCard({ label, value, sub, delta, t, color, prefix = "", suffix = "", decimals = 0 }: StatCardProps) {
  const isPos = delta >= 0;
  const style: CSSProperties = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 14,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    transition: "all 0.2s",
  };
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color: t.sub, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? t.text, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
          background: isPos ? t.greenDim : t.redDim,
          color: isPos ? t.green : t.red,
        }}>
          {isPos ? "▲" : "▼"} {Math.abs(delta)}%
        </span>
        <span style={{ fontSize: 11, color: t.muted }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  sub?: string;
  t: Theme;
}
export function SectionHeader({ title, sub, t }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif" }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── ChartTooltip ──────────────────────────────────────────────────────────
interface ChartTooltipProps extends TooltipProps<number, string> {
  t: Theme;
}
export function ChartTooltip({ active, payload, label, t }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: t.sub, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <span style={{ color: t.text, fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LiveDot ───────────────────────────────────────────────────────────────
interface LiveDotProps {
  color: string;
  size?: number;
}
export function LiveDot({ color, size = 7 }: LiveDotProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color,
      animation: "pulse 2s infinite",
    }} />
  );
}

// ─── ProgressBar ───────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max?: number;
  color: string;
  t: Theme;
  height?: number;
}
export function ProgressBar({ value, max = 100, color, t, height = 7 }: ProgressBarProps) {
  return (
    <div style={{ height, background: t.grid, borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        width: `${(value / max) * 100}%`,
        height: "100%",
        background: color,
        borderRadius: 4,
        transition: "width 1.2s ease",
      }} />
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color: string;
  bgColor: string;
}
export function Badge({ children, color, bgColor }: BadgeProps) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 10px",
      borderRadius: 20, background: bgColor, color,
    }}>
      {children}
    </span>
  );
}
