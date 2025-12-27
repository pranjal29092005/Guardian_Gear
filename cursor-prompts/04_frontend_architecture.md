# GearGuard – Frontend Architecture (Excalidraw-Exact)(C:\projects\Odoo-adani-hackathon-2026\GearGuard_ The Ultimate Maintenance Tracker - 8 hours.png)

## FILE 5: 04_frontend_architecture.md

### PURPOSE OF THIS FILE
This document defines the **frontend UI architecture**, page structure, components, and state flow.

⚠️ CRITICAL:
- Every screen, table, button, and interaction MUST map 1:1 with the Excalidraw diagram.
- No extra UI pages.
- No missing screens.
- UI must clearly demonstrate the full maintenance lifecycle during demo.

This file is the **visual + interaction contract** of the system.

---

## 1. FRONTEND TECH STACK (ASSUMED)

- Framework: React (Vite)
- Styling: Tailwind CSS
- State: React Query / Context
- Routing: React Router Dom
- Drag & Drop: @dnd-kit or react-beautiful-dnd
- Calendar: FullCalendar
- Charts : Recharts / Chart.js

---

## 2. TOP-LEVEL PAGE STRUCTURE (FROM DIAGRAM)

```

/login
/dashboard
/equipment
/equipment/:id
/requests/kanban
/requests/calendar
/reports

```

⚠️ No other routes allowed.

---

## 3. GLOBAL LAYOUT (APPLIES TO ALL PAGES)

### Components
- Sidebar
- Top Navbar
- Main Content Area

### Sidebar Items (EXACT ORDER)
1. Dashboard
2. Equipment
3. Maintenance (Kanban)
4. Calendar
5. Reports

Sidebar visibility:
- All roles see same menu
- Actions are permission-controlled, not menu-controlled

---

## 4. LOGIN PAGE (TOP OF DIAGRAM)

### Components
- Email Input
- Password Input
- Login Button

### Behavior
- On success:
  - Store JWT
  - Store user + role
  - Redirect to `/dashboard`

---

## 5. DASHBOARD PAGE (CENTER ENTRY POINT)

### Purpose
Quick overview & navigation hub.

### Widgets (Minimal)
- Total Equipment count
- Open Maintenance Requests count
- Buttons:
  - “Create Maintenance Request”
  - “Go to Kanban”



---

## 6. EQUIPMENT LIST PAGE (LEFT SIDE OF DIAGRAM)

### Table Columns (Exact)
- Equipment Name
- Category
- Department
- Owner
- Location
- Status (Active / Scrap)

### Features
- Search by name
- Filter by:
  - Department
  - Category
  - Status

### Row Click
- Navigates to `/equipment/:id`

---

## 7. EQUIPMENT DETAIL PAGE (RIGHT SIDE OF DIAGRAM)

### Sections
1. Equipment Information Card
2. Maintenance Smart Button

---

### Maintenance Smart Button (CRITICAL)

Button label:
```

Maintenance (N)

```

Where:
- N = number of open requests

### On Click
- Navigate to:
```

/requests/kanban?equipmentId=:id

```

Kanban must auto-filter by equipment.

---

## 8. CREATE MAINTENANCE REQUEST (CENTER MODAL)

### Triggered From:
- Dashboard button
- Equipment page
- Calendar date click

---

### Form Fields (Exact)
- Subject (text)
- Equipment (dropdown)
- Type (Corrective / Preventive)
- Scheduled Date (only if Preventive)
- Description

### Auto-Fill Behavior
When Equipment selected:
- Maintenance Team auto-filled (hidden)
- Category auto-filled (hidden)

User must NOT manually select team.

---

## 9. KANBAN BOARD (CORE SCREEN)

Route:
```

/requests/kanban

```

---

### Columns (Exact Order)
1. New
2. In Progress
3. Repaired
4. Scrap

---

### Request Card UI
Each card shows:
- Subject
- Equipment Name
- Assigned Technician Avatar
- Overdue Indicator (red strip)

---

### Drag & Drop Rules
- Cards draggable only if user has permission
- On drop:
  - API call to update stage
  - Optimistic UI update
  - Rollback on error

---

### Card Actions
- Assign to Me (Technician)
- Enter Duration (when Repaired)
- Move to Scrap (confirmation required)

---

## 10. CALENDAR VIEW (BOTTOM OF DIAGRAM)

Route:
```

/requests/calendar

```

---

### Calendar Behavior
- Shows ONLY preventive requests
- Each event:
  - Title = Subject
  - Date = Scheduled Date

---

### Click on Date
- Opens Create Request modal
- Type auto-set to PREVENTIVE
- Date auto-filled

---

## 11. REPORT PAGE (OPTIONAL DIAGRAM BOX)

Route:
```

/reports

```

### Chart
- Requests per Team (Bar chart)

### Data
- Read-only
- Simple aggregation

---

## 12. STATE MANAGEMENT STRATEGY

### Global State
- Auth user
- JWT token
- Role
- Team IDs

### Server State
- Equipment
- Requests
- Teams

Use React Query:
- Cache requests
- Auto-refetch on mutation
- Improves Kanban UX

---

## 13. ROLE-BASED UI CONTROL

### UI Rules
- USER:
  - Cannot drag Kanban cards
- TECHNICIAN:
  - Can drag cards only for their team
- MANAGER:
  - Can drag any card

Enforce visually + via API.

---

## 14. WHY THIS FRONTEND WINS

- Exact match to Excalidraw
- No unnecessary UI
- Demo-friendly
- Clear flows
- Easy to explain to judges

Every click maps to a diagram arrow.

---

END OF FRONTEND ARCHITECTURE FILE
