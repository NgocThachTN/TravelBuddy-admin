# SP26SE116 — TravelBuddy – Platform for Connecting Backpackers in Vietnam

> **Vietnamese name:** TravelBuddy – Nền tảng cộng đồng kết nối và tìm kiếm bạn bè phượt bụi tại Việt Nam  
> **Project code (abbrev.):** SP26SE116  
> **Class duration:** 01/01/2026 → 30/04/2026

---

## 1. Project Register

### 1.1 Supervisor

| Role | Full name | Email | Title |
| --- | --- | --- | --- |
| Supervisor | Lê Thị Quỳnh Chi | chiltq6@fe.edu.vn | Mrs. |

### 1.2 Student Team

| No. | Full name | Student code | Phone | Email | Role |
| --- | --- | --- | --- | --- | --- |
| 1 | Đào Trọng Tiến | SE173325 | 0398790007 | tiendtse173325@fpt.edu.vn | Leader |
| 2 | Phạm Thị Thanh Ngân | SE184030 | 0968491340 | nganpttse184030@fpt.edu.vn | Member |
| 3 | Hoàng Hồng Quân | SE173369 | 0388319705 | quanhhse173369@fpt.edu.vn | Member |
| 4 | Trương Nguyễn Ngọc Thạch | SE180664 | 0862648911 | thachtnnse180664@fpt.edu.vn | Member |

---

## 2. Context & Problem Statement

The Travel Buddy project was conceived against the backdrop of the Vietnamese tourism market, which is witnessing a surge in the trend of group backpacking. Despite the rapidly growing demand, current trip organization and management processes remain inefficient due to fragmentation across social media platforms such as Facebook and Zalo, making it difficult to consolidate information. Furthermore, existing travel applications primarily cater to the traditional tourism segment (booking flights, hotels, and package tours) and fail to adequately address the specific, flexible needs of the backpacking community.
Specific challenges facing organizers and participants include:
Fragmentation: Participant recruitment and communication are scattered across multiple channels without a centralized hub.
Operational Inefficiency: Itineraries and checklists are often shared in static formats (images, messages), reducing usability for new members.
Disorganized Expense Logging: Expenditures during the trip (fuel, food, fees) are currently noted down haphazardly in chats or memory. It is difficult to keep a clear, unified history of who paid for which specific items along the journey.
Information Gaps: Critical safety data and community knowledge are siloed in social feeds, lacking integration with mapping services.
Lack of Emergency Support: Backpackers frequently encounter vehicle breakdowns (e.g., flat tires, engine failure) on long, remote routes. Finding a reliable repair shop or rescue service in unfamiliar areas is extremely difficult and stressful, as this local information is rarely available or updated on standard map applications.
TravelBuddy aims to address these gaps by offering a platform where users can create community-based backpacking trips, recruit participants, log trip expenses, build a social map of community-verified checkpoints, and integrate a network of service partners to assist with vehicle repairs and emergency rescue.

---

## 3. Proposed Solution

The TravelBuddy platform is a mobile ecosystem connecting **backpackers**, **service partners**, and **administrators**, consolidating trip organization, community mapping, and rescue services.

### 3.1 Core Modules

- **Collaborative Trip Management**: Digitizes backpacking trip organization: create detailed itineraries, recruit participants, run consensus-based updates (member voting for itinerary changes), and maintain a centralized expense log for financial transparency.
- **Social Mapping & Discovery**: Community-driven discovery: smart filters for finding trips and a crowdsourced social map where users share verified checkpoints (e.g., viewpoints, safety warnings) enriched with photos and tips.
- **Vehicle Rescue Network (Service Partners)**: Location-based support on remote routes: travelers can locate nearby mechanics via GPS, chat/coordinate, and request on-demand rescue services when breakdowns occur.
- **Administration & Community Safety**: Moderation and safety operations: moderators handle reports and remove unsafe content/trips; administrators approve service partners, manage accounts, and configure platform fees and subscription packages.

> **Scope note (Vehicle Rescue):** The Vehicle Rescue module is designed as a **location-based service connector** (discovery + communication). It does **not** handle payments or enforce service guarantees.

---

## 4. Functional Requirements (High-Level)

### 4.1 Traveler (includes Trip Leader / Planner capabilities)

- Register/login via email, phone number, or social accounts.
- Create and update personal profile (avatar, short bio, backpacking/ riding/ trekking experience level).
- Browse, search, and filter community-created backpacking trips.
- View trip details including itinerary, checkpoints on the map, expected shared cost breakdown.
- Request to join trips and confirm participation (subject to trip leader approval if needed).
- Receive notifications on deadlines, itinerary changes, new messages, and trip status updates.
- Join trip group chat to discuss plans, equipment, and logistics.
- Access trip itinerary and checkpoints in both list and map views.
- Save favorite trips and checkpoints to a personal wishlist.
- Create social posts with images, GPS location, description, and tags (e.g., “camping spot”, “photo view”, “dangerous curve”).
- Interact with other users’ posts via likes, comments, and sharing.
- Rate and review trips after completing a trip.
- Create new trips with full itinerary details: trip description, checkpoints, estimated distance, and images.
- Configure participant settings (minimum/maximum participants, registration deadline, experience requirements, notes about equipment or safety).
- Define shared expense categories and estimated total/shared costs; view estimated per-person cost based on planned number of participants.
- Review and approve or reject join requests from travelers.
- Manage participant list (add/remove participants, mark participants as “confirmed”).
- Update trip details, route, checkpoints, and cost estimates based on member voting.
- Manage trip status (Draft, Recruiting, Almost Full, Full, Completed, Canceled).
- Manage communication in the trip group chat (announce rules, schedule changes, meeting points).
- Share trip via common channels (Facebook, Zalo, Messenger, etc.) to recruit participants from existing communities.
- Discover nearby vehicle rescue service partners based on GPS location.
- Send rescue requests with breakdown location and issue description.
- Chat with service partners to discuss availability and estimated service fees.
- Rate and review vehicle rescue services after completion.
- A map of checkpoints and suggested locations from various travelers
- AI-based trip and checkpoint recommendation using rule-based filtering and ranking (Optional):
- - Matching trips by location, date range, and experience level.
- - Highlighting trips similar to those previously joined or saved by the traveler.
- - Suggesting checkpoints based on popularity and proximity to the selected route or current location.
- The real-time map shows the location of the members during the trip (Optional)

### 4.2 Moderator

- Disable trips that violate platform policies or safety rules.
- Moderate community content (posts, images, checkpoints, comments) and remove inappropriate, unsafe, or spam content.
- Handle user reports and complaints related to trips, users, or content.
- Access analytics on users, trips, popular destinations, and frequently visited checkpoints to support platform improvement.

### 4.3 Administrator

- Manage user accounts (view, lock/unlock accounts, reset access if necessary).
- Approve the service partner registration request.
- Manage service partner (view, lock/unlock accounts, reset access if necessary)
- Manage service partner fee of platform
- Manage subscription packages (pricing, duration, feature access).

### 4.4 Service Partner

- The Service Partner module is designed as a location-based service connector, not a           full-service transaction platform:
- Register to provide rescue services on the platform
- Define the vehicle rescue services they provide.
- Receive on-location rescue support requests from travelers
- Chat to discuss and confirm the service fee with travelers
- View and reply feedback from traveler
- Receive customer info and breakdown location

---

## 5. Non-Functional Requirements

- The web interface must be responsive and optimized for desktop and tablet.
- The mobile app must be user-friendly, easy to use, support Android (priority), and be extensible to iOS.
- The system must process user actions with low latency (expected < 3 seconds for main actions such as creating trips, joining trips, loading maps, and posting content).
- Ensure integrity and consistency of user profiles, trips, checkpoints, comments, ratings, and other social interactions.
- Enforce strict role-based access control between Traveler/Moderator/Service Partner and Admin.
- Support scalability to handle growing numbers of users, trips, images, and map checkpoints, and allow integration of additional services (e.g., recommendation engines, external map APIs) without major impact on the system architecture.

---

## 6. Main Proposal Content

### 6.1 Theory & Practice (Documentation)

- Students will apply **Agile development processes** and **UML 2.0** for system analysis and design.
- The documentation set includes:
  - User Requirements Specification (URS)
  - Software Requirements Specification (SRS)
  - Architecture Design
  - Detailed Design
  - System Implementation Plan
  - Testing Documentation
  - Installation Manual

### 6.2 Tech Stack

- **Mobile App:** Flutter  
- **Web App:** Next.js  
- **Backend:** ASP.NET Web API  
- **Database:** PostgreSQL  
- **Cache:** Redis  
- **Cloud & DevOps:**
  - Firebase/Auth0 (authentication + 2FA)
  - Docker
  - GitHub Actions (CI/CD)
  - Hosting: Vercel + Ubuntu Server VPS
- **Map & Location Services:**
  - Google Maps Platform (or equivalent) for routes and checkpoints

### 6.3 Products

- Traveler & Service Partner mobile application (Android-first) for trip planning, participation, and social sharing.
- Admin web dashboard for user, trip, and content management.
- Core business logic modules (trip management, participant management, cost estimation, notification engine, group chat).
- Social map and content-sharing modules (checkpoints, posts, photos, comments, reactions).
- Optional rule-based recommendation helpers for trip discovery and checkpoint suggestion, using predefined filtering and ranking rules (if time permits).

### 6.4 Proposed Task Packages

- Task Package 1: Requirement analysis, use case modeling, ERD, and architecture design.
- Task Package 2: Admin & Moderator web dashboard development (user, trip, and content management).
- Task Package 3: Traveler & Service Partner mobile app development (authentication, trip browsing, trip details, join/cancel flow).
- Task Package 4: Core logic implementation (trip creation, participant management, cost estimation, notifications, group chat).
- Task Package 5: Social map and community features (checkpoints, posts, photo uploads, comments, reactions).
- Task Package 6: Deployment & testing (integration testing, system testing, UAT).
- Task Package 7: Final documentation, packaging, and release.

---

## 7. Use Case List (v1.0 — 2026-02-03)

This section consolidates system use cases and difficulty ratings.

### 7.1 Difficulty Legend

- **Low:** Simple UI action / read-only / basic CRUD with minimal validation.
- **Medium:** Multi-step workflow, approvals, status updates, or non-trivial validation.
- **High:** Complex automation or integrations (payments/webhooks), geo/radius validation, waitlist promotion, voting workflows, or auditing/export.

### 7.2 Use Case Summary

| Section | Low | Medium | High |
| --- | --- | --- | --- |
| Traveler | 19 | 44 | 14 |
| Service Partner | 0 | 21 | 0 |
| Moderator | 0 | 12 | 0 |
| Administrator | 0 | 32 | 5 |

### 7.3 Traveler Use Cases

| ID | Use Case Name | Difficulty |
| --- | --- | --- |
| UC-TR-01 | Register / Log in | Medium |
| UC-TR-02 | Create / Update user profile | Medium |
| UC-TR-03 | Browse trips | Low |
| UC-TR-04 | Search & filter trips | Low |
| UC-TR-05 | View trip details | Low |
| UC-TR-06 | Submit a join request | Medium |
| UC-TR-07 | Cancel a pending join request | Medium |
| UC-TR-08 | Receive trip notifications | Low |
| UC-TR-09 | Join and use trip group chat | Medium |
| UC-TR-10 | View itinerary in list view | Low |
| UC-TR-11 | View itinerary on map view | Low |
| UC-TR-12 | Manage wishlist | Medium |
| UC-TR-13 | Create a community post | Medium |
| UC-TR-14 | Interact with posts | Medium |
| UC-TR-15 | Submit a post-trip review | Medium |
| UC-TR-16 | Create a new trip | Medium |
| UC-TR-17 | Configure participant settings | Medium |
| UC-TR-18 | Define shared expenses | Medium |
| UC-TR-19 | Review join requests | Medium |
| UC-TR-20 | Manage trip participants | Medium |
| UC-TR-21 | Update via member voting | Medium |
| UC-TR-22 | Manage trip status/lifecycle | Medium |
| UC-TR-23 | Post announcements | Medium |
| UC-TR-24 | Share a Trip | Medium |
| UC-TR-25-01 | View Nearby Rescue/Repair Services List | Low |
| UC-TR-25-02 | View Nearby Rescue/Repair Services on Map | Low |
| UC-TR-25-03 | Search/Filter Rescue/Repair Services | Low |
| UC-TR-25-04 | View Rescue/Repair Service Details | Low |
| UC-TR-25-05 | Submit a Rescue/Repair Request | Medium |
| UC-TR-25-06 | Track Rescue/Repair Request Status | Medium |
| UC-TR-26-01 | View Rescue/Repair Service Ratings & Reviews | Medium |
| UC-TR-26-02 | Rate a Rescue/Repair Service | Medium |
| UC-TR-26-03 | Write a Review for a Rescue/Repair Service | Medium |
| UC-TR-27-01 | View Checkpoints & Suggested Locations Map | Low |
| UC-TR-27-02 | Search/Filter Checkpoints & Suggested Locations | Low |
| UC-TR-27-03 | View Checkpoint/Suggested Location Details | Low |
| UC-TR-28-01 | View Personalized Trip Recommendations (Optional) | Low |
| UC-TR-28-02 | Update Preferences for Trip Recommendations (Optional) | Medium |
| UC-TR-29-01 | View Real-Time Trip Member Location Map (Optional) | Low |
| UC-TR-29-02 | Enable Real-Time Location Sharing (Optional) | Medium |
| UC-TR-29-03 | Disable Real-Time Location Sharing (Optional) | Medium |
| UC-TR-29-04 | View a Member’s Location Details (Optional) | Low |
| UC-TR-30 | Join waitlist when trip is full | High |
| UC-TR-31 | Accept waitlist promotion within hold window | High |
| UC-TR-32 | Leave waitlist / cancel waitlist entry | High |
| UC-TR-33 | View waitlist position and status | High |
| UC-TR-34 | Create a checkpoint / suggested location | Medium |
| UC-TR-35 | Edit or delete my checkpoint | Medium |
| UC-TR-36 | Add or remove media for a checkpoint | Medium |
| UC-TR-37 | Add an actual expense entry | Medium |
| UC-TR-38 | Edit or delete an expense entry | Medium |
| UC-TR-39 | View settlement summary & export | High |
| UC-TR-40 | Submit a report on content/user/service partner | Medium |
| UC-TR-41 | View my submitted reports and status history | Medium |
| UC-TR-42 | Create a support ticket | Medium |
| UC-TR-43 | Reply to a support ticket & upload attachments | Medium |
| UC-TR-44 | View/close a support ticket | Low |
| UC-TR-45 | View subscription packages (traveler) | Low |
| UC-TR-46 | Purchase a subscription package | High |
| UC-TR-47 | View billing history & payment status | Medium |
| UC-TR-48 | Cancel subscription / stop auto-renew | High |
| UC-TR-49 | Verify email address | Medium |
| UC-TR-50 | Reset password via email token | Medium |
| UC-TR-51 | Manage active sessions (logout / logout all) | Medium |
| UC-TR-52 | Link/unlink social login provider | Medium |
| UC-TR-53 | View notifications inbox & mark as read | Low |
| UC-TR-54 | Update notification preferences & quiet hours | Medium |
| UC-TR-55 | Register device for push notifications | High |
| UC-TR-56 | Open an attendance session (leader) | High |
| UC-TR-57 | Check in attendance (participant) | High |
| UC-TR-58 | View attendance results (leader) | High |
| UC-TR-59 | Create a checkpoint change request | High |
| UC-TR-60 | Vote on a checkpoint change request | High |
| UC-TR-61 | View checkpoint change history & voting results | High |
| UC-TR-62 | Manage my address (select ward, update details) | Medium |
| UC-TR-63 | Manage social links (add/edit/remove/sort) | Medium |
| UC-TR-64 | Create/revoke a share link for a trip/post | Medium |
| UC-TR-65 | Send messages in trip group chat (text) | Medium |
| UC-TR-66 | Send media attachments in trip group chat (image/video/audio/file) | High |
| UC-TR-67 | Edit / delete my trip chat messages | Medium |
| UC-TR-68 | Pin / unpin announcements in trip group chat (Host/Lead) | Medium |
| UC-TR-69 | Report a trip chat message | Low |
| UC-TR-70 | View wallet balance and transaction history | Medium |
| UC-TR-71 | Top up wallet (SePay / other payment provider) | High |
| UC-TR-72 | Pay / freeze trip deposit when joining a deposit-required trip | High |
| UC-TR-73 | Manage bank accounts for refunds (add/verify/set default) | Medium |

### 7.4 Service Partner Use Cases

| ID | Use Case Name | Difficulty |
| --- | --- | --- |
| UC-SP-01 | Submit service partner registration request | Medium |
| UC-SP-02 | Check service partner registration status | Medium |
| UC-SP-03 | Define rescue service offerings | Medium |
| UC-SP-04 | Receive rescue requests (routed by system) | Medium |
| UC-SP-05 | View rescue request list | Medium |
| UC-SP-06 | View rescue request details | Medium |
| UC-SP-07 | Chat with traveler about a rescue request | Medium |
| UC-SP-08 | Propose / update service fee for a request | Medium |
| UC-SP-09 | Confirm agreed service fee (partner side) | Medium |
| UC-SP-10 | View customer information for a request | Medium |
| UC-SP-11 | View breakdown location for a request | Medium |
| UC-SP-12 | Manage service catalog (update/remove services) | Medium |
| UC-SP-13 | Enforce locked-account restriction (partner cannot operate) | Medium |
| UC-SP-14 | View offered services while handling a request | Medium |
| UC-SP-15 | View fee discussion history / fee records per request | Medium |
| UC-SP-16 | Receive only matching requests (routing by defined services) | Medium |
| UC-SP-17 | Receive new rescue request alerts/notifications | Medium |
| UC-SP-18 | Access only own partner data (RBAC) | Medium |
| UC-SP-19 | View feedback threads (feedback + replies) | Medium |
| UC-SP-20 | Ensure partner chat/replies follow moderation policies | Medium |
| UC-SP-21 | Pay partner fee & view invoices/period | Medium |
| UC-SP-22 | View partner revenue analytics (rollups by day/week/month/year) | Low |

### 7.5 Moderator Use Cases

| ID | Use Case Name | Difficulty |
| --- | --- | --- |
| UC-MO-01 | Manage Content Reports | Medium |
| UC-MO-02 | Manage Trip Post Reports | Medium |
| UC-MO-03 | Manage Social Post Reports | Medium |
| UC-MO-04 | Manage Map Checkpoint Reports | Medium |
| UC-MO-05 | Take Moderation Action | Medium |
| UC-MO-06 | Hide Removed Content Across All Views | Medium |
| UC-MO-07 | Hide Content from Feeds | Medium |
| UC-MO-08 | Hide Content from Trip Details | Medium |
| UC-MO-09 | Hide Content from Maps | Medium |
| UC-RPT-01 | View Reports List | Medium |
| UC-RPT-02 | View Report Detail | Medium |
| UC-RPT-03 | Update Report Resolution Status | Medium |
| UC-MO-10 | Review AI moderation queue (flagged content) | Medium |
| UC-MO-11 | Decide moderation outcome (approve/reject/hide/needs edit) | Medium |

### 7.6 Administrator Use Cases

| ID | Use Case Name | Difficulty |
| --- | --- | --- |
| UC-AD-01 | View subscription packages (list) | Medium |
| UC-AD-02 | View subscription package details | Medium |
| UC-AD-03 | Disable a subscription package | Medium |
| UC-AD-04 | View user accounts | Medium |
| UC-AD-05 | Lock user account | Medium |
| UC-AD-06 | Unlock user account | Medium |
| UC-AD-07 | Reset user access | Medium |
| UC-AD-08 | Review service partner registration requests | Medium |
| UC-AD-09 | Approve service partner registration | Medium |
| UC-AD-10 | Reject service partner registration | Medium |
| UC-AD-11 | View service partner accounts | Medium |
| UC-AD-12 | Lock service partner account | Medium |
| UC-AD-13 | Unlock service partner account | Medium |
| UC-AD-14 | Reset service partner access | Medium |
| UC-AD-15 | Define service partner fee rules | Medium |
| UC-AD-16 | Update service partner fee rules | Medium |
| UC-AD-17 | View service partner fee settings | Medium |
| UC-AD-18 | Create subscription package | Medium |
| UC-AD-19 | Update subscription package pricing | Medium |
| UC-AD-20 | Update subscription package duration | Medium |
| UC-AD-21 | Update subscription package feature access | Medium |
| UC-AD-22 | Manage Account Reports | Medium |
| UC-AD-23 | Manage Financial Reports | Medium |
| UC-AD-24 | Manage Service Partner Fee Reports | Medium |
| UC-AD-25 | Manage Traveler Subscription Reports | Medium |
| UC-AD-26 | Take Administrative Action (from account report) | Medium |
| UC-AD-27 | Take Financial Configuration Action (from finance report) | Medium |
| UC-AD-28 | Manage report reasons (create/enable/disable) | Medium |
| UC-AD-29 | Manage support ticket categories | Medium |
| UC-AD-30 | Handle support tickets (assign/respond/resolve) | Medium |
| UC-AD-31 | Monitor billing orders & payment transactions | High |
| UC-AD-32 | Review payment webhook events (idempotency/duplicates) | High |
| UC-AD-33 | Process refunds (approve/reject/complete) | High |
| UC-AD-34 | View/export audit logs | High |
| UC-AD-35 | Manage social platforms master data | Medium |
| UC-AD-36 | Manage favorites & tags master data | Medium |
| UC-AUD-01 | Audit Action | High |
| UC-AD-37 | Manage system settings (feature flags, thresholds, defaults) | Medium |
| UC-AD-38 | Monitor wallet top-ups and billing orders (reconcile payments) | High |
| UC-AD-39 | Manage content scan results and AI moderation tasks | High |
| UC-AD-40 | Issue/void user strikes and enforce account lock policy | High |
| UC-AD-41 | View partner revenue rollups and operational dashboards | Medium |
