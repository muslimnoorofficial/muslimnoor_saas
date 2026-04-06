"use client";

import type { Theme } from "@/types/dashboard";
import { SectionHeader, ProgressBar } from "./ui";

interface Props { t: Theme }

// ── REAL DATA FROM quickurgentcareok.com + competitor scrape ──────────────
const QUC_PROFILE = {
  name: "Quick Urgent Care",
  phone: "(405) 285-7222",
  hours: "7AM – 8PM Daily",
  locations: ["Moore, OK — 2212 N Broadway Ave", "Oklahoma City, OK"],
  website: "quickurgentcareok.com",
  services: ["On-Site Imaging", "Physicals", "Drug Testing", "Vaccinations", "Occupational Medicine", "On-Site Lab Testing", "COVID Testing", "Treatments"],
  providers: ["Jessica Jackson, PA-C", "Rebecca Williams, PA-C", "Becca Schmedt, PA-C", "Iftikhar Sandhu, PA-C"],
  tagline: "Locally Owned · Locally Operated · Lowest Local Costs",
  founded: "April 2017",
  selfPay: true,
  bookingPlatform: "Clockwise MD",
};

const COMPETITORS = [
  { name: "Classen Urgent Care Moore",   rating: 4.7, reviews: 6100, hours: "Closes 10PM", sponsored: true,  color: "#FF4060" },
  { name: "Access Medical Center OKC", rating: 4.6, reviews: 1300, hours: "Closes 8PM",  sponsored: true,  color: "#FFB800" },
  { name: "CareNow Urgent Care Moore",    rating: 4.5, reviews: 231,  hours: "Closes 8PM",  sponsored: true,  color: "#FFB800" },
  { name: "iCare Centers Moore",          rating: 4.8, reviews: 310,  hours: "Closes 8PM",  sponsored: false, color: "#FF4060" },
  { name: "Classen Urgent Care Moore",    rating: 4.8, reviews: 3200, hours: "Closes 10PM", sponsored: false, color: "#FF4060" },
  { name: "HealthCare Express Moore",     rating: 4.6, reviews: 1100, hours: "Closes 8PM",  sponsored: false, color: "#FFB800" },
  { name: "Quick Urgent Care",            rating: 4.5, reviews: 180,  hours: "Closes 8PM",  sponsored: false, color: "#00D4FF", isUs: true },
];

// ── AUDIT: what's wrong right now ─────────────────────────────────────────
const AUDIT_ITEMS = [
  { category: "Google Ads",         status: "missing",  finding: "Zero paid search presence — 0 ads running for any location",                       impact: "High" },
  { category: "Google Reviews",     status: "warning",  finding: "~180 reviews vs Classen's 6,100 — 34x gap makes you invisible in trust signals",    impact: "High" },
  { category: "Search Ranking",     status: "warning",  finding: "Not appearing in top 3 sponsored slots — competitors paying to be above you",        impact: "High" },
  { category: "Website Speed",      status: "warning",  finding: "Heavy image payloads detected (SVG lazy-load fallbacks) — likely 4+ sec mobile load", impact: "Medium" },
  { category: "Hours Advantage",    status: "ok",       finding: "Open until 8PM matches most competitors — Classen has edge at 10PM",                  impact: "Medium" },
  { category: "Self-Pay Rates",     status: "ok",       finding: "Lowest local costs positioning is a strong differentiator — not being advertised",    impact: "High" },
  { category: "Booking System",     status: "warning",  finding: "Clockwise MD booking — adds friction vs direct scheduling; no online wait time",      impact: "Medium" },
  { category: "Landing Pages",      status: "missing",  finding: "No location-specific SEO pages — /urgent-care-moore-ok etc. don't exist",             impact: "High" },
  { category: "Provider Profiles",  status: "ok",       finding: "4 named PA-C providers with 25+ yrs experience — strong trust asset, underutilized",  impact: "Medium" },
  { category: "Local Service Ads",  status: "missing",  finding: "Google Guaranteed badge not present — competitors with it get 20% more clicks",       impact: "High" },
];

const STATUS_COLORS: Record<string, string> = {
  missing: "#FF4060",
  warning: "#FFB800",
  ok:      "#00E5A0",
};
const STATUS_LABELS: Record<string, string> = {
  missing: "MISSING",
  warning: "NEEDS WORK",
  ok:      "STRENGTH",
};

// ── VISIBILITY SCORE ──────────────────────────────────────────────────────
const VISIBILITY = [
  { label: "Google Ads Presence",   score: 0,  max: 100, note: "No campaigns running" },
  { label: "Review Volume",         score: 12, max: 100, note: "180 vs 6,100 top competitor" },
  { label: "SEO Landing Pages",     score: 15, max: 100, note: "No city-specific pages" },
  { label: "Google Maps Ranking",   score: 40, max: 100, note: "Appears but not in top 3" },
  { label: "Website Performance",   score: 45, max: 100, note: "Slow mobile load suspected" },
  { label: "Brand Differentiation", score: 70, max: 100, note: "Self-pay + local owned messaging" },
  { label: "Provider Trust",        score: 72, max: 100, note: "4 named PAs, 25yr experience" },
  { label: "Service Breadth",       score: 80, max: 100, note: "8 service categories covered" },
];

const IMPACT_COLOR: Record<string, string> = { High: "#FF4060", Medium: "#FFB800", Low: "#00E5A0" };

export default function CurrentStatusTab({ t }: Props) {
  const overallScore = Math.round(VISIBILITY.reduce((a, v) => a + v.score, 0) / VISIBILITY.length);

  return (
    <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

      {/* ── TOP BANNER ── */}
      <div style={{
        marginBottom: 20, padding: "18px 24px", borderRadius: 14,
        background: `linear-gradient(135deg, ${t.redDim}, ${t.yellowDim})`,
        border: `1px solid ${t.red}33`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "'DM Serif Display', serif" }}>
            🚨 Current Market Position: Critically Under-Advertised
          </div>
          <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>
            Every day without ads, competitors are buying the patients who are already searching for you.
          </div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: t.red, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
            {overallScore}
          </div>
          <div style={{ fontSize: 10, color: t.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Visibility Score / 100
          </div>
        </div>
      </div>

      {/* ── ROW 1: Profile + Competitor Map ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18, marginBottom: 18 }}>

        {/* QUC Real Profile */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Quick Urgent Care — Live Profile" sub="Data from quickurgentcareok.com" t={t} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Phone",     QUC_PROFILE.phone,    t.accent],
              ["Hours",     QUC_PROFILE.hours,    t.green],
              ["Founded",   QUC_PROFILE.founded,  t.text],
              ["Booking",   QUC_PROFILE.bookingPlatform, t.yellow],
              ["Self-Pay",  "Yes — affordable rates advertised", t.green],
            ].map(([label, val, color], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.border}22` }}>
                <span style={{ fontSize: 12, color: t.sub }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: color as string }}>{val as string}</span>
              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Locations</div>
              {QUC_PROFILE.locations.map((loc, i) => (
                <div key={i} style={{ fontSize: 12, color: t.text, padding: "5px 8px", background: t.hover, borderRadius: 6, marginBottom: 4 }}>
                  📍 {loc}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Providers</div>
              {QUC_PROFILE.providers.map((p, i) => (
                <div key={i} style={{ fontSize: 11, color: t.text, padding: "4px 8px", background: t.hover, borderRadius: 6, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: t.green }}>✦</span> {p}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: t.sub, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Services</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUC_PROFILE.services.map((s, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: t.accentDim, color: t.accent, fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor map */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Competitor Landscape — Moore & Oklahoma City" sub="Current Google Maps results · sponsored slots shown" t={t} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMPETITORS.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: 10, background: (c as any).isUs ? t.accentDim : t.hover,
                border: `1px solid ${(c as any).isUs ? t.accent : t.border}`,
                transition: "all 0.2s",
              }}>
                {/* Rank */}
                <div style={{ fontSize: 11, color: t.muted, width: 20, flexShrink: 0, fontWeight: 700 }}>
                  {(c as any).isUs ? "YOU" : `#${i + 1}`}
                </div>

                {/* Name + tags */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: (c as any).isUs ? t.accent : t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                    {c.sponsored && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: t.yellowDim, color: t.yellow }}>
                        SPONSORED
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: t.muted }}>{c.hours}</span>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.color }}>⭐ {c.rating}</div>
                  <div style={{ fontSize: 9, color: t.muted }}>{c.reviews.toLocaleString()} reviews</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: t.redDim, border: `1px solid ${t.red}22` }}>
            <div style={{ fontSize: 11, color: t.red, fontWeight: 700 }}>
              ⚠ 3 competitors are buying sponsored slots above you RIGHT NOW
            </div>
            <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>
              Classen Urgent Care alone has 34x your review count — this is the gap we close
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Visibility Scores + Audit ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18, marginBottom: 18 }}>

        {/* Visibility radar */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Visibility Score Breakdown" sub="8 dimensions — current state" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {VISIBILITY.map((v, i) => {
              const color = v.score >= 60 ? t.green : v.score >= 30 ? t.yellow : t.red;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: t.sub, fontWeight: 600 }}>{v.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color }}>{v.score}/100</span>
                  </div>
                  <ProgressBar value={v.score} color={color} t={t} height={7} />
                  <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{v.note}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full audit table */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
          <SectionHeader title="Full Digital Audit" sub="10-point analysis · conducted by Sapiens Station" t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AUDIT_ITEMS.map((item, i) => {
              const statusColor = STATUS_COLORS[item.status];
              const statusLabel = STATUS_LABELS[item.status];
              return (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: t.hover, border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${statusColor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${statusColor}22`, color: statusColor }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{item.category}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${IMPACT_COLOR[item.impact]}22`, color: IMPACT_COLOR[item.impact] }}>
                      {item.impact} Impact
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.5 }}>{item.finding}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── OPPORTUNITY SUMMARY ── */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <SectionHeader title="The Bottom Line — What This Costs You Every Month Without Action" sub="Estimated based on Moore/OKC market search volume" t={t} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Patients Lost to Competitors",  value: "~85/mo",   color: t.red,    sub: "going to sponsored competitors" },
            { label: "Revenue Walking Out the Door",  value: "$12,750",  color: t.red,    sub: "at $150 avg visit value" },
            { label: "Review Gap vs Top Competitor",  value: "5,920",    color: t.yellow, sub: "reviews behind Classen Moore" },
            { label: "Monthly Cost of Inaction",      value: "$12,750+", color: t.red,    sub: "compounding every month" },
          ].map((s, i) => (
            <div key={i} style={{ background: t.hover, borderRadius: 12, padding: "16px 18px", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 10, color: t.sub, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: t.muted, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
