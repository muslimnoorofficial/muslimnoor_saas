import type {
  Theme, TrendPoint, LocationStat, KeywordRow,
  CompetitorRow, RadarPoint, CallHour, AgentLog,
  DeviceSlice, FunnelStep, QualityScore, AgentStatus,
  AIValue, Opportunity,
} from "@/types/dashboard";

// ─── THEMES ───────────────────────────────────────────────────────────────
export const THEMES: Record<"dark" | "light", Theme> = {
  dark: {
    bg: "#07090F",
    panel: "#0D1220",
    card: "#111827",
    border: "#1C2A42",
    hover: "#14203A",
    text: "#EDF2FF",
    sub: "#7A8BAA",
    muted: "#3A4A62",
    accent: "#00D4FF",
    accentDim: "rgba(0,212,255,0.12)",
    green: "#00E5A0",
    greenDim: "rgba(0,229,160,0.12)",
    red: "#FF4060",
    redDim: "rgba(255,64,96,0.12)",
    yellow: "#FFB800",
    yellowDim: "rgba(255,184,0,0.12)",
    purple: "#A78BFA",
    purpleDim: "rgba(167,139,250,0.12)",
    grid: "#1A2540",
    tag: "#0D1F38",
  },
  light: {
    bg: "#EDF1FA",
    panel: "#FFFFFF",
    card: "#FFFFFF",
    border: "#D8E3F2",
    hover: "#F4F8FF",
    text: "#0B1628",
    sub: "#4A5A74",
    muted: "#9AA5BC",
    accent: "#006EFF",
    accentDim: "rgba(0,110,255,0.08)",
    green: "#00A86B",
    greenDim: "rgba(0,168,107,0.08)",
    red: "#E5334A",
    redDim: "rgba(229,51,74,0.08)",
    yellow: "#D97706",
    yellowDim: "rgba(217,119,6,0.08)",
    purple: "#7C3AED",
    purpleDim: "rgba(124,58,237,0.08)",
    grid: "#E4EAF5",
    tag: "#EEF4FF",
  },
};

// ─── TREND DATA ───────────────────────────────────────────────────────────
export const TREND_DATA: TrendPoint[] = [
  { d: "Mar 1",  clicks: 42,  impr: 610,  conv: 9,  spend: 189, calls: 7,  dir: 12, roi: 5.2 },
  { d: "Mar 4",  clicks: 38,  impr: 540,  conv: 7,  spend: 171, calls: 5,  dir: 9,  roi: 4.8 },
  { d: "Mar 7",  clicks: 55,  impr: 780,  conv: 13, spend: 248, calls: 11, dir: 15, roi: 5.8 },
  { d: "Mar 10", clicks: 61,  impr: 890,  conv: 15, spend: 275, calls: 13, dir: 18, roi: 6.1 },
  { d: "Mar 13", clicks: 70,  impr: 1020, conv: 18, spend: 315, calls: 16, dir: 21, roi: 6.4 },
  { d: "Mar 16", clicks: 78,  impr: 1150, conv: 21, spend: 351, calls: 19, dir: 24, roi: 6.9 },
  { d: "Mar 19", clicks: 83,  impr: 1240, conv: 23, spend: 374, calls: 21, dir: 27, roi: 7.2 },
  { d: "Mar 22", clicks: 91,  impr: 1380, conv: 26, spend: 410, calls: 24, dir: 31, roi: 7.8 },
  { d: "Mar 25", clicks: 98,  impr: 1520, conv: 29, spend: 441, calls: 27, dir: 35, roi: 8.1 },
  { d: "Mar 28", clicks: 104, impr: 1640, conv: 31, spend: 468, calls: 29, dir: 38, roi: 8.6 },
  { d: "Mar 31", clicks: 112, impr: 1780, conv: 34, spend: 504, calls: 32, dir: 42, roi: 9.1 },
];

// ─── LOCATION DATA ────────────────────────────────────────────────────────
// Moore: 4.9★ · 1,481 reviews · 2212 N Broadway Ave · (405) 285-7222
// OKC:   4.6★ · 381 reviews  · 1421 NW 122nd St    · (405) 286-2888
export const LOCATION_DATA: LocationStat[] = [
  { name: "Moore", clicks: 412, calls: 89, dir: 134, spend: 660,  revenue: 13350, patients: 71, ctr: 8.4, cpc: 4.72, qs: 8.6 },
  { name: "OKC",   clicks: 298, calls: 61, dir: 97,  spend: 540,  revenue: 9150,  patients: 49, ctr: 7.1, cpc: 6.21, qs: 7.4 },
];

// ─── KEYWORD DATA ─────────────────────────────────────────────────────────
export const KEYWORD_DATA: KeywordRow[] = [
  { kw: "urgent care moore ok",      clicks: 148, ctr: 11.2, cpc: 4.72, conv: 38, qs: 9 },
  { kw: "urgent care near me",       clicks: 124, ctr: 9.8,  cpc: 5.60, conv: 29, qs: 8 },
  { kw: "walk in clinic moore ok",   clicks: 97,  ctr: 8.4,  cpc: 4.10, conv: 22, qs: 8 },
  { kw: "urgent care open now",      clicks: 83,  ctr: 7.9,  cpc: 3.20, conv: 24, qs: 9 },
  { kw: "urgent care oklahoma city", clicks: 76,  ctr: 7.2,  cpc: 6.40, conv: 18, qs: 7 },
  { kw: "after hours urgent care",   clicks: 58,  ctr: 9.1,  cpc: 2.80, conv: 17, qs: 9 },
];

// ─── COMPETITOR DATA ──────────────────────────────────────────────────────
export const COMPETITOR_DATA: CompetitorRow[] = [
  { name: "Quick UC",  share: 28, cpc: 4.72, qs: 8.4, rank: 1.4 },
  { name: "GoHealth",  share: 34, cpc: 6.10, qs: 7.2, rank: 1.8 },
  { name: "CareNow",   share: 21, cpc: 5.80, qs: 6.9, rank: 2.1 },
  { name: "Concentra", share: 11, cpc: 5.20, qs: 6.4, rank: 2.6 },
  { name: "Others",    share: 6,  cpc: 4.90, qs: 6.1, rank: 2.9 },
];

// ─── RADAR DATA ───────────────────────────────────────────────────────────
export const RADAR_DATA: RadarPoint[] = [
  { metric: "CTR",           QuickUC: 88, GoHealth: 65, CareNow: 58 },
  { metric: "Quality Score", QuickUC: 84, GoHealth: 72, CareNow: 69 },
  { metric: "Conv Rate",     QuickUC: 79, GoHealth: 61, CareNow: 55 },
  { metric: "Ad Strength",   QuickUC: 91, GoHealth: 74, CareNow: 68 },
  { metric: "Imp Share",     QuickUC: 72, GoHealth: 85, CareNow: 62 },
  { metric: "ROI",           QuickUC: 95, GoHealth: 68, CareNow: 59 },
];

// ─── CALL DATA ────────────────────────────────────────────────────────────
export const CALL_DATA: CallHour[] = [
  { hour: "7AM",  calls: 4  }, { hour: "8AM",  calls: 7  }, { hour: "9AM",  calls: 9  },
  { hour: "10AM", calls: 8  }, { hour: "11AM", calls: 6  }, { hour: "12PM", calls: 11 },
  { hour: "1PM",  calls: 9  }, { hour: "2PM",  calls: 7  }, { hour: "3PM",  calls: 8  },
  { hour: "4PM",  calls: 12 }, { hour: "5PM",  calls: 18 }, { hour: "6PM",  calls: 21 },
  { hour: "7PM",  calls: 16 }, { hour: "8PM",  calls: 6  },
];

// ─── AGENT LOGS ───────────────────────────────────────────────────────────
export const AGENT_LOGS: AgentLog[] = [
  { time: "2 min ago",  agent: "Campaign Agent",  action: "Increased Moore bid +12% — after-hours CTR spike detected",       status: "success" },
  { time: "11 min ago", agent: "Content Agent",   action: "Generated 3 ad copy variants for flu testing campaign",            status: "success" },
  { time: "28 min ago", agent: "Review Agent",    action: "Drafted response to 5-star Google review — awaiting approval",    status: "pending" },
  { time: "45 min ago", agent: "SEO Agent",       action: "Found 8 new keyword opportunities from Search Console data",      status: "success" },
  { time: "1 hr ago",   agent: "Reporting Agent", action: "Weekly performance PDF generated + sent to client",               status: "success" },
  { time: "2 hrs ago",  agent: "Campaign Agent",  action: "Paused 4 negative search terms — saved est. $38 wasted spend",   status: "success" },
  { time: "3 hrs ago",  agent: "Content Agent",   action: "Published blog: 'When to Visit Urgent Care vs ER in Oklahoma'",   status: "success" },
  { time: "4 hrs ago",  agent: "SEO Agent",       action: "Moore location page climbed to position 2.1 for target keyword",  status: "success" },
  { time: "5 hrs ago",  agent: "Review Agent",    action: "HIPAA-safe response posted to OKC 4-star review",                 status: "success" },
  { time: "6 hrs ago",  agent: "Campaign Agent",  action: "Budget pacing alert: OKC at 94% daily spend by 3PM — adjusted",  status: "warning" },
];

// ─── DEVICE DATA ──────────────────────────────────────────────────────────
export const DEVICE_DATA: DeviceSlice[] = [
  { name: "Mobile",  value: 64, color: "#00D4FF" },
  { name: "Desktop", value: 28, color: "#00E5A0" },
  { name: "Tablet",  value: 8,  color: "#A78BFA" },
];

// ─── FUNNEL DATA ──────────────────────────────────────────────────────────
export const FUNNEL_DATA: FunnelStep[] = [
  { stage: "Impressions", value: 14280, pct: 100  },
  { stage: "Clicks",      value: 897,   pct: 6.3  },
  { stage: "Page Views",  value: 812,   pct: 5.7  },
  { stage: "Calls",       value: 188,   pct: 1.3  },
  { stage: "Visits",      value: 150,   pct: 1.05 },
];

// ─── QUALITY SCORES ───────────────────────────────────────────────────────
export const QS_DATA: QualityScore[] = [
  { label: "Expected CTR",      score: 9,   max: 10 },
  { label: "Ad Relevance",      score: 8,   max: 10 },
  { label: "Landing Page Exp",  score: 9,   max: 10 },
  { label: "Overall QS",        score: 8.4, max: 10 },
];

// ─── AGENT STATUS ─────────────────────────────────────────────────────────
export const AGENT_STATUS: AgentStatus[] = [
  { name: "Campaign Agent",  desc: "Monitoring bids + budget pacing",    status: "active",  runs: 142, saved: "$284"   },
  { name: "Content Agent",   desc: "Blog posts + ad copy generation",    status: "active",  runs: 38,  saved: "$1,900" },
  { name: "Review Agent",    desc: "HIPAA-safe review responses",        status: "pending", runs: 24,  saved: "$480"   },
  { name: "SEO Agent",       desc: "Search Console + ranking monitor",   status: "active",  runs: 67,  saved: "$670"   },
  { name: "Reporting Agent", desc: "Weekly PDF reports to client",       status: "active",  runs: 12,  saved: "$600"   },
];

// ─── AI VALUE ─────────────────────────────────────────────────────────────
export const AI_VALUE: AIValue[] = [
  { label: "Hours Saved",         value: "94 hrs",  color: "#00D4FF", sub: "vs manual agency"    },
  { label: "Blog Posts Written",  value: "12",      color: "#00E5A0", sub: "auto-published"       },
  { label: "Reviews Responded",   value: "24",      color: "#A78BFA", sub: "100% response rate"  },
  { label: "Wasted Spend Saved",  value: "$284",    color: "#FFB800", sub: "negative KWs added"  },
  { label: "Total AI Value",      value: "$3,930",  color: "#00E5A0", sub: "estimated monthly"   },
];

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────
export const OPPORTUNITIES: Opportunity[] = [
  { title: "GoHealth closes at 6PM",     action: "Activate +25% bid boost 6–8PM",   impact: "Est. +18 calls/mo",    color: "#00E5A0" },
  { title: "CareNow weak on mobile",     action: "Prioritize mobile ad formats",     impact: "Est. +12% CTR gain",   color: "#00D4FF" },
  { title: "After-hours gap in Moore",   action: "Add Moore after-hours ad group",   impact: "Est. +9 patients/mo",  color: "#FFB800" },
];
