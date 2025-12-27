# GearGuard – Automation & Smart Features (Judge-Wow Layer)
## FILE 7: 06_automation_and_smart_features.md

### PURPOSE OF THIS FILE
This document defines **all smart, automated, and system-driven behaviors** that elevate GearGuard
from a simple CRUD app to an **enterprise-grade, Odoo-like module**.

⚠️ CRITICAL:
- These features must work automatically.
- Users should NOT manually perform what the system can infer.
- Automation must be deterministic and explainable to judges.

This file is where **extra points are won**.

---

## 1. AUTO-FILL INTELLIGENCE (CORE AUTOMATION)

### Trigger
When a user selects an Equipment while creating a Maintenance Request.

### Automated Actions
The system MUST automatically:
1. Fetch the selected Equipment
2. Populate:
   - Maintenance Team
   - Equipment Category (snapshot)

### Rules
- User must NOT manually select team
- Team field remains hidden/read-only
- Prevents human error

### Why Judges Love This
Shows understanding of:
- Source of truth
- Dependency-based automation
- Real-world ERP behavior

---

## 2. SMART EQUIPMENT → MAINTENANCE BUTTON

### Location
Equipment Detail Page

### Button Label
```

Maintenance (N)

````

Where:
- `N` = number of OPEN requests
- OPEN = stage ≠ REPAIRED and ≠ SCRAP

---

### Button Behavior
On click:
- Navigate to Kanban
- Auto-filter requests by this Equipment

### Backend Logic
```http
GET /api/equipment/:id
````

Must return:

```json
{
  "openRequestCount": 4
}
```

---

## 3. TEAM-BASED REQUEST VISIBILITY (AUTO FILTER)

### Automated Filtering Rules

* USER:

  * Sees only requests they created
* TECHNICIAN:

  * Sees only requests belonging to their team(s)
* MANAGER:

  * Sees all requests

### IMPORTANT

Frontend must NOT decide visibility.
Backend response must already be filtered.

---

## 4. AUTOMATIC SCRAP CASCADE (HIGH VALUE FEATURE)

### Trigger

When a Maintenance Request moves to SCRAP stage.

### Automated Chain Reaction

1. MaintenanceRequest.stage → SCRAP
2. Equipment.status → SCRAP
3. Append Equipment note:

   * Timestamp
   * Request ID
   * Reason (optional)

### Example Note

```
[2025-08-14] Equipment scrapped via Maintenance Request #REQ-102
```

---

### System Protection After Scrap

* Scrapped equipment:

  * Hidden from equipment dropdown
  * Cannot receive new maintenance requests
* Backend rejects creation attempts

---

## 5. OVERDUE AUTO-DETECTION

### Definition

A request is OVERDUE if:

* type = PREVENTIVE
* scheduledDate < current date
* stage = NEW or IN_PROGRESS

---

### Automated Flag

Backend must compute:

```json
"isOverdue": true
```

Frontend only displays visual indicator.

---

### Visual Automation

* Red left border on Kanban card
* Optional ⚠️ icon
* No user interaction required

---

## 6. AUTO-ASSIGNMENT SAFETY RULES

### Assign to Me Button

Visible only when:

* User is TECHNICIAN or MANAGER
* Request is UNASSIGNED
* User belongs to request’s team

Button hidden otherwise.

---

## 7. DURATION LOGGING ENFORCEMENT

### Automated Validation

* durationHours:

  * Required ONLY when moving to REPAIRED
  * Must be > 0
* Backend rejects invalid input

---

## 8. PREVENTIVE REQUEST AUTO-CALENDAR SYNC

### Automated Behavior

* Preventive request automatically appears on Calendar
* No manual “add to calendar” step

Calendar is a VIEW, not a separate entity.

---

## 9. ROLE-DRIVEN UI AUTOMATION

### UI Adjustments Based on Role

* USER:

  * Cannot drag Kanban cards
  * Cannot see assign buttons
* TECHNICIAN:

  * Can drag cards only for own team
* MANAGER:

  * Full access

UI reacts automatically to role from JWT.

---

## 10. AUDITABILITY (SILENT BUT POWERFUL)

### System Records Automatically:

* createdAt
* updatedAt
* status changes
* scrap notes

No explicit “audit module” needed.

---

## 11. FAILURE SAFETY (JUDGE-LEVEL DETAIL)

### Atomic Operations

* Scrap logic must be atomic
* If equipment update fails → rollback request change

Explainable as:
“System consistency over partial updates.”

---

## 12. WHY THESE AUTOMATIONS WIN

* Reduce user errors
* Increase trust in system
* Match real-world ERP logic
* Impress judges with maturity
* Minimal UI complexity, maximum intelligence

Judges will say:
“This feels like a real product.”

---

END OF AUTOMATION & SMART FEATURES FILE
