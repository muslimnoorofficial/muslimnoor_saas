# 🎯 Frontend Dashboard — Detailed Implementation Checklist

**Status**: 🟢 Ready to Start | **Last Updated**: March 15, 2024

---

## 📐 PHASE 1: LAYOUT & NAVIGATION (Priority: 1/5)

### Week 1 - Core Layout

#### [ ] 1.1 - Header Component
- [ ] Create `components/layout/header.tsx`
- [ ] Display logo + brand name
- [ ] Add search input (functional search across page)
- [ ] Create user profile dropdown component
  - [ ] Show user avatar (initials or Gravatar)
  - [ ] Email display
  - [ ] **Logout button** ← Critical missing feature!
  - [ ] Link to profile settings
- [ ] Responsive: Hide search on mobile, show hamburger menu
- [ ] Styling: Glassmorphism effect, sticky position
- [ ] Animation: Fade in on page load

#### [ ] 1.2 - Sidebar Navigation Component
- [ ] Create `components/layout/sidebar.tsx`
- [ ] Navigation links:
  - [ ] Dashboard (icon: home)
  - [ ] Donations (icon: heart-handshake)
  - [ ] Members (icon: users)
  - [ ] Events (icon: calendar)
  - [ ] Announcements (icon: megaphone)
  - [ ] Settings (icon: settings)
- [ ] Active link indicator (highlight current page)
- [ ] Collapsible on mobile (hamburger toggle)
- [ ] Smooth expand/collapse animation
- [ ] Icons from lucide-react

#### [ ] 1.3 - Main Layout Wrapper
- [ ] Create `components/layout/main-layout.tsx`
- [ ] Combines Header + Sidebar + Content area
- [ ] Mobile-responsive grid/flex layout
- [ ] Handles sidebar collapse state
- [ ] Proper spacing/padding

#### [ ] 1.4 - Breadcrumbs Component
- [ ] Create `components/ui/breadcrumbs.tsx`
- [ ] Tracks current route
- [ ] Shows hierarchy (Dashboard > Donations > Detail)
- [ ] Clickable links
- [ ] Separator: `/`

#### [ ] 1.5 - Logout Functionality
- [ ] Add logout method to `lib/supabase/client.ts`
  - [ ] Call `supabase.auth.signOut()`
  - [ ] Clear local storage/session
  - [ ] Redirect to `/login`
- [ ] Add logout button to header user dropdown
- [ ] Test: Click logout, verify redirect to login
- [ ] Test: Verify session cleared (no token in localStorage)

---

## 💰 PHASE 2: DONATIONS MODULE (Priority: 2/5)

### Week 1-2 - Donations Hub & Analytics

#### [ ] 2.1 - Metric Cards Component
- [ ] Create `components/donations/metric-card.tsx`
- [ ] Props: label, value, icon, trend (↑/↓), color
- [ ] Display: Icon + Value + Label + Trend %
- [ ] Styling: Glassmorphism (backdrop-blur)
- [ ] Animation: Hover lift (translateY -8px)
- [ ] Test values:
  - [ ] MTD: $1,234.56
  - [ ] Donors: 42
  - [ ] Subscriptions: 8
  - [ ] Avg: $45.67

#### [ ] 2.2 - Donations Dashboard Summary
- [ ] Create `app/dashboard/page.tsx` (replace basic placeholder)
- [ ] Fetch summary from API: `GET /api/mosques/:slug/donations/summary`
- [ ] Display 4 metric cards:
  - [ ] Total Donations (MTD) - from `total_donations_mtd_formatted`
  - [ ] Unique Donors - from `total_unique_donors`
  - [ ] Active Subscriptions - from `active_recurring_count`
  - [ ] Avg per donation (calculated)
- [ ] Layout: 2x2 grid on desktop, 1x4 on mobile
- [ ] Loading state: Skeleton cards while fetching
- [ ] Error state: Error message with retry button

#### [ ] 2.3 - Recent Donations Widget
- [ ] Create `components/donations/recent-donations-widget.tsx`
- [ ] Fetch latest 5 donations from API: `GET /api/mosques/:slug/donations?limit=5`
- [ ] Display as mini table:
  - [ ] Donor name (from `donor_name`)
  - [ ] Amount (from `amount`, format as USD)
  - [ ] Purpose (badge, from `purpose`)
  - [ ] Date (from `created_at`, format as "MMM d")
  - [ ] Status (badge)
- [ ] Click row → opens detail modal
- [ ] "View all" link → goes to `/dashboard/donations`

#### [ ] 2.4 - Donation Charts (3 charts)

**Chart 1: Donations Trend (Line Chart)**
- [ ] Create `components/donations/trends-chart.tsx`
- [ ] Fetch: Last 30 days of donations from database
- [ ] X-axis: Date (group by day)
- [ ] Y-axis: Total amount (cents converted to USD)
- [ ] Tool: Recharts `<LineChart>`
- [ ] Colors: Teal line with gradient fill
- [ ] Interactive: Tooltip on hover

**Chart 2: Purpose Breakdown (Pie Chart)**
- [ ] Create `components/donations/purpose-breakdown.tsx`
- [ ] Data: Count donations by purpose (general, zakat, sadaqah, ramadan, building_fund)
- [ ] Colors: Different color per segment
- [ ] Legend: Show purpose labels + %
- [ ] Tool: Recharts `<PieChart>`
- [ ] Interactive: Click segment to filter main table

**Chart 3: Monthly vs One-time (Bar Chart)**
- [ ] Create `components/donations/donation-type-chart.tsx`
- [ ] Data: Count by donation_type
- [ ] 2 bars: "One-time" vs "Monthly Recurring"
- [ ] Tool: Recharts `<BarChart>`
- [ ] Y-axis: Count of donations
- [ ] Colors: Different for each type

#### [ ] 2.5 - Donations Hub Page (`/dashboard/donations`)
- [ ] Create `app/dashboard/donations/page.tsx`
- [ ] **Filters Bar** (top):
  - [ ] Status filter (select: completed, pending, failed, all)
  - [ ] Purpose filter (select: general, zakat, sadaqah, ramadan, building_fund, all)
  - [ ] Type filter (select: one_time, monthly, all)
  - [ ] Date range picker (from/to dates)
  - [ ] Clear filters button
  - [ ] Sticky position on scroll
  
- [ ] **Donations Data Table**:
  - [ ] Columns (sortable):
    - [ ] Donor (name with avatar)
    - [ ] Email
    - [ ] Amount (USD, formatted)
    - [ ] Purpose (badge)
    - [ ] Type (icon + label)
    - [ ] Date (MM/DD/YY)
    - [ ] Status (badge with colors)
    - [ ] Actions (menu: view, resend, cancel)
  
  - [ ] Pagination:
    - [ ] Per page: 25 (configurable)
    - [ ] Component: Prev/Next buttons + page indicator
    - [ ] Total count from API response
  
  - [ ] Sorting:
    - [ ] Click column header to sort
    - [ ] Asc/desc toggle (arrow icon)
    - [ ] Default: Sort by date (desc)
  
  - [ ] Bulk Actions:
    - [ ] Checkbox per row + select all
    - [ ] Bulk action menu (export CSV, mark complete)
  
  - [ ] Loading/empty states:
    - [ ] Skeleton rows while loading
    - [ ] "No donations" message if empty
    - [ ] Error state with retry

#### [ ] 2.6 - Donation Detail Modal
- [ ] Create `components/donations/donation-detail-modal.tsx`
- [ ] Trigger: Click donation row in table
- [ ] Content:
  - [ ] Header: Close button, donation ID
  - [ ] Two-column layout:
    - Left: Donation details
      - [ ] Donor name, email
      - [ ] Amount (large display)
      - [ ] Purpose (badge)
      - [ ] Type (one_time / monthly)
      - [ ] Date created
      - [ ] Status (badge)
      - [ ] Receipt sent date (if applicable)
    - Right: Actions
      - [ ] Stripe transaction link (if available)
      - [ ] Resend receipt button
      - [ ] If monthly: Cancel subscription button
      - [ ] Copy donation ID button
  
  - [ ] Notes section (for staff notes - future feature)
  
- [ ] Animation: Scale + fade in/out
- [ ] Responsive: Full width on mobile, modal on desktop

#### [ ] 2.7 - Test Donation Page (`/dashboard/donations/test`)
- [ ] Create `app/dashboard/donations/test/page.tsx`
- [ ] Form to submit test donation:
  - [ ] Amount input (in dollars, convert to cents)
  - [ ] Purpose select (dropdown: general, zakat, sadaqah, ramadan, building_fund)
  - [ ] Donor name input (prefill from logged-in user)
  - [ ] Donor email input (prefill from logged-in user)
  - [ ] Submit button
  - [ ] Form validation

- [ ] API call:
  - [ ] POST to `/api/mosques/:slug/donations/create-intent`
  - [ ] Success: Show confirmation
  - [ ] Error: Show error toast

- [ ] **Real donation test flow**:
  - [ ] Submit form
  - [ ] Simulate "Processing..." state (2 sec)
  - [ ] Show success message with donation ID
  - [ ] Donation should appear in donations table immediately
  - [ ] Verify amount, purpose, donor name all correct
  - [ ] Verify status shows as "pending" → then "completed"

- [ ] Display confirmation:
  - [ ] "✓ Donation created successfully!"
  - [ ] Donation ID
  - [ ] Link to view in donations table
  - [ ] "Create another" button

---

## 👥 PHASE 3: MEMBERS MODULE (Priority: 3/5)

### Week 2 - Members Management

#### [ ] 3.1 - Members List Page (`/dashboard/members`)
- [ ] Create `app/dashboard/members/page.tsx`
- [ ] **Filters/Search**:
  - [ ] Search by name or email (text input)
  - [ ] Role filter (member, admin)
  - [ ] Status filter (active, inactive)
  - [ ] Join date range

- [ ] **Members Table** (columns):
  - [ ] Avatar + name (clickable)
  - [ ] Email
  - [ ] Role (badge)
  - [ ] Status (badge: active/inactive)
  - [ ] Join date (relative: "2 months ago")
  - [ ] Last seen (if available)
  - [ ] Actions menu

- [ ] Row click → opens member detail modal
- [ ] Pagination (25 per page)
- [ ] Responsive (collapse columns on mobile)

#### [ ] 3.2 - Member Detail Modal
- [ ] Create `components/members/member-detail-modal.tsx`
- [ ] Content:
  - [ ] Avatar (large)
  - [ ] Name, email, phone
  - [ ] Role selector (dropdown: member, admin)
  - [ ] Status toggle (active/inactive)
  - [ ] Join date
  - [ ] Donation summary (total donated, # donations, avg)
  - [ ] Events attended (count)
  - [ ] Remove member button (with confirmation)

- [ ] Actions:
  - [ ] Save changes button
  - [ ] Toast on success/error

#### [ ] 3.3 - Invite Members Page (`/dashboard/members/invite`)
- [ ] Create `app/dashboard/members/invite/page.tsx`
- [ ] **Bulk Invite Form**:
  - [ ] Textarea for email list (one per line)
  - [ ] Role select (member or admin)
  - [ ] Custom message textarea
  - [ ] Send invites button

- [ ] Validation:
  - [ ] Valid email format check
  - [ ] No duplicates
  - [ ] Max 100 invites at once

- [ ] Success:
  - [ ] Show count of invites sent
  - [ ] Display list of invited emails

- [ ] **Invite History Table**:
  - [ ] Email, invite date, status (accepted/pending)
  - [ ] Resend button (per row)
  - [ ] Filter: Pending, Accepted

---

## 📅 PHASE 4: EVENTS & ANNOUNCEMENTS (Priority: 4/5)

### Week 2-3 - Events & Announcements

#### [ ] 4.1 - Events Page (`/dashboard/events`)
- [ ] Create `app/dashboard/events/page.tsx`
- [ ] **Events Calendar** (month view):
  - [ ] Display event dots on dates
  - [ ] Click date to see events
  - [ ] Previous/next month buttons

- [ ] **Events List** (below calendar):
  - [ ] Columns: Title, Date, Location, Attendees, Status
  - [ ] Filter: Upcoming, Past
  - [ ] Sort: By date

- [ ] **Create Event Button**:
  - [ ] Opens modal with form
  - [ ] Title, description
  - [ ] Date/time picker
  - [ ] Location
  - [ ] Visibility (public/members-only)
  - [ ] Image upload
  - [ ] Save button

#### [ ] 4.2 - Announcements Page (`/dashboard/announcements`)
- [ ] Create `app/dashboard/announcements/page.tsx`
- [ ] **Announcements List**:
  - [ ] Columns: Title, Preview, Date, Status (draft/published)
  - [ ] Sort: By date (newest first)
  - [ ] Filter: Published, Draft

- [ ] **Create Announcement Button**:
  - [ ] Opens form
  - [ ] Title input
  - [ ] Content (rich text editor - future feature, use textarea for now)
  - [ ] Featured image upload
  - [ ] Publish/Schedule button
  - [ ] Save as draft button

---

## ⚙️ PHASE 5: SETTINGS & ADMIN (Priority: 5/5)

### Week 3 - Settings & User Management

#### [ ] 5.1 - Settings Page (`/dashboard/settings`)
- [ ] Create `app/dashboard/settings/page.tsx`
- [ ] **Tabs**:
  
  **Tab 1: Mosque Settings**
  - [ ] Mosque name (read-only)
  - [ ] Slug (read-only)
  - [ ] City, State, Country
  - [ ] Timezone select (dropdown)
  - [ ] Prayer calculation method (select: ISNA, MWL, etc.)
  - [ ] Madhab (select: Hanafi, Shafi, etc.)
  - [ ] Save button
  
  **Tab 2: Feature Flags**
  - [ ] Donations enabled (toggle)
  - [ ] Events enabled (toggle)
  - [ ] Announcements enabled (toggle)
  - [ ] Prayer times enabled (toggle)
  - [ ] Reminders enabled (toggle)
  - [ ] Save button
  
  **Tab 3: Banking**
  - [ ] Stripe connection status (connected/not connected)
  - [ ] Account email (masked)
  - [ ] Last payout date
  - [ ] Payout schedule
  - [ ] Reconnect button (if disconnected)
  
  **Tab 4: Danger Zone**
  - [ ] Delete mosque (with confirmation)
  - [ ] Archive mosque

#### [ ] 5.2 - User Profile Page (`/dashboard/profile`)
- [ ] Create `app/dashboard/profile/page.tsx`
- [ ] **Profile Card**:
  - [ ] Avatar (upload option)
  - [ ] Name (editable)
  - [ ] Email (display only)
  - [ ] Phone (editable)

- [ ] **Edit Profile Form**:
  - [ ] Full name input
  - [ ] Phone input
  - [ ] Save button
  - [ ] Toast on success

- [ ] **Change Password Form**:
  - [ ] Current password input
  - [ ] New password input
  - [ ] Confirm password input
  - [ ] Change button
  - [ ] Success/error message

- [ ] **Logout Button** (prominent, red):
  - [ ] "Logout" or "Sign out"
  - [ ] Confirmation: "Are you sure?"
  - [ ] Redirects to `/login`

- [ ] **Danger Zone**:
  - [ ] Delete account button (with confirmation)
  - [ ] Requires password

#### [ ] 5.3 - Mosque Admins Page (`/dashboard/admins`)
- [ ] Create `app/dashboard/admins/page.tsx`
- [ ] **Admins List Table**:
  - [ ] Avatar, Name, Email, Role, Status
  - [ ] Actions: Demote, Remove

- [ ] **Add Admin Button**:
  - [ ] Search/select user from members
  - [ ] Confirm to make admin

- [ ] **Transfer Admin Rights**:
  - [ ] Dropdown to select new primary admin
  - [ ] Confirm transfer

---

## 🎨 PHASE 6: REUSABLE COMPONENTS (Priority: Parallel)

### Custom UI Components

#### [ ] 6.1 - Data Display
- [ ] `components/ui/metric-card.tsx` - Key metric display
- [ ] `components/ui/stat-card.tsx` - Icon + stat + description
- [ ] `components/ui/badge.tsx` - Status/category badges
- [ ] `components/ui/avatar.tsx` - User avatar (initials or image)

#### [ ] 6.2 - Forms & Input
- [ ] `components/ui/search-input.tsx` - Search with icon
- [ ] `components/ui/date-range-picker.tsx` - From/to date selection
- [ ] `components/ui/multi-email-input.tsx` - Bulk email entry
- [ ] `components/ui/file-upload.tsx` - Image upload

#### [ ] 6.3 - Tables
- [ ] `components/ui/data-table.tsx` - Generic table (sorting, pagination, filtering)
- [ ] Props: columns, data, isLoading, onRowClick, etc.
- [ ] Sorting: Click header to sort
- [ ] Pagination: Built-in prev/next controls
- [ ] Empty state: "No data found"
- [ ] Loading state: Skeleton rows

#### [ ] 6.4 - Modals & Dialogs
- [ ] `components/ui/modal.tsx` - Reusable modal container
- [ ] `components/ui/confirm-dialog.tsx` - Confirmation modal
- [ ] Props: title, description, onConfirm, onCancel

#### [ ] 6.5 - Charts
- [ ] `components/charts/line-chart.tsx` - Line chart wrapper
- [ ] `components/charts/pie-chart.tsx` - Pie chart wrapper
- [ ] `components/charts/bar-chart.tsx` - Bar chart wrapper
- [ ] Props: data, colors, title, etc.

#### [ ] 6.6 - Loading & Feedback
- [ ] `components/ui/skeleton.tsx` - Placeholder while loading
- [ ] `components/ui/loading-spinner.tsx` - Loading indicator
- [ ] Toast notifications (already have sonner)
- [ ] Error boundaries (catch errors)

---

## 🎬 ANIMATIONS & INTERACTIONS (Priority: Parallel)

#### [ ] 7.1 - Scroll Animations
- [ ] Create `lib/animations/fade-up.ts` - Framer Motion variant
- [ ] Cards fade in from bottom on scroll
- [ ] Stagger: 100ms between cards
- [ ] Use Intersection Observer to trigger
- [ ] Reusable: Apply to all card components

#### [ ] 7.2 - Hover Effects
- [ ] Card lift: `translateY(-8px)` on hover
- [ ] Duration: 0.3s
- [ ] Easing: easeInOut
- [ ] Apply to: Metric cards, tables rows, buttons

#### [ ] 7.3 - Floating Icons
- [ ] Create `components/ui/floating-icon.tsx`
- [ ] Continuous animation: Y axis ±10px
- [ ] Duration: 3s
- [ ] Easing: easeInOut
- [ ] Use in dashboard hero section

#### [ ] 7.4 - Transitions
- [ ] Route transitions: 0.3s fade
- [ ] Modal open/close: 0.25s scale + fade
- [ ] Color transitions: 0.2s
- [ ] All: smooth, no jarring

---

## 🔧 UTILITIES & HELPERS (Priority: Parallel)

#### [ ] 8.1 - API Client Setup
- [ ] Create `lib/api/client.ts`
- [ ] Axios instance with:
  - [ ] Base URL: `process.env.NEXT_PUBLIC_API_URL`
  - [ ] Default headers
  - [ ] JWT token injection (from localStorage)
  - [ ] Error handling (show toast on 401, 403, 500)
  - [ ] Request/response interceptors

#### [ ] 8.2 - Data Formatting Utils
- [ ] `lib/utils/format-currency.ts` - Format cents to USD ("$1,234.56")
- [ ] `lib/utils/format-date.ts` - Format dates ("MMM d, yyyy")
- [ ] `lib/utils/format-time.ts` - Format times ("h:mm a")
- [ ] `lib/utils/format-relative.ts` - Relative dates ("2 days ago")

#### [ ] 8.3 - Validation Utils
- [ ] `lib/utils/validation.ts`
- [ ] Email validation
- [ ] URL validation
- [ ] Amount validation (positive, decimal)

#### [ ] 8.4 - React Query Hooks
- [ ] `hooks/useDonations.ts` - Fetch donations with filters/pagination
- [ ] `hooks/useMembers.ts` - Fetch members
- [ ] `hooks/useDonationsSummary.ts` - Fetch dashboard summary
- [ ] Each: Handles loading, error, caching, refetch
- [ ] Use React Query (TanStack Query) for caching

#### [ ] 8.5 - Authentication Hooks
- [ ] `hooks/useAuth.ts` - Get current user, logout
- [ ] `hooks/useUser.ts` - Get user profile
- [ ] Handle redirects on logout

#### [ ] 8.6 - Custom Hooks
- [ ] `hooks/useMediaQuery.ts` - Detect mobile/tablet/desktop
- [ ] `hooks/useLocalStorage.ts` - Persist state
- [ ] `hooks/usePagination.ts` - Pagination logic
- [ ] `hooks/useDebounce.ts` - Debounce search input

---

## 📱 RESPONSIVE DESIGN (Priority: Parallel)

#### [ ] 9.1 - Mobile (< 640px)
- [ ] Single column layouts
- [ ] Full-width cards
- [ ] Sidebar → hamburger menu
- [ ] Table → card list view (mobile-optimized)
- [ ] Larger touch targets (min 48px)
- [ ] Hide secondary columns in tables

#### [ ] 9.2 - Tablet (640-1024px)
- [ ] 2-column grids
- [ ] Condensed sidebar (icons only)
- [ ] Adjusted spacing
- [ ] Simplified tables

#### [ ] 9.3 - Desktop (> 1024px)
- [ ] 4-column grids
- [ ] Full sidebar with labels
- [ ] All columns visible in tables
- [ ] Optimal spacing

---

## ✅ TESTING CHECKLIST

### Unit Tests (Nice to Have - Future)
- [ ] Utils: format-currency, format-date, validation
- [ ] Hooks: usePagination, useDebounce

### Integration Tests (Manual for now)
- [ ] Login → Dashboard loads
- [ ] Click Donations → Page loads with API data
- [ ] Filter donations → Table updates
- [ ] Sort column → Data sorted correctly
- [ ] Pagination → Next/prev works
- [ ] Modal open/close → Smooth animation
- [ ] Logout → Redirect to login

### E2E Tests (Manual)
- [ ] Add test donation → Data persists
- [ ] Logout → Session cleared
- [ ] Login as different user → See their mosque data
- [ ] Responsive: Mobile, Tablet, Desktop

### Performance Tests
- [ ] Lighthouse scores > 80
- [ ] First Contentful Paint < 2s
- [ ] Images optimized (WebP, lazy load)
- [ ] No console errors

---

## 📊 PROGRESS TRACKING

### Current Status
- [x] Phase 1 (Layout): TODO created
- [ ] Phase 1 (Layout): In Progress
- [ ] Phase 2 (Donations): Not Started
- [ ] Phase 3 (Members): Not Started
- [ ] Phase 4 (Events): Not Started
- [ ] Phase 5 (Settings): Not Started
- [ ] Phase 6 (Components): Not Started
- [ ] Phase 7 (Animations): Not Started
- [ ] Phase 8 (Utilities): Not Started
- [ ] Phase 9 (Testing): Not Started

### Timeline
- **Week 1**: Phase 1 + 2 (Layout + Donations)
- **Week 2**: Phase 2 complete + Phase 3 (Members) + Phase 4 start
- **Week 3**: Phase 4 + 5 complete + Parallel utilities + Testing
- **Week 4**: Polish + Performance optimization + Deployment

---

## 🚀 CRITICAL MISSING FEATURES

### 🔴 **LOGOUT BUTTON** (Blocking)
- Status: NOT IMPLEMENTED
- Location: Header user dropdown
- Action Required:
  1. Add logout method to Supabase client
  2. Add logout button to header
  3. Test: Click logout, verify redirect to login
  4. Test: Verify no token in localStorage

### 🟠 High Priority
- [ ] Dashboard summary with KPI cards
- [ ] Donations table with filters
- [ ] API integration (React Query hooks)
- [ ] Responsive design

### 🟡 Medium Priority
- [ ] Members, Events, Announcements modules
- [ ] Settings pages
- [ ] Chart visualizations

### 🟢 Low Priority (Nice to Have)
- [ ] Advanced animations
- [ ] Dark mode
- [ ] Bulk actions
- [ ] PDF exports

---

## 📝 Notes

- Start with **Phase 1 (Layout)** immediately
- **Logout is CRITICAL** - implement first
- Use React Query for all data fetching (caching, refetch)
- Keep components small and reusable
- Test on mobile frequently
- Ask for design feedback early (colors, spacing, layouts)
- API URL: `process.env.NEXT_PUBLIC_API_URL` (localhost:4000 locally)

---

**Created**: March 15, 2024  
**Target Start**: Immediately  
**Target Completion**: ~3-4 weeks (full-time)
