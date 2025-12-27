# GearGuard – Kanban & Calendar Logic (Excalidraw-Exact) (C:\projects\Odoo-adani-hackathon-2026\GearGuard_ The Ultimate Maintenance Tracker - 8 hours.png)

## FILE 6: 05_kanban_calendar_logic.md

### PURPOSE OF THIS FILE
This document defines **exact operational logic** for:
- Kanban board behavior
- Drag & drop rules
- Overdue detection
- Calendar synchronization

⚠️ CRITICAL:
- This logic must behave EXACTLY as the Excalidraw diagram implies.
- No shortcuts.
- No client-only logic — backend remains source of truth.

This file is the **core “alive” behavior** judges care about.

---

## 1. KANBAN BOARD – CORE BEHAVIOR

### Column Definition (Fixed)
```ts
const STAGES = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"];
````

Order must NEVER change.

---

## 2. KANBAN DATA LOADING

### API

```http
GET /api/requests/kanban
```

### Backend Filtering Rules

* USER → only own requests
* TECHNICIAN → requests where maintenanceTeamId ∈ user.teamIds
* MANAGER → all requests

Frontend must NOT re-filter this data.

---

## 3. DRAG & DROP RULES (STRICT)

### Allowed Moves

| From        | To          |
| ----------- | ----------- |
| NEW         | IN_PROGRESS |
| IN_PROGRESS | REPAIRED    |
| IN_PROGRESS | SCRAP       |

All other moves must be blocked visually AND by backend.

---

### Frontend Drag Guard

Before allowing drop:

* Check role
* Check team ownership

If invalid:

* Disable drag
* Show tooltip: “You don’t have permission”

---

### Backend Enforcement

Even if frontend fails:

* Backend MUST reject invalid transitions.

---

## 4. STAGE CHANGE API

```http
PUT /api/requests/:id/stage
```

**Payload**

```json
{
  "stage": "IN_PROGRESS"
}
```

### Backend Validation

1. Validate transition
2. Validate role
3. Validate team ownership
4. Update `updatedAt`

---

## 5. ASSIGNMENT LOGIC

### Assign to Me

Triggered by Technician.

```http
PUT /api/requests/:id/assign
```

Rules:

* assignedTechnicianId = current user
* User must belong to maintenanceTeamId

If already assigned:

* Only MANAGER can reassign

---

## 6. REPAIR COMPLETION LOGIC

### Move to Repaired

Requires duration input.

```http
PUT /api/requests/:id/complete
```

**Payload**

```json
{
  "durationHours": 1.75
}
```

Rules:

* durationHours > 0
* Only allowed from IN_PROGRESS
* Auto-set stage = REPAIRED

---

## 7. SCRAP LOGIC (HIGH-RISK AREA)

### Move to Scrap

```http
PUT /api/requests/:id/scrap
```

Backend must:

1. Verify IN_PROGRESS stage
2. Update request.stage = SCRAP
3. Update equipment.status = SCRAP
4. Append equipment note:

   * "Scrapped via maintenance request #ID"
5. Prevent future requests for this equipment

All steps must succeed together.

---

## 8. OVERDUE DETECTION (VISUAL INDICATOR)

### Definition

A request is OVERDUE if:

* type = PREVENTIVE
* scheduledDate < today
* stage ∈ [NEW, IN_PROGRESS]

---

### Backend Flag

API response should include:

```json
{
  "isOverdue": true
}
```

Frontend must only display indicator.

---

## 9. KANBAN CARD UI BEHAVIOR

### Card Elements

* Subject (bold)
* Equipment name
* Technician avatar
* Overdue red strip (left border)

### Card Disable States

* USER role → cards are read-only
* SCRAP & REPAIRED → not draggable

---

## 10. CALENDAR VIEW – DATA LOGIC

### API

```http
GET /api/requests/calendar
```

Returns:

* Only PREVENTIVE requests
* Only with scheduledDate

---

### Calendar Event Mapping

```json
{
  "id": "requestId",
  "title": "Routine Checkup",
  "start": "2025-08-15"
}
```

---

## 11. CALENDAR → REQUEST CREATION FLOW

When user clicks date:

1. Open Create Request modal
2. Type auto-set to PREVENTIVE
3. scheduledDate auto-filled
4. Equipment selection still required

---

## 12. KANBAN ↔ CALENDAR SYNC RULE

* Preventive request:

  * Appears in Calendar
  * Appears in Kanban when stage ≠ REPAIRED/SCRAP

No duplicate logic.

---

## 13. EDGE CASE HANDLING

### Equipment in SCRAP state

* Hide from equipment dropdown
* Backend rejects request creation

---

### Technician removed from team

* Cannot access old requests
* Manager must reassign

---

## 14. WHY THIS LOGIC WINS JUDGES

* Clear lifecycle
* Strict enforcement
* Visual clarity
* Real-world correctness
* No “magic” behavior

Every rule is explainable.

---

END OF KANBAN & CALENDAR LOGIC FILE
