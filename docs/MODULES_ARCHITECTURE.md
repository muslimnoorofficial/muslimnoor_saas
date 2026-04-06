# MosqueOS Module Architecture: Events, Announcements & Reminders

## 📋 Overview

This document outlines the architecture for three core MosqueOS modules:
- **Events Module** - Community events (Taraweeh gatherings, workshops, lectures)
- **Announcements Module** - Important updates (prayer schedule changes, maintenance notices)
- **Reminders Module** - Notifications system (prayer reminders, event notifications, donation receipts)

---

## 📅 Events Module

### Purpose
Enable mosque admins to create, manage, and promote community events. Members receive notifications and can RSVP.

### Database Schema
```sql
Table: events
├── id (UUID) - Primary key
├── mosque_id (UUID FK) - Which mosque
├── created_by (UUID FK) - Admin who created
├── title (VARCHAR 255)
├── description (TEXT)
├── location (VARCHAR 255)
├── start_at (TIMESTAMP) - Event start time
├── end_at (TIMESTAMP) - Event end time
├── image_url (TEXT) - Event poster/banner
├── is_public (BOOLEAN) - Visible to non-members?
├── category (ENUM) - taraweeh, lecture, wedding, funeral, class, social, other
├── attendance_limit (INTEGER) - Max attendees (null = unlimited)
├── created_at, updated_at, deleted_at

Table: event_attendees
├── id (UUID)
├── event_id (UUID FK)
├── user_id (UUID FK)
├── rsvp_status (ENUM: yes, no, maybe, pending)
├── attendance_confirmed (BOOLEAN) - Did they actually attend?
├── notes (TEXT)
└── rsvp_at (TIMESTAMP)
```

### Backend API Endpoints

```typescript
// POST /api/mosques/:slug/events
// Create event (mosque_admin only)
{
  title: string;
  description: string;
  location: string;
  start_at: ISO8601;
  end_at: ISO8601;
  image_url?: string;
  is_public: boolean;
  category: 'taraweeh' | 'lecture' | 'wedding' | 'funeral' | 'class' | 'social' | 'other';
  attendance_limit?: number;
}

// GET /api/mosques/:slug/events
// List events (with filters)
Query params:
  - category?: string
  - is_public?: boolean
  - from_date?: ISO8601
  - to_date?: ISO8601
  - skip?: number
  - limit?: number (default 20)

// GET /api/mosques/:slug/events/:event_id
// Get event details + attendee list

// PATCH /api/mosques/:slug/events/:event_id
// Update event (mosque_admin only)

// DELETE /api/mosques/:slug/events/:event_id
// Delete event (mosque_admin only)

// POST /api/mosques/:slug/events/:event_id/rsvp
// RSVP to event (authenticated users)
{
  rsvp_status: 'yes' | 'no' | 'maybe';
  notes?: string;
}

// GET /api/mosques/:slug/events/:event_id/attendees
// Get RSVP list (mosque_admin only)
```

### Frontend Components

```
EventsList.tsx
├── EventCard.tsx
│   ├── EventImage
│   ├── EventTitle & Description
│   ├── DateTimeDisplay
│   ├── LocationDisplay
│   └── RSVPButton
├── EventFilters
│   ├── CategoryFilter (Dropdown)
│   ├── DateRangeFilter (Calendar)
│   └── SearchInput
└── EventPagination

EventDetail.tsx
├── EventHeader (Large banner image)
├── EventInfo
│   ├── Title, Description, Location
│   ├── Date/Time display
│   ├── Attendance count
│   └── Category badge
├── RSVPSection
│   ├── RSVP buttons (Yes/No/Maybe)
│   └── RSVP list (Who's attending)
└── EditButton (if mosque_admin)

EventCreateEdit.tsx (Admin only)
├── Form fields:
│   ├── Title input
│   ├── Description editor (rich text)
│   ├── Location autocomplete
│   ├── Date/Time pickers
│   ├── Image uploader
│   ├── Category dropdown
│   ├── Attendance limit input
│   └── Public/Private toggle
└── Submit/Cancel buttons
```

### Notification Flow

```
Event Created
    ↓
Trigger "event.created" webhook
    ↓
Reminders service
    ↓
Create reminders for:
    - Event date (same day, 1 hour before)
    - Event date (same day, start time)
```

---

## 📢 Announcements Module

### Purpose
Enable mosque admins to broadcast important updates with pinning and expiration capabilities.

### Database Schema
```sql
Table: announcements
├── id (UUID)
├── mosque_id (UUID FK)
├── created_by (UUID FK)
├── title (VARCHAR 255) - Headline
├── content (TEXT) - Full text (supports Markdown)
├── is_published (BOOLEAN)
├── published_at (TIMESTAMP) - When published (null if draft)
├── is_pinned (BOOLEAN) - Sticky announcement?
├── expires_at (TIMESTAMP) - Auto-hide after this date (null = never expires)
├── created_at, updated_at, deleted_at

Table: announcement_reads
├── id (UUID)
├── announcement_id (UUID FK)
├── user_id (UUID FK)
├── read_at (TIMESTAMP)
└── UNIQUE(announcement_id, user_id)
```

### Backend API Endpoints

```typescript
// POST /api/mosques/:slug/announcements
// Create announcement (mosque_admin only)
{
  title: string;
  content: string;
  is_published: boolean; // Save as draft or publish immediately
  is_pinned?: boolean;
  expires_at?: ISO8601;
}

// GET /api/mosques/:slug/announcements
// List announcements (published only for members)
Query params:
  - include_expired?: boolean
  - skip?: number
  - limit?: number (default 20)

// GET /api/mosques/:slug/announcements/:announcement_id
// Get announcement details + mark as read

// PATCH /api/mosques/:slug/announcements/:announcement_id
// Update announcement (mosque_admin only)

// DELETE /api/mosques/:slug/announcements/:announcement_id
// Delete announcement (mosque_admin only)

// PATCH /api/mosques/:slug/announcements/:announcement_id/pin
// Toggle pin status (mosque_admin only)
{
  is_pinned: boolean;
}
```

### Frontend Components

```
AnnouncementsList.tsx
├── PinnedAnnouncements (sticky at top)
│   └── AnnouncementCard (highlighted)
├── RegularAnnouncements
│   └── AnnouncementCard
│       ├── Title
│       ├── First 100 chars of content
│       ├── PublishedDate
│       ├── ExpiresDate (if applicable)
│       └── ReadMore link
├── EmptyState (if no announcements)
└── AnnouncementPagination

AnnouncementDetail.tsx
├── Title
├── PublishedDate + Author
├── Content (Markdown rendered)
├── ExpiresDate (if applicable)
├── Share buttons
└── BackButton

AnnouncementCreateEdit.tsx (Admin only)
├── Form fields:
│   ├── Title input
│   ├── Content editor (rich text / Markdown)
│   ├── Pin toggle
│   ├── Publish toggle
│   ├── Expiration date picker (optional)
│   └── Preview button
└── Publish/Draft/Cancel buttons
```

### Auto-Expiration Logic

```typescript
// Database query (run daily via cron job)
UPDATE announcements
SET is_published = FALSE
WHERE is_published = TRUE
AND expires_at IS NOT NULL
AND expires_at < NOW();
```

---

## 🔔 Reminders Module

### Purpose
Deliver timely notifications via:
- 📱 In-app notifications (real-time via WebSocket or polling)
- 📧 Email notifications
- 📱 Push notifications (future: PWA/mobile app)

### Database Schema
```sql
Table: reminders
├── id (UUID)
├── mosque_id (UUID FK)
├── user_id (UUID FK) - null = broadcast to all members
├── title (VARCHAR 255)
├── description (TEXT)
├── reminder_type (ENUM) - prayer, event, donation, announcement, custom
├── scheduled_for (TIMESTAMP) - When to send
├── is_sent (BOOLEAN)
├── sent_at (TIMESTAMP)
├── related_entity_id (UUID) - prayer_id, event_id, etc
├── related_entity_type (VARCHAR 50) - prayer, event, donation
├── created_at, updated_at

Table: notification_logs (audit trail)
├── id (UUID)
├── reminder_id (UUID FK)
├── user_id (UUID FK)
├── delivery_method (ENUM) - in_app, email, push
├── status (ENUM) - pending, sent, failed, bounced
├── error_message (TEXT, nullable)
└── sent_at (TIMESTAMP)

Table: user_notification_settings
├── id (UUID)
├── user_id (UUID FK)
├── mosque_id (UUID FK)
├── reminder_type (VARCHAR 50)
├── notify_via (JSON) - { email: true, in_app: true, push: true }
├── advance_minutes (INTEGER) - How many minutes before to notify
└── UNIQUE(user_id, mosque_id, reminder_type)
```

### Backend API Endpoints

```typescript
// GET /api/reminders
// Get user's notification settings
Response:
[
  {
    reminder_type: 'prayer',
    notify_via: { email: true, in_app: true, push: false },
    advance_minutes: 15,
  },
  // ...more types
]

// PATCH /api/reminders/:reminder_type/settings
// Update notification preferences
{
  notify_via: { email: boolean, in_app: boolean, push: boolean };
  advance_minutes?: number;
}

// GET /api/notifications
// Get user's in-app notifications
Query params:
  - status?: 'unread' | 'read'
  - skip?: number
  - limit?: number (default 20)

// POST /api/notifications/:notification_id/read
// Mark notification as read

// POST /api/notifications/read-all
// Mark all notifications as read

// DELETE /api/notifications/:notification_id
// Delete a notification
```

### Reminder Triggers

```typescript
// 1. PRAYER REMINDERS (Auto-triggered)
Trigger: Prayer time - user's advance_minutes
Event: Fajr prayer at 5:30 AM, user set to 15 minutes before
Action: Send reminder at 5:15 AM

// 2. EVENT REMINDERS (Auto-triggered)
Trigger: Event start_at - user's advance_minutes
Event: Taraweeh at 8:00 PM, user set to 60 minutes before
Action: Send reminder at 7:00 PM

// 3. DONATION RECEIPT (Auto-triggered)
Trigger: Donation processed
Event: Donation completed
Action: Send receipt email + in-app notification

// 4. ANNOUNCEMENT PUBLISHED (Auto-triggered)
Trigger: Important announcement marked as "broadcast"
Event: New announcement published
Action: Send to all mosque members (respecting preferences)

// 5. CUSTOM REMINDERS (Admin-created)
Trigger: Admin creates reminder
Event: Admin wants to remind about event registration closing
Action: Send at specified date/time
```

### Frontend Components

```
NotificationBell.tsx
├── Badge (unread count)
├── DropdownMenu
│   ├── NotificationList (most recent 5)
│   │   └── NotificationItem
│   │       ├── Icon (based on type)
│   │       ├── Title & Description
│   │       ├── Timestamp (relative)
│   │       └── MarkAsRead button
│   ├── ViewAllLink
│   └── SettingsLink

NotificationCenter.tsx (Full page)
├── NotificationFilters
│   ├── TypeFilter (prayer, event, donation, etc)
│   ├── StatusFilter (read/unread)
│   └── SearchInput
├── NotificationList
│   └── NotificationItem
│       ├── Icon
│       ├── Content
│       ├── Timestamp
│       ├── ActionButtons
│       └── Delete button
├── MarkAllAsReadButton
└── NotificationPagination

NotificationSettingsModal.tsx
├── Reminder types (checkboxes):
│   ├── ☐ Prayer reminders
│   │   ├── ☐ Email  ☐ In-app  ☐ Push
│   │   └── Minutes before: [15]
│   ├── ☐ Event reminders
│   │   ├── ☐ Email  ☐ In-app  ☐ Push
│   │   └── Minutes before: [60]
│   ├── ☐ Donation receipts
│   │   └── ☐ Email  ☐ In-app
│   ├── ☐ Announcements
│   │   └── ☐ Email  ☐ In-app
│   └── ☐ Custom reminders
│       └── ☐ Email  ☐ In-app
└── Save button
```

### Notification Delivery Service

```typescript
// /src/modules/reminders/reminder-scheduler.service.ts

interface ReminderJob {
  reminderId: string;
  userId: string;
  reminderType: string;
  scheduledFor: Date;
  deliveryMethods: string[]; // ['email', 'in_app', 'push']
}

// Run every minute via cron job
async checkAndSendReminders() {
  // Find all reminders scheduled for the next minute
  const reminders = await db.reminders
    .where('is_sent', false)
    .where('scheduled_for', '<=', now + 1 minute)
    .select();

  for (const reminder of reminders) {
    // Get user's notification settings
    const settings = await getUserNotificationSettings(
      reminder.user_id,
      reminder.reminder_type
    );

    // Send via each configured method
    if (settings.notify_via.email) {
      await emailService.send({...});
    }
    if (settings.notify_via.in_app) {
      await createNotification({...});
    }
    if (settings.notify_via.push) {
      await pushService.send({...});
    }

    // Mark as sent
    await reminder.update({ is_sent: true, sent_at: new Date() });
  }
}
```

---

## 🔄 Integration Points

### Events → Reminders
```
1. Event created → Auto-create reminders for event date
2. Event deleted → Cancel related reminders
3. Event updated → Update related reminders
```

### Donations → Reminders
```
1. Donation successful → Create receipt reminder
2. Reminder sent → Log delivery + create notification
3. Email failed → Retry or send in-app notification
```

### Announcements → Reminders
```
1. Announcement published → Create broadcast reminder
2. Expires → Auto-unpublish
```

---

## 📊 Implementation Priority

**Phase 1 (MVP):**
- ✅ Events module (create, list, RSVP)
- ✅ Announcements module (create, publish, pin)
- ✅ Basic reminders (prayer times, event start time)

**Phase 2 (Enhanced):**
- Event attendee management
- Announcement expiration logic
- Email notifications
- User notification preferences

**Phase 3 (Advanced):**
- Push notifications (PWA/mobile)
- SMS notifications
- Reminder analytics
- Event attendance tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Job Scheduling** | BullMQ (reminder scheduler) + Redis |
| **Email** | Resend SDK |
| **Real-time Notifications** | Socket.io (future) or polling |
| **Rich Text Editor** | TipTap or Slate (for announcements) |
| **Date/Time** | date-fns (time calculations) |
| **Cron Jobs** | node-cron or Bull scheduled jobs |

---

## 📝 Next Steps

1. **Create Events Module**
   ```bash
   pnpm nx g @nestjs/schematics:resource modules/events
   ```

2. **Create Announcements Module**
   ```bash
   pnpm nx g @nestjs/schematics:resource modules/announcements
   ```

3. **Create Reminders Service (in Donations Module)**
   - Extend existing BullMQ setup
   - Add reminder queue processor

4. **Add Frontend Components**
   - EventsList, EventDetail, EventCreate
   - AnnouncementsList, AnnouncementDetail, AnnouncementCreate
   - NotificationCenter, NotificationSettings

5. **Database Migrations**
   - Run SQL schema above
   - Add RLS policies

---

