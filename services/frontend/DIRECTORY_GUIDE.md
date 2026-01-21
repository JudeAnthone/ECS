src/
├── app/
│   │
│   ├── (auth)/                                    # Route Group: Authentication pages
│   │   ├── layout.tsx                             # Auth-specific layout (centered, no nav)
│   │   ├── login/
│   │   │   ├── page.tsx                           # URL: /login (Google + Magic Link)
│   │   │   └── loading.tsx
│   │   └── verify-email/
│   │       └── page.tsx                           # URL: /verify-email (Magic link confirmation)
│   │
│   ├── (marketing)/                               # Route Group: Public pages
│   │   ├── layout.tsx                             # Marketing layout (header, footer)
│   │   ├── page.tsx                               # Landing page - URL: /
│   │   ├── features/
│   │   │   └── page.tsx                           # URL: /features (Extension capabilities)
│   │   ├── pricing/
│   │   │   └── page.tsx                           # URL: /pricing
│   │   ├── how-it-works/
│   │   │   └── page.tsx                           # URL: /how-it-works
│   │   ├── download/
│   │   │   └── page.tsx                           # URL: /download (Chrome/Firefox store links)
│   │   └── legal/
│   │       ├── privacy/
│   │       │   └── page.tsx                       # URL: /legal/privacy
│   │       └── terms/
│   │           └── page.tsx                       # URL: /legal/terms
│   │
│   ├── (dashboard)/                               # Route Group: Protected dashboard
│   │   ├── layout.tsx                             # AUTH CHECK ONLY - No UI rendering
│   │   │                                          # - Validates user is logged in
│   │   │                                          # - Checks if user has a role
│   │   │                                          # - Redirects to /login if not authenticated
│   │   │
│   │   ├── page.tsx                               # ROLE REDIRECTOR - URL: /dashboard
│   │   │                                          # - Redirects to /{role} automatically
│   │   │
│   │   ├── loading.tsx                            # Global dashboard loading state
│   │   │
│   │   └── [role]/                                # DYNAMIC SEGMENT - admin/manager/user
│   │       ├── layout.tsx                         # ROLE-SPECIFIC SHELL RENDERER
│   │       │
│   │       ├── page.tsx                           # Dashboard home - URL: /{role}
│   │       │                                      # - Extension usage stats
│   │       │                                      # - Activity overview
│   │       ├── loading.tsx
│   │       │
│   │       ├── profile/                           # SHARED ROUTE (all roles)
│   │       │   └── page.tsx                       # URL: /{role}/profile
│   │       │
│   │       ├── settings/                          # SHARED ROUTE (all roles)
│   │       │   ├── page.tsx                       # URL: /{role}/settings
│   │       │   ├── general/
│   │       │   │   └── page.tsx                   # URL: /{role}/settings/general
│   │       │   ├── extension/
│   │       │   │   └── page.tsx                   # URL: /{role}/settings/extension
│   │       │   │                                  # - Extension preferences
│   │       │   │                                  # - Sync settings
│   │       │   │                                  # - Shortcuts/hotkeys
│   │       │   ├── security/
│   │       │   │   └── page.tsx                   # URL: /{role}/settings/security
│   │       │   ├── notifications/
│   │       │   │   └── page.tsx                   # URL: /{role}/settings/notifications
│   │       │   └── billing/
│   │       │       └── page.tsx                   # URL: /{role}/settings/billing (admin only)
│   │       │
│   │       ├── users/                             # ADMIN ONLY
│   │       │   ├── page.tsx                       # URL: /admin/users
│   │       │   │                                  # - User management
│   │       │   │                                  # - Extension license assignments
│   │       │   ├── [id]/
│   │       │   │   ├── page.tsx                   # URL: /admin/users/123
│   │       │   │   └── edit/
│   │       │   │       └── page.tsx               # URL: /admin/users/123/edit
│   │       │   ├── create/
│   │       │   │   └── page.tsx                   # URL: /admin/users/create
│   │       │   └── loading.tsx
│   │       │
│   │       ├── analytics/                         # ADMIN & MANAGER ONLY
│   │       │   ├── page.tsx                       # URL: /{role}/analytics
│   │       │   │                                  # - Extension usage metrics
│   │       │   │                                  # - User engagement stats
│   │       │   │                                  # - Feature adoption rates
│   │       │   ├── usage/
│   │       │   │   └── page.tsx                   # URL: /{role}/analytics/usage
│   │       │   │                                  # - Daily active users
│   │       │   │                                  # - Extension sessions
│   │       │   ├── performance/
│   │       │   │   └── page.tsx                   # URL: /{role}/analytics/performance
│   │       │   │                                  # - Load times
│   │       │   │                                  # - Error rates
│   │       │   └── reports/
│   │       │       ├── page.tsx                   # URL: /{role}/analytics/reports
│   │       │       └── [reportId]/
│   │       │           └── page.tsx               # URL: /{role}/analytics/reports/r-123
│   │       │
│   │       ├── team/                              # ADMIN & MANAGER ONLY
│   │       │   ├── page.tsx                       # URL: /{role}/team
│   │       │   │                                  # - Team member list
│   │       │   │                                  # - Extension access management
│   │       │   ├── [memberId]/
│   │       │   │   └── page.tsx                   # URL: /{role}/team/member-123
│   │       │   │                                  # - Member's extension activity
│   │       │   ├── invite/
│   │       │   │   └── page.tsx                   # URL: /{role}/team/invite
│   │       │   └── loading.tsx
│   │       │
│   │       ├── extension/                         # SHARED ROUTE (all roles)
│   │       │   ├── page.tsx                       # URL: /{role}/extension
│   │       │   │                                  # - Extension overview
│   │       │   │                                  # - Quick actions
│   │       │   ├── history/
│   │       │   │   └── page.tsx                   # URL: /{role}/extension/history
│   │       │   │                                  # - Extension activity log
│   │       │   │                                  # - Action history
│   │       │   └── saved/
│   │       │      └── page.tsx                   # URL: /{role}/extension/saved
│   │       │                                     # - Saved items from extension
│   │       │                                     # - Bookmarks/clips
│   │       │
│   │       ├── api-keys/                          # ADMIN & MANAGER ONLY
│   │       │   ├── page.tsx                       # URL: /{role}/api-keys
│   │       │   │                                  # - API key management
│   │       │   │                                  # - Extension API access
│   │       │   └── create/
│   │       │       └── page.tsx                   # URL: /{role}/api-keys/create
│   │       │
│   │       ├── integrations/                      # SHARED ROUTE (all roles)
│   │       │   ├── page.tsx                       # URL: /{role}/integrations
│   │       │   │                                  # - Third-party integrations
│   │       │   │                                  # - Connected services
│   │       │   └── [slug]/
│   │       │       └── page.tsx                   # URL: /{role}/integrations/slack
│   │       │
│   │       ├── notifications/                     # SHARED ROUTE (all roles)
│   │       │   └── page.tsx                       # URL: /{role}/notifications
│   │       │
│   │       ├── support/                           # SHARED ROUTE (all roles)
│   │       │   ├── page.tsx                       # URL: /{role}/support
│   │       │   │                                  # - Help center
│   │       │   │                                  # - Extension troubleshooting
│   │       │   ├── tickets/
│   │       │   │   ├── page.tsx                   # URL: /{role}/support/tickets
│   │       │   │   └── [id]/
│   │       │   │       └── page.tsx               # URL: /{role}/support/tickets/t-123
│   │       │   └── docs/
│   │       │       ├── page.tsx                   # URL: /{role}/support/docs
│   │       │       └── [slug]/
│   │       │           └── page.tsx               # URL: /{role}/support/docs/getting-started
│   │       │
│   │       └── billing/                           # ADMIN ONLY
│   │           ├── page.tsx                       # URL: /admin/billing
│   │           │                                  # - Subscription management
│   │           │                                  # - License seats
│   │           ├── invoices/
│   │           │   └── page.tsx                   # URL: /admin/billing/invoices
│   │           └── usage/
│   │               └── page.tsx                   # URL: /admin/billing/usage
│   │                                              # - License usage tracking
│   │
│   ├── api/                                       # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts                       # NextAuth handler (Google + Magic Link)
│   │   │   └── session/
│   │   │       └── route.ts                       # GET /api/auth/session
│   │   │
│   │   ├── extension/
│   │   │   ├── sync/
│   │   │   │   └── route.ts                       # POST /api/extension/sync
│   │   │   │                                      # - Sync extension data
│   │   │   ├── settings/
│   │   │   │   └── route.ts                       # GET, PATCH /api/extension/settings
│   │   │   ├── history/
│   │   │   │   └── route.ts                       # GET, POST /api/extension/history
│   │   │   ├── saved/
│   │   │   │   ├── route.ts                       # GET, POST /api/extension/saved
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts                   # GET, DELETE /api/extension/saved/:id
│   │   │   └── templates/
│   │   │       ├── route.ts                       # GET, POST /api/extension/templates
│   │   │       └── [id]/
│   │   │           └── route.ts                   # GET, PATCH, DELETE /api/extension/templates/:id
│   │   │
│   │   ├── users/
│   │   │   ├── route.ts                           # GET, POST /api/users
│   │   │   └── [id]/
│   │   │       ├── route.ts                       # GET, PATCH, DELETE /api/users/:id
│   │   │       └── permissions/
│   │   │           └── route.ts                   # GET, PATCH /api/users/:id/permissions
│   │   │
│   │   ├── analytics/
│   │   │   ├── usage/
│   │   │   │   └── route.ts                       # GET /api/analytics/usage
│   │   │   ├── performance/
│   │   │   │   └── route.ts                       # GET /api/analytics/performance
│   │   │   └── reports/
│   │   │       └── route.ts                       # GET /api/analytics/reports
│   │   │
│   │   ├── team/
│   │   │   ├── route.ts                           # GET, POST /api/team
│   │   │   ├── [id]/
│   │   │   │   └── route.ts                       # GET, PATCH, DELETE /api/team/:id
│   │   │   └── invite/
│   │   │       └── route.ts                       # POST /api/team/invite
│   │   │
│   │   ├── integrations/
│   │   │   ├── route.ts                           # GET /api/integrations
│   │   │   └── [slug]/
│   │   │       ├── route.ts                       # GET, POST /api/integrations/:slug
│   │   │       └── disconnect/
│   │   │           └── route.ts                   # POST /api/integrations/:slug/disconnect
│   │   │
│   │   ├── api-keys/
│   │   │   ├── route.ts                           # GET, POST /api/api-keys
│   │   │   └── [id]/
│   │   │       ├── route.ts                       # GET, DELETE /api/api-keys/:id
│   │   │       └── rotate/
│   │   │           └── route.ts                   # POST /api/api-keys/:id/rotate
│   │   │
│   │   ├── support/
│   │   │   ├── tickets/
│   │   │   │   ├── route.ts                       # GET, POST /api/support/tickets
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts                   # GET, PATCH /api/support/tickets/:id
│   │   │   └── feedback/
│   │   │       └── route.ts                       # POST /api/support/feedback
│   │   │
│   │   └── webhooks/
│   │       ├── extension/
│   │       │   └── route.ts                       # POST /api/webhooks/extension
│   │       └── stripe/
│   │           └── route.ts                       # POST /api/webhooks/stripe
│   │
│   ├── error.tsx                                  # Global error boundary
│   ├── not-found.tsx                              # 404 page
│   ├── layout.tsx                                 # Root layout (html, body, providers)
│   ├── loading.tsx                                # Global loading fallback
│   └── globals.css                                # Global styles
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx                          # Google + Magic Link login
│   │   └── OAuthButtons.tsx                       # Google OAuth button
│   │
│   ├── dashboard/
│   │   ├── shared/                                # Shared across all roles
│   │   │   ├── DashboardHeader.tsx                # Top bar
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── widgets/                               # Reusable widgets
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ChartWidget.tsx
│   │   │   ├── UsageChart.tsx                     # Extension usage chart
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── admin/                                 # Admin-specific
│   │   │   ├── AdminDashboardShell.tsx            # ADMIN LAYOUT SHELL
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagementTable.tsx
│   │   │   ├── LicenseManager.tsx                 # Manage extension licenses
│   │   │   ├── SystemMetrics.tsx
│   │   │   ├── AuditLog.tsx
│   │   │   └── BillingOverview.tsx
│   │   │
│   │   ├── manager/                               # Manager-specific
│   │   │   ├── ManagerDashboardShell.tsx          # MANAGER LAYOUT SHELL
│   │   │   ├── ManagerSidebar.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── TeamOverview.tsx
│   │   │   ├── TeamUsageStats.tsx                 # Team extension usage
│   │   │   └── TeamActivityLog.tsx
│   │   │
│   │   └── user/                                  # User-specific
│   │       ├── UserDashboardShell.tsx             # USER LAYOUT SHELL
│   │       ├── UserSidebar.tsx
│   │       ├── UserDashboard.tsx
│   │       ├── ExtensionQuickActions.tsx          # Quick extension actions
│   │       ├── RecentActivity.tsx                 # Recent extension activity
│   │       └── SavedItems.tsx                     # Saved from extension
│   │
│   ├── extension/                                 # Extension-specific components
│   │   ├── ExtensionStatus.tsx                    # Connection status indicator
│   │   ├── ExtensionConnect.tsx                   # Connect extension prompt
│   │   ├── HistoryList.tsx                        # Activity history
│   │   ├── SavedItemCard.tsx                      # Saved item display
│   │   ├── TemplateCard.tsx                       # Template card
│   │   ├── TemplateEditor.tsx                     # Template creation/editing
│   │   ├── SyncStatus.tsx                         # Sync indicator
│   │   └── IntegrationCard.tsx                    # Third-party integration card
│   │
│   ├── marketing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx                           # Extension features showcase
│   │   ├── HowItWorks.tsx                         # Extension workflow
│   │   ├── PricingTable.tsx
│   │   ├── DownloadCTA.tsx                        # Chrome/Firefox download buttons
│   │   ├── Testimonials.tsx
│   │   └── Footer.tsx
│   │
│   ├── shared/
│   │   ├── ProfileForm.tsx
│   │   ├── SettingsForm.tsx
│   │   ├── NotificationList.tsx
│   │   ├── AvatarUpload.tsx
│   │   ├── DatePicker.tsx
│   │   └── FileUpload.tsx
│   │
│   └── ui/                                        # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       └── ...
│
├── lib/
│   ├── auth/
│   │   ├── options.ts                             # NextAuth config
│   │   ├── session.ts                             # Session helpers
│   │   ├── permissions.ts                         # Permission matrix
│   │   └── middleware.ts                          # Auth middleware utilities
│   │
│   ├── extension/
│   │   ├── sync.ts                                # Extension sync logic
│   │   ├── storage.ts                             # Extension data storage
│   │   ├── templates.ts                           # Template management
│   │   └── analytics.ts                           # Extension analytics tracking
│   │
│   ├── api/
│   │   ├── client.ts                              # API client
│   │   ├── fetchers.ts                            # Data fetchers
│   │   └── endpoints.ts                           # API endpoint constants
│   │
│   ├── email/
│   │   ├── templates/
│   │   │   └── magic-link.tsx                     # Magic link email
│   │   └── send.ts                                # Email utility
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                             # Authentication hook
│   │   ├── useRole.ts                             # Role checking
│   │   ├── usePermissions.ts                      # Permission checking
│   │   ├── useExtension.ts                        # Extension state hook
│   │   ├── useExtensionSync.ts                    # Sync status hook
│   │   └── useUser.ts                             # User data hook
│   │
│   ├── utils/
│   │   ├── cn.ts                                  # Class name utility
│   │   ├── format.ts                              # Formatting
│   │   ├── validators.ts                          # Zod schemas
│   │   └── constants.ts                           # App constants
│   │
│   ├── prisma.ts                                  # Prisma client
│   │
│   └── store/                                     # State management
│       ├── auth.ts
│       ├── extension.ts                           # Extension state
│       └── sync.ts                                # Sync state
│
├── prisma/
│   ├── schema.prisma                              # Database schema
│   │                                              # - User, Account, Session
│   │                                              # - ExtensionData, SavedItems
│   │                                              # - Templates, History
│   │                                              # - Team, ApiKeys
│   └── migrations/
│
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── extension.ts                               # Extension-related types
│   ├── api.ts
│   ├── next-auth.d.ts                             # NextAuth extensions
│   └── index.ts
│
├── config/
│   ├── navigation.ts                              # Role-based navigation
│   ├── permissions.ts                             # Permission config
│   ├── extension.ts                               # Extension config/constants
│   └── site.ts                                    # Site metadata
│
├── middleware.ts                                  # Global middleware
│
├── .env.local                                     # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json


📋 EXTENSION SERVICE SPECIFIC FEATURES:

1. EXTENSION MANAGEMENT:
   - /{role}/extension → Extension overview & quick actions
   - /{role}/extension/history → Activity log
   - /{role}/extension/saved → Saved items from extension
   - /{role}/extension/templates → User templates
   - /{role}/extension/sync → Sync status & devices

2. ANALYTICS:
   - Extension usage metrics
   - User engagement tracking
   - Feature adoption rates
   - Performance monitoring

3. SETTINGS:
   - Extension-specific preferences
   - Sync settings
   - Keyboard shortcuts
   - Custom templates

4. API KEYS:
   - API key management for extension
   - Programmatic access control

5. INTEGRATIONS:
   - Third-party service connections
   - Webhook configurations

6. BILLING (Admin):
   - License seat management
   - Usage tracking
   - Subscription control

7. USER FLOWS:
   - Download extension → Install → Login → Sync
   - Extension detects user → Auto-sync settings
   - Save items from extension → View in dashboard
   - Create templates → Use in extension

