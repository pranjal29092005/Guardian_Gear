# GearGuard – Backend API & Workflow Logic (Excalidraw-Aligned) (C:\projects\Odoo-adani-hackathon-2026\GearGuard_ The Ultimate Maintenance Tracker - 8 hours.png)
## FILE 4: 03_backend_api_requests.md

### PURPOSE OF THIS FILE
This document defines **exact backend APIs and workflows**, strictly aligned with the **provided Excalidraw diagram**.

⚠️ CRITICAL:
- The flow, screens, and transitions MUST MATCH the diagram.
- Do NOT invent extra screens, states, or shortcuts.
- This file is the **execution blueprint** of the diagram.

Cursor must implement APIs and logic exactly as described here.

---

## 1. EXCALIDRAW → SYSTEM FLOW (BIG PICTURE)

The diagram represents **ONE continuous system**, not separate modules.

### High-level flow:
1. User logs in
2. User lands on **Maintenance Dashboard**
3. From dashboard, user can:
   - View Equipment
   - Create Maintenance Request
   - View Kanban Board
   - View Calendar
4. Requests move across stages
5. Equipment reflects request outcomes (especially SCRAP)

Everything revolves around **Maintenance Requests**.

---

## 2. AUTH FLOW (FROM DIAGRAM)

### Login Screen
- Input: email + password
- Output: JWT token
- Redirect based on role (same UI, different permissions)

### API
```http
POST /api/auth/login
````

**Response**

```json
{
  "token": "jwt",
  "user": {
    "id": "...",
    "name": "...",
    "role": "USER | TECHNICIAN | MANAGER"
  }
}
```

JWT must be attached to all protected routes.

---

## 3. EQUIPMENT FLOW (LEFT SIDE OF DIAGRAM)

### Equipment List View

* Table view
* Columns:

  * Name
  * Category
  * Department
  * Owner
  * Location
  * Status

### API

```http
GET /api/equipment
```

Supports filters:

* department
* category
* status

---

### Equipment Detail View

This screen shows:

* All equipment fields
* Smart Button: **Maintenance (N)**

### API

```http
GET /api/equipment/:id
```

**Response must include**

```json
{
  "equipment": { ... },
  "openRequestCount": 3
}
```

---

### Equipment → Maintenance Button Flow

Clicking the button:

* Navigates to request list
* Filtered ONLY by this equipment

### API

```http
GET /api/requests?equipmentId=:id
```

---

## 4. CREATE MAINTENANCE REQUEST (CENTER OF DIAGRAM)

### Request Creation Modal / Page

Fields shown in diagram:

* Subject
* Equipment (dropdown)
* Type (Corrective / Preventive)
* Scheduled Date (only if Preventive)
* Description

### AUTO-FILL LOGIC (MANDATORY)

When Equipment is selected:

* Equipment Category auto-filled
* Maintenance Team auto-filled

This must happen via backend fetch.

---

### API – Create Request

```http
POST /api/requests
```

**Input**

```json
{
  "subject": "Printer not working",
  "equipmentId": "...",
  "type": "CORRECTIVE",
  "scheduledDate": null
}
```

### Backend MUST:

1. Fetch Equipment
2. Copy:

   * category → equipmentCategorySnapshot
   * defaultMaintenanceTeamId → maintenanceTeamId
3. Set:

   * stage = NEW
   * createdByUserId = logged-in user

---

## 5. KANBAN BOARD (CORE OF DIAGRAM)

### Columns (Exact order)

1. New
2. In Progress
3. Repaired
4. Scrap

### API – Fetch Kanban Data

```http
GET /api/requests/kanban
```

Backend logic:

* USER → only own requests
* TECHNICIAN → only team requests
* MANAGER → all requests

---

### Drag & Drop Flow (VERY IMPORTANT)

When a card is moved:

```http
PUT /api/requests/:id/stage
```

**Input**

```json
{
  "stage": "IN_PROGRESS"
}
```

### Stage Rules (Enforced in Service)

* NEW → IN_PROGRESS
* IN_PROGRESS → REPAIRED
* IN_PROGRESS → SCRAP

Invalid transitions MUST throw error.

---

### Assign Technician Flow (From Diagram)

* Technician clicks “Assign to me”

```http
PUT /api/requests/:id/assign
```

Rules:

* Technician must belong to request’s team
* Manager can assign anyone

---

### Completion Flow

When moving to REPAIRED:

* durationHours must be provided

```http
PUT /api/requests/:id/complete
```

```json
{
  "durationHours": 2.5
}
```

---

## 6. SCRAP FLOW (RIGHT SIDE OF DIAGRAM)

### When Request moves to SCRAP

This is a **compound operation**.

Backend MUST:

1. Update request.stage → SCRAP
2. Update equipment.status → SCRAP
3. Append equipment note:

   * “Marked as scrap via maintenance request”

This happens in ONE service function.

---

## 7. CALENDAR VIEW (BOTTOM OF DIAGRAM)

### Calendar shows ONLY:

* Preventive requests
* With scheduledDate

### API

```http
GET /api/requests/calendar
```

Response:

```json
[
  {
    "id": "...",
    "title": "Monthly Checkup",
    "date": "2025-08-12"
  }
]
```

---

### Create Preventive from Calendar

* User clicks a date
* Create request with scheduledDate pre-filled

Uses SAME create API:

```http
POST /api/requests
```

---

## 8. REPORT / SUMMARY (OPTIONAL BOX IN DIAGRAM)

### Requests per Team

```http
GET /api/reports/requests-per-team
```

Aggregation only.
Read-only.
Used for charts.

---

## 9. PERMISSION MATRIX (MATCHES DIAGRAM)

| Action              | User | Technician | Manager |
| ------------------- | ---- | ---------- | ------- |
| Create Request      | ✅    | ✅          | ✅       |
| Assign Request      | ❌    | ✅ (self)   | ✅       |
| Change Stage        | ❌    | ✅          | ✅       |
| Scrap Equipment     | ❌    | ✅          | ✅       |
| Schedule Preventive | ❌    | ❌          | ✅       |

---

## 10. WHY THIS MATCHES THE EXCALIDRAW EXACTLY

* Every box = a screen or API
* Every arrow = API call or state transition
* No hidden flows
* No missing logic
* Fully demoable end-to-end

Judges will see:
“Diagram → Code → UI → Behavior = perfectly aligned”

---

END OF API & FLOW FILE
