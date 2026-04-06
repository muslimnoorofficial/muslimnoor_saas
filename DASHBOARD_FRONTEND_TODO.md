# 🎨 Muslim Noor Admin Dashboard — Frontend Development Plan

> **Status**: 🚀 Ready to Build | **Priority**: High | **Est. Duration**: 3-4 days of full-time development

---

## 📋 Project Overview

### Goal
Build a modern, animated admin dashboard for mosque admins to manage donations, view analytics, monitor members, and oversee mosque operations.

### Tech Stack
- **Framework**: Next.js 16.1.6 (React 19)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **UI Components**: shadcn/ui (custom built)
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack)
- **Icons**: Lucide React

### Design Principles
- ✨ **Glassmorphism cards** with backdrop blur
- 🎬 **Smooth animations**: fade-up on scroll, hover lifts, floating icons
- 📱 **Fully responsive**: Mobile, tablet, desktop
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🎯 **Performance**: Optimized images, lazy loading, code splitting

---

## 🎯 Phase 1: Core Pages & Layout (Week 1)

### Layout Structure Pages

#### 1. **Navigation & Header Components**
- [ ] **Top Header Bar**
  - Logo + Brand
  - Search functionality
  - User profile dropdown (with avatar)
  - **Logout button** ← Missing!
  - Notification bell (future: real-time)
  
- [ ] **Sidebar Navigation**
  - Collapsible menu (mobile: hamburger)
  - Dashboard link
  - Donations link
  - Members link
  - Events link
  - Settings link
  - Active state indicators
  - Icons from Lucide React

- [ ] **Breadcrumbs**
  - Dynamic route tracking
  - Navigation history

#### 2. **Dashboard Landing Page** (`/dashboard`)
- [ ] Hero section with key metrics
- [ ] Welcome message with user's mosque name
- [ ] **4 Key Metric Cards** (glassmorphism):
  - Total Donations (MTD)
  - Unique Donors (All-time)
  - Active Subscriptions
  - Members Count
  
- [ ] **Charts Section**:
  - Donations trend (line chart - last 30 days)
  - Donation breakdown by purpose (pie chart)
  - Monthly recurring vs one-time (bar chart)
  
- [ ] **Recent Donations Table**
  - Last 5 donations
  - Columns: Donor, Amount, Purpose, Date, Status
  - Status badges (completed, pending)
  
- [ ] **Quick Actions** (floating action buttons)
  - View all donations
  - Invite member
  - Create event

---

## 💰 Phase 2: Donations Module (Week 1-2)

### Pages

#### 3. **Donations Hub Page** (`/dashboard/donations`)
- [ ] **Filters Bar**:
  - Status filter (completed, pending, failed)
  - Purpose filter (general, zakat, sadaqah, ramadan, building_fund)
  - Type filter (one_time, monthly)
  - Date range picker
  - Search by donor name/email

- [ ] **Donations Table** (with pagination)
  - Columns:
    - Donor name (avatar + name)
    - Email
    - Amount (formatted USD)
    - Purpose (badge)
    - Type (one_time / monthly - with icon)
    - Date
    - Status (badge with colors)
    - Action menu (view receipt, resend email, cancel subscription)
  
  - Sorting: amount, date, status
  - Pagination: 25 per page
  - Bulk actions: Mark complete, export CSV

- [ ] **Donation Detail Modal** (click row)
  - Full donation info
  - Donor contact
  - Payment method
  - Stripe transaction link
  - Receipt PDF (if sent)
  - Notes section
  - Action buttons: Resend receipt, Cancel subscription

- [ ] **Analytics Dashboard**
  - **Summary Cards**:
    - MTD Total (with trend ↑↓)
    - # Unique Donors
    - # Active Monthly Subscriptions
    - Avg Donation Amount
  
  - **Charts**:
    - Donations over time (30-day trend)
    - Purpose breakdown (pie)
    - Monthly vs One-time (stacked bar)
    - Top donors (leaderboard)
    - Donation method distribution

#### 4. **Create/Test Donation Page** (`/dashboard/donations/test`)
- [ ] Form to send test donation
  - Amount input
  - Purpose select
  - Donor name/email (pre-filled for logged-in user)
  - Submit button (calls API)
  
- [ ] **Real-time simulation**:
  - Shows: "Processing payment..."
  - Auto-completes after 2 seconds
  - Shows success with donation ID
  - Immediately available in donations table
  
- [ ] **Test results display**:
  - Donation appears in list
  - Correct amount & purpose
  - Status shows as "completed"

---

## 👥 Phase 3: Members & Community (Week 2)

### Pages

#### 5. **Members List Page** (`/dashboard/members`)
- [ ] **Members Table**
  - Columns:
    - Avatar + name
    - Email
    - Role (member, admin)
    - Status (active, inactive)
    - Join date
    - Last seen (if tracked)
    - Actions menu
  
  - Filters: Role, status, join date
  - Search by name/email
  - Pagination

- [ ] **Member Detail Modal**
  - Full profile
  - Donation history (summary)
  - Events attended
  - Status & role management
  - Remove member button

#### 6. **Invite Members Page** (`/dashboard/members/invite`)
- [ ] Bulk invite form
  - Email input (textarea for multiple)
  - Role selection
  - Custom message
  - Send button
  
- [ ] Invite history table
  - Email, sent date, status (accepted/pending)
  - Resend invite button

---

## 📅 Phase 4: Events & Announcements (Week 2-3)

### Pages

#### 7. **Events Page** (`/dashboard/events`)
- [ ] **Events Calendar**
  - Month view
  - Event cards on dates
  - Click to see details
  
- [ ] **Events List**
  - Columns: Title, date, location, attendees, status
  - Filters: Upcoming, past, by category
  
- [ ] **Create Event Modal**
  - Title, description
  - Date/time picker
  - Location
  - Visibility (public/members only)
  - Image upload
  - Submit

- [ ] **Event Detail Page**
  - Full details
  - Attendees list
  - Chat/comments
  - Share options

#### 8. **Announcements Page** (`/dashboard/announcements`)
- [ ] **Announcements List**
  - Title, preview, date
  - Filters: Published, draft
  - Sort by date
  
- [ ] **Create Announcement Form**
  - Title, content (rich editor)
  - Featured image
  - Publish/schedule button
  - Draft save
  
- [ ] **Announcement Detail**
  - Full content
  - View counts
  - Edit/delete

---

## ⚙️ Phase 5: Settings & Admin (Week 3)

### Pages

#### 9. **Settings Page** (`/dashboard/settings`)
- [ ] **Mosque Settings**
  - Name, slug (read-only)
  - City, state, timezone
  - Prayer calculation method
  - Madhab selection
  - Save button

- [ ] **Banking Settings**
  - Stripe connection status
  - Account details (masked)
  - Payout schedule
  - Connected accounts

- [ ] **Feature Flags**
  - Donations enabled/disabled (toggle)
  - Events enabled/disabled (toggle)
  - Announcements enabled/disabled (toggle)
  - Prayer times enabled/disabled (toggle)
  - Reminders enabled/disabled (toggle)

#### 10. **User Profile Page** (`/dashboard/profile`)
- [ ] Display logged-in user info
  - Name, email, avatar
  - Edit profile form
  - Change password form
  - **Logout button** (prominent)
  - Delete account (admin only)

#### 11. **Mosque Admins Page** (`/dashboard/admins`)
- [ ] List of mosque admins
  - Add new admin
  - Remove admin
  - Transfer admin rights

---

## 🎨 Design Components (Reusable)

### Cards
- [ ] `MetricCard` - Shows number + label + trend
- [ ] `GlassmorphismCard` - Backdrop blur container
- [ ] `StatCard` - Icon + stat + description
- [ ] `DonationCard` - Donation summary card

### Tables
- [ ] `DataTable` - Generic table with sorting, filtering, pagination
- [ ] `DonationsTable` - Specialized donations table
- [ ] `MembersTable` - Members table
- [ ] `EventsTable` - Events table

### Forms
- [ ] `FilterBar` - Multi-select filters
- [ ] `DateRangePicker` - Date range selection
- [ ] `SearchInput` - Search with icon
- [ ] `MultiEmailInput` - For bulk invites

### Charts
- [ ] `DonationsTrendChart` - Line chart (30 days)
- [ ] `PurposeBreakdownChart` - Pie chart
- [ ] `MonthlyVsOnetimeChart` - Bar chart
- [ ] `TopDonorsChart` - Leaderboard
- [ ] `MethodDistributionChart` - Distribution

### Modals
- [ ] `DonationDetailModal` - View donation
- [ ] `MemberDetailModal` - View member
- [ ] `EventDetailModal` - View event
- [ ] `ConfirmDialog` - Confirmation modals

### Animations
- [ ] Fade-up on scroll (Framer Motion + Intersection Observer)
- [ ] Hover lift cards (translateY on hover)
- [ ] Floating icons (continuous animation)
- [ ] Smooth transitions (0.3s easing)
- [ ] Skeleton loaders (while data loads)

---

## 📊 API Integration Points

### Endpoints to consume

| Page | Endpoint | Method | Auth | Purpose |
|------|----------|--------|------|---------|
| Dashboard | `GET /api/mosques/:slug/donations/summary` | GET | Jwt | Get KPIs |
| Donations | `GET /api/mosques/:slug/donations` | GET | Jwt | List donations (paginated, filtered) |
| Members | `GET /api/mosques/:slug/members` | GET | Jwt | List mosque members |
| Events | `GET /api/mosques/:slug/events` | GET | Jwt | List events |
| Announcements | `GET /api/mosques/:slug/announcements` | GET | Jwt | List announcements |
| Settings | `GET /api/mosques/:slug` | GET | Jwt | Get mosque config |
| Settings | `PATCH /api/mosques/:slug` | PATCH | Jwt | Update mosque config |
| Auth | `POST /auth/logout` | POST | Jwt | Logout user |

### Data Structures (from API responses)

**Donation Object**:
```typescript
{
  id: string
  mosque_id: string
  user_id?: string
  amount: number       // In cents (e.g., 1000 = $10)
  currency: string     // 'USD'
  donation_type: 'one_time' | 'monthly'
  purpose: 'general' | 'zakat' | 'sadaqah' | 'ramadan' | 'building_fund'
  status: 'pending' | 'completed' | 'failed'
  donor_name: string
  donor_email: string
  receipt_sent_at?: string
  created_at: string
}
```

**Summary Object**:
```typescript
{
  total_donations_mtd_cents: number
  total_donations_mtd_formatted: string     // "$1,234.56"
  total_unique_donors: number
  active_recurring_count: number
}
```

---

## 🎬 Animation Specifications

### Scroll Animations
```
- Cards fade in from bottom (translateY: 40px → 0px)
- Stagger: 100ms between each card
- Duration: 0.6s
- Easing: easeOut
```

### Hover Animations
```
- Cards: translateY(-8px)
- Duration: 0.3s
- Easing: easeInOut
```

### Floating Elements
```
- Continuous: translateY(-10px → 10px)
- Duration: 3s
- Easing: easeInOut
- Repeat: Loop
```

### Transitions
```
- All color/background changes: 0.2s
- Route changes: 0.3s fade
- Modal open/close: 0.25s scale + fade
```

---

## 📱 Responsive Breakpoints

| Device | Width | Columns | Layout |
|--------|-------|---------|--------|
| Mobile | < 640px | 1 | Stacked, full width |
| Tablet | 640-1024px | 2 | 2-column grid |
| Desktop | > 1024px | 4 | 4-column grid |

---

## ✅ Testing Checklist

- [ ] All pages load without errors
- [ ] Data fetches from API correctly
- [ ] Filters/search work as expected
- [ ] Pagination works (next/prev)
- [ ] Tables sort correctly
- [ ] Modals open/close smoothly
- [ ] Forms validate inputs
- [ ] Toast notifications appear
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth (60fps)
- [ ] Logout works and redirects
- [ ] Donations appear in dashboard after test create
- [ ] All data types correct (amounts formatted, dates localized)

---

## 🚀 Deployment Checklist

- [ ] Environment variables set (.env.local)
- [ ] API URL points to localhost:4000 (dev) or production (prod)
- [ ] Supabase auth configured
- [ ] No console errors
- [ ] Lighthouse score > 80
- [ ] All images optimized
- [ ] Build succeeds: `npm run build`

---

## 📝 Notes

- Mosque slug taken from URL params (TenantGuard provides this)
- All authenticated endpoints require JWT token (auto-included by Axios interceptor)
- Amounts displayed in USD with 2 decimal places
- Dates formatted as "MMM d, yyyy" in display
- Times formatted as "h:mm a" (e.g., "2:30 PM")
- Colors from custom CSS variables (teal/amber theme)
- Avoid hardcoding - use environment variables for API URL

---

**Last Updated**: March 15, 2024  
**Created By**: Copilot  
**Status**: Ready for Implementation
