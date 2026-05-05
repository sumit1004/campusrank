# CampusRank - Comprehensive Technical Documentation

## 1. Project Overview
**CampusRank** is a full-stack, role-based web application designed to gamify and track university student achievements. It serves as a centralized platform where students can participate in university events, upload achievement certificates, and earn experience points (XP). These points contribute to a dynamic, campus-wide leaderboard. The platform supports three distinct roles: Students, Club Admins, and SuperAdmins, each with tailored interfaces and capabilities.

## 2. Problem Statement
In large educational institutions, tracking student extracurricular participation is often fragmented across different clubs and departments. Students lack a unified portfolio to showcase their achievements, and administrators struggle to verify participation manually. Existing systems rely heavily on manual data entry, disconnected Google Forms, and unverified paper certificates, leading to duplicate records, slow verification processes, and a lack of student engagement.

## 3. Solution Explanation
CampusRank solves these issues by introducing a centralized, gamified ecosystem:
*   **Centralized Tracking**: A single source of truth for all student activities via the `event_participation` system.
*   **Gamification**: Students earn XP and Badges for participating in and winning events, fostering healthy competition through a real-time leaderboard.
*   **Automated Verifications**: Club Admins can generate verifiable "E-Certificates" in bulk, which automatically sync with the student's XP without manual approval.
*   **Streamlined Event Management**: A built-in dynamic forms builder allows clubs to host registrations, manage team vs. solo events, and export participant data effortlessly.
*   **Robust Security & Integrity**: Idempotent database operations and unique composite keys prevent students from claiming points multiple times for the same event.

---

## 4. System Architecture
CampusRank follows a classic client-server architecture with a heavy emphasis on data integrity and read-optimized caching for the leaderboard.

*   **Frontend (Client)**: A React Single Page Application (SPA) built with Vite, styled heavily with TailwindCSS and Framer Motion for a "glassmorphic", premium dark-mode aesthetic.
*   **Backend (API)**: A Node.js/Express RESTful API handling authentication, business logic, file processing, and PDF generation.
*   **Database**: A relational MySQL database designed with strict foreign key constraints, cascading deletes, and unique indices to maintain data consistency.
*   **State & Caching**: Employs a database-level caching table (`leaderboard_cache`) to serve high-traffic leaderboard requests in $O(1)$ time, falling back to live calculation only on cache misses.

---

## 5. Tech Stack
### Frontend
*   **React 19 & Vite**: For fast builds and modern component-based architecture.
*   **TailwindCSS**: For rapid, highly customized utility-first styling.
*   **React Router DOM v7**: For client-side routing and protected route wrappers.
*   **Framer Motion**: For smooth micro-animations and page transitions.
*   **Axios**: Configured with interceptors for seamless JWT injection.
*   **Lucide-React**: For scalable vector icons.

### Backend
*   **Node.js & Express.js**: Lightweight, high-performance web server.
*   **MySQL2**: Promise-based MySQL client for executing complex SQL queries.
*   **Bcrypt & JSONWebToken (JWT)**: For secure password hashing and stateless authentication.
*   **Multer**: For handling multipart/form-data (manual certificate uploads and Excel bulk uploads).
*   **Puppeteer**: A headless browser engine used to render HTML templates into pixel-perfect PDF E-Certificates.
*   **ExcelJS & XLSX**: For parsing uploaded Excel sheets and exporting event registration data.
*   **Helmet & Express-Rate-Limit**: For fundamental API security and DDOS mitigation.

---

## 6. Complete Feature Breakdown

### 6.1 Authentication (JWT Login/Signup Flow)
*   **What it does**: Handles user onboarding, login, and stateless session management.
*   **How it works**:
    *   **Signup**: Validates inputs, checks for existing ERP/Email, hashes the password via `bcrypt` (10 rounds), and inserts the user with a default `student` role.
    *   **Login**: Verifies credentials, generates a JWT containing `id`, `role`, and `club_id` (expires in 30 days).
    *   **Frontend Interceptor**: Axios automatically attaches the `Bearer <token>` to all protected API calls. If a 401 response is detected, the user is automatically logged out and redirected.

### 6.2 Role-Based Access Control (RBAC)
*   **Roles**: `student`, `admin` (Club Admin), `superadmin`.
*   **Implementation**: 
    *   **Backend**: The `authorize(...roles)` middleware blocks unauthorized API access based on the decoded JWT payload.
    *   **Frontend**: The `<RoleRoute>` wrapper conditionally renders UI components or redirects users if their role doesn't match the required array of allowed roles.

### 6.3 Certificate Upload System (Manual)
*   **What it does**: Allows students to manually upload proofs of achievement (images/PDFs) for events not hosted on the platform.
*   **Implementation**: Uses `multer` to save the file locally in `/uploads`. A record is created in the `certificates` table with status `pending`. A unique composite check ensures a student cannot upload multiple certificates for the same `(user_id, club_id, event_name, event_date)`.

### 6.4 Admin Verification Workflow
*   **What it does**: Allows Club Admins to review and approve/reject manual certificates submitted to their club.
*   **Logic**: 
    *   Uses a MySQL `FOR UPDATE` transaction lock to prevent race conditions during approval.
    *   On approval, points are calculated based on position (Winner: 50, RunnerUp1: 35, RunnerUp2: 20, Participant: 10).
    *   Updates the certificate status, injects a record into the central `event_participation` table using `INSERT IGNORE` (to prevent duplicate points if already verified), updates the user's `total_points`, updates the `leaderboard_cache`, and sends an in-app notification.

### 6.5 Bulk E-Certificate Generation
*   **What it does**: Club Admins can generate hundreds of PDF certificates instantly by pasting CSV data or uploading an Excel sheet.
*   **Implementation**:
    *   Parses CSV/Excel data to extract ERPs. Looks up user details in the DB to ensure accurate data.
    *   Passes data to `puppeteer` which renders a custom HTML template overlaid on a static high-res background (`winner_bg.png` or `participant_bg.png`).
    *   Generates a unique ID (e.g., `CR-12345-ABCD`) and a QR code linking to the live verification page.
    *   Saves the PDF locally, inserts into `e_certificates`, and strongly inserts/updates `event_participation` with `ON DUPLICATE KEY UPDATE` to overwrite any manual records, ensuring the E-Cert is the definitive source of truth.

### 6.6 Centralized Points Calculation (`event_participation`)
*   **Why it is required**: To prevent double-counting. If a student uploads a manual certificate and later receives an E-Certificate for the exact same event, they should not get double points.
*   **Implementation**: The `event_participation` table has a `UNIQUE KEY unique_event (user_id, club_id, event_name, event_date)`. It acts as the absolute ledger. A user's `total_points` is always calculated as `SUM(points) FROM event_participation`.

### 6.7 Dynamic Forms System
*   **What it does**: Allows admins to create custom registration forms for events (Solo or Team).
*   **Implementation**:
    *   **Creation**: Admins define forms with standard fields (Name, ERP, Email) and add custom fields (Text, Number, Dropdowns). Data is stored relationally in `forms` and `form_fields`.
    *   **Submission**: Validates that all required fields are present. If it's a team event, fields marked `apply_to='leader'` are only required for member 1. Submissions are stored flatly in `submission_data` mapped by `member_index`.
    *   **Auto-Close**: A `setInterval` job in `server.js` runs every hour to mark forms past their `end_date` as `closed`.
    *   **Export**: Uses `ExcelJS` to pivot flat `submission_data` into a wide Excel format for easy admin downloading.

### 6.8 Leaderboard & Ranking Algorithm
*   **Ranking Algorithm**: Users are ranked based on total points. Ties are broken using a strictly defined logic:
    1.  Highest `total_points` (DESC)
    2.  Earliest `first_achievement_date` (ASC) - Who got points first?
    3.  Earliest `min_submission_at` (ASC) - Who submitted proof first?
    4.  Lowest `user_id` (ASC) - Absolute fallback.
*   **Implementation**: Uses SQL Window Functions (`ROW_NUMBER() OVER (...)`).

### 6.9 Caching Architecture (`leaderboard_cache`)
*   **Problem**: Calculating the leaderboard on the fly using complex Window Functions across thousands of records is $O(N \log N)$ and database-intensive.
*   **Solution**: A physical cache table (`leaderboard_cache`).
    *   When an admin approves a cert or issues an E-Cert, `refreshLeaderboardCache()` is called. It uses `INSERT ... ON DUPLICATE KEY UPDATE` to quickly aggregate user points by month/year.
    *   The `/api/leaderboard` endpoint always reads from this cache. If the cache is empty, it triggers a live fallback query and warms the cache in the background.

### 6.10 Dashboard Aggregation Logic
*   **What it does**: Fetches a massive payload of unified user data efficiently for the frontend Dashboard.
*   **Implementation**: The `getUserProfile` controller executes parallel optimized SQL queries to fetch:
    *   User info, rank, and total points.
    *   Combined list of manual certificates and E-Certificates, cross-referenced with `event_participation` to determine if a certificate's points were actually "counted" or overridden.
    *   Monthly XP accumulation stats for the Framer Motion bar chart.
    *   Recent activity logs.

### 6.11 Notification System
*   **Implementation**: A simple `notifications` table tracks messages. The `createNotification` utility is injected across controllers (e.g., upon cert approval, rejection, or form registration) to generate 'success', 'info', or 'warning' alerts.

### 6.12 Badge System
*   **Implementation**: A pure functional utility (`badgeHelper.js`) translates raw points into visually distinct tiers (Elite >= 1500, Level 3 >= 1000, Level 2 >= 800, Level 1 >= 500) for UI flair.

---

## 7. Page-Wise Frontend Explanation

### 1. Landing (`/`)
*   **Purpose**: Public-facing introduction to CampusRank.
*   **Components**: Hero section with staggered Framer Motion animations, feature highlights, and Call-to-Action buttons redirecting to Login/Signup.

### 2. Login & Signup (`/login`, `/signup`)
*   **Purpose**: User authentication.
*   **Data Flow**: Submits form data via Axios to `/api/auth/login` or `signup`. On success, stores the JWT and basic user data in `AuthContext` state and `localStorage`, then dynamically redirects based on role (SuperAdmin $\rightarrow$ `/superadmin-dashboard`, Admin $\rightarrow$ `/admin-dashboard`, Student $\rightarrow$ `/dashboard`).

### 3. Student Dashboard (`/dashboard`)
*   **Purpose**: The central hub for a student to view their progress.
*   **Components**:
    *   **Hero Card**: Displays Name, ERP, Campus Rank (fetched dynamically), and a link to the leaderboard.
    *   **Growth Pattern Chart**: A custom bar chart built with Framer Motion `height` animations showing XP earned per month.
    *   **Manual Upload Status**: A tracker showing counts of pending/approved certs and a table of submission history.
    *   **Verified Digital Assets**: A grid of generated E-Certificates with download buttons.

### 4. Admin Dashboard (`/admin-dashboard`)
*   **Purpose**: Command center for Club Admins.
*   **Components**: Displays top-level analytics (Total, Pending, Approved certs for their club). Provides a data table to view pending manual uploads, allowing inline Approval (with optional point overrides) or Rejection.

### 5. SuperAdmin Dashboard (`/superadmin-dashboard`)
*   **Purpose**: Global system management.
*   **Components**: Controls for assigning/revoking Admin roles to students, creating new clubs, deleting users, and viewing global analytics across all clubs.

### 6. Event Registration (`/events`)
*   **Purpose**: Allows students to browse and register for club events.
*   **Data Flow**: Fetches active forms and the user's submission status. Clicking a form opens the `FormFillView` component, which dynamically renders inputs based on the form's `form_fields` schema. Handles complex state for multi-member (team) submissions.

### 7. Leaderboard (`/leaderboard`)
*   **Purpose**: Displays the global or club-specific rankings.
*   **Features**: Includes filters for All-Time, Monthly, and Yearly timeframes. Includes pagination logic. Highlights the top 3 users with special trophy iconography.

### 8. Upload Certificate (`/upload`)
*   **Purpose**: Form for manual proof submission. Uses standard multipart form data to submit files to the backend.

### 9. Admin Forms (`/admin-forms`)
*   **Purpose**: Form builder interface for Admins.
*   **Features**: Includes an intuitive UI to add custom fields (text, number, select options), set team sizes, and define deadlines. Also provides the interface to download Excel exports of registered students.

### 10. Verify Certificate (`/verify/:id`)
*   **Purpose**: A public route (no auth required) where anyone scanning a certificate QR code lands. It queries the backend with the `certId` to confirm authenticity.

---

## 8. Database Design

### Core Tables
1.  **`users`**: Stores all accounts.
    *   Fields: `id`, `name`, `erp` (UNIQUE), `email` (UNIQUE), `password`, `role` (ENUM), `total_points`, `club_id` (FK to clubs).
2.  **`clubs`**: Dictionary table for university clubs.
3.  **`certificates`**: Stores manual student uploads.
    *   Fields: `file_url`, `status` (pending/approved/rejected), `points`.
4.  **`e_certificates`**: Stores auto-generated PDF records.
5.  **`event_participation`**: **The core ledger for points.**
    *   Fields: `user_id`, `club_id`, `event_name`, `event_date`, `source` (manual/e_certificate), `points`.
    *   Constraint: `UNIQUE KEY unique_event (user_id, club_id, event_name, event_date)` ensures idempotency.

### Forms & Events Tables
6.  **`forms`**: Master record for an event registration.
7.  **`form_fields`**: Defines the schema for a specific form (type, options, required, apply_to).
8.  **`submissions`**: A single registration instance (links a `form_id` to a `user_id`).
    *   Constraint: `UNIQUE KEY unique_registration (form_id, user_id)`.
9.  **`submission_data`**: The actual key-value answers. Flat structure using `field_id`, `value`, and `member_index` (for teams).

### Auxiliary Tables
10. **`leaderboard_cache`**: Aggregates `event_participation` for lightning-fast leaderboard queries.
11. **`activity_logs`**: Audit trail for admin actions.
12. **`notifications`**: User inbox messages.

---

## 9. Algorithms & Core Logic

### The Idempotent Points System
To solve the issue of a student getting duplicate points (e.g., they manually upload a winning photo, and the admin later bulk-generates an E-Cert for that event), the system relies on `event_participation`.
*   When a manual cert is approved, the backend executes `INSERT IGNORE INTO event_participation`. If an E-Cert record already exists, the manual entry is ignored.
*   When an E-Cert is generated, it executes `INSERT ... ON DUPLICATE KEY UPDATE ... source = 'e_certificate'`. E-Certs are treated as the highest source of truth and will overwrite manual points if a collision occurs.
*   User `total_points` is always a hard recalculation: `UPDATE users SET total_points = (SELECT SUM(points) ...)`.

---

## 10. API Documentation (Key Endpoints)

| Endpoint | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Public | Registers a new student. |
| `/api/auth/login` | `POST` | Public | Authenticates and returns JWT. |
| `/api/users/profile` | `GET` | Student | Fetches unified dashboard aggregation. |
| `/api/leaderboard` | `GET` | Public | Fetches paginated leaderboard data (hits cache). |
| `/api/certificates/upload` | `POST` | Student | Multipart upload for manual certificates. |
| `/api/certificates/bulk-generate`| `POST` | Admin | Accepts CSV/Excel, generates PDFs, awards points. |
| `/api/admin/approve/:id` | `PUT` | Admin | Approves a manual cert, calculates/awards points. |
| `/api/forms` | `POST` | Admin | Creates a new dynamic event form. |
| `/api/forms/:id/submit` | `POST` | Student | Submits form answers (validates team indices). |
| `/api/forms/:id/export` | `GET` | Admin | Generates and downloads an `.xlsx` file of entries. |

---

## 11. Security Implementation

1.  **JWT Authentication**: Stateless, tamper-proof tokens signed with a strong `JWT_SECRET`.
2.  **Password Hashing**: `bcrypt` prevents plaintext password exposure in the database.
3.  **Role-Based Middleware**: `authorize('admin')` ensures students cannot hit admin API endpoints, even if they guess the URL.
4.  **Data Isolation**: Admins are strictly scoped to their `club_id`. They cannot view or approve certificates belonging to other clubs.
5.  **SQL Injection Protection**: All queries strictly use parameterized inputs (`?`) via `mysql2`.
6.  **Helmet**: Injects secure HTTP headers (e.g., `Cross-Origin-Resource-Policy`).
7.  **Rate Limiting**: `express-rate-limit` is configured to prevent brute force attacks on `/api/auth` (100 req/15min) and `/api/certificates` (30 req/1hr).

---

## 12. Performance Optimization

*   **Leaderboard Caching**: Using the `leaderboard_cache` table avoids running expensive `ROW_NUMBER()` window functions over the raw transaction ledger on every page load.
*   **Rank Caching**: A user's rank is queried dynamically from the aggregated cache rather than scanning the entire user base.
*   **Query Optimization**: Heavy queries utilize SQL `WITH` (Common Table Expressions) and `JOIN`s to return structured data in a single round-trip, avoiding the N+1 query problem (e.g., in `formService.getSubmissions`).
*   **Frontend State**: Data polling (every 60s on the dashboard) ensures freshness without overwhelming the server.

---

## 13. Error Handling & Edge Cases

*   **Global Error Middleware**: Catches unhandled exceptions, logs them, and returns a sanitized JSON response (`{ success: false, message: "..." }`) rather than an HTML stack trace.
*   **Duplicate Submissions**: Caught at the database level (`ER_DUP_ENTRY`) and gracefully handled with a user-friendly 409 Conflict message.
*   **Token Expiration/Tampering**: Caught by JWT verifier; returns 401 Unauthorized, prompting the frontend to purge local state and redirect to `/login`.
*   **Malformed CSV Uploads**: The bulk-generate controller safely skips empty lines and validates minimum column counts rather than crashing the loop.

---

## 14. Deployment Architecture

*   **Frontend**: Built with Vite (`npm run build`) and deployed to a static CDN (e.g., **Netlify** or Vercel). Environment variables define the `VITE_API_URL`.
*   **Backend**: A Node.js instance hosted on a PaaS (e.g., **Render** or Heroku). It serves the API and statically hosts the `/uploads` directory. Environment variables define DB credentials, JWT secret, and the `FRONTEND_URL` for QR code generation.
*   **Database**: A managed MySQL instance hosted on **Hostinger** (or AWS RDS), allowing remote connections from the Backend server.

---

## 15. Challenges Faced (Inferred)

1.  **The Double-Point Paradox**: Initially, if a student uploaded a manual certificate and the admin later uploaded bulk E-Certs, the student received points twice. This was solved by centralizing points in the `event_participation` table with strict Unique Keys and `ON DUPLICATE KEY UPDATE` logic.
2.  **Performance Degradation on Leaderboard**: As rows grew, sorting thousands of records to find a single user's rank became slow. Implemented a `leaderboard_cache` table that is incrementally refreshed asynchronously during write operations.
3.  **PDF Generation Consistency**: Rendering PDFs exactly the same way across different OS environments is difficult. Solved by using `puppeteer` to render a headless HTML page utilizing absolute CSS positioning over a static base64 background image, guaranteeing pixel-perfect results.
4.  **Complex Form Architectures**: Mapping relational flat tables (`submission_data`) into a wide format for Excel exports required complex nested loops and Map data structures in the backend to reconstruct the student entries accurately.

---

## 16. Future Scope

*   **Cloud Storage Integration**: Migrate local `/uploads` handling to AWS S3 or Firebase Storage to ensure true statelessness of the backend server, crucial for horizontal scaling.
*   **Real-time WebSockets**: Implement Socket.io to push real-time notifications and leaderboard updates to active clients without relying on polling.
*   **QR Code App**: Develop a mobile application for admins to scan student E-Certificates directly at events for instant attendance marking.
*   **SSO Integration**: Integrate university Google Workspace or Microsoft Entra ID for seamless Single Sign-On (SSO) login.

