# GearGuard – Domain Modeling
## SINGLE SOURCE OF TRUTH FOR DATA STRUCTURE

### ROLE OF THIS FILE
This document defines:
- All core entities
- Their fields
- Relationships
- Enums
- Validation rules
- Business constraints

No field should exist in code unless it is defined here.
No field defined here should be ignored in implementation.

---

## 1. CORE ENTITIES OVERVIEW

The system contains exactly FOUR core entities:

1. User
2. MaintenanceTeam
3. Equipment
4. MaintenanceRequest

These entities must be implemented explicitly.
No extra entities should be introduced.

---

## 2. USER ENTITY

### Purpose
Represents any person interacting with the system:
- Regular users
- Technicians
- Managers

### Schema
```json
User {
  _id: ObjectId
  name: string
  email: string (unique)
  role: enum [USER, TECHNICIAN, MANAGER]
  avatarUrl: string (optional)
  teamIds: ObjectId[]   // teams this user belongs to
  isActive: boolean
  createdAt: datetime
  updatedAt: datetime
}
````

### Rules

* A USER cannot work on requests.
* TECHNICIAN must belong to ≥ 1 MaintenanceTeam.
* MANAGER may or may not belong to a team.
* teamIds is mandatory for TECHNICIAN.

### Indexes

* email (unique)
* role

---

## 3. MAINTENANCE TEAM ENTITY

### Purpose

Groups technicians by specialization.

### Schema

```json
MaintenanceTeam {
  _id: ObjectId
  name: string
  description: string (optional)
  memberIds: ObjectId[]   // references User
  createdAt: datetime
}
```

### Rules

* Only TECHNICIAN or MANAGER users may be members.
* memberIds must not contain duplicate users.
* Teams define work ownership for requests.

### Indexes

* name (unique)

---

## 4. EQUIPMENT ENTITY (MOST IMPORTANT)

### Purpose

Represents physical or digital company assets.
This is the **source of truth** for maintenance ownership.

### Schema

```json
Equipment {
  _id: ObjectId
  name: string
  serialNumber: string (unique)
  category: string
  department: string
  ownerEmployeeName: string
  purchaseDate: date
  warrantyUntil: date
  location: string
  defaultMaintenanceTeamId: ObjectId
  status: enum [ACTIVE, SCRAP]
  notes: [
    {
      text: string
      createdAt: datetime
    }
  ]
  createdAt: datetime
}
```

### Rules

* status defaults to ACTIVE.
* defaultMaintenanceTeamId is mandatory.
* Equipment in SCRAP state:

  * Cannot receive new maintenance requests.
* notes are append-only (audit log).

### Indexes

* serialNumber (unique)
* department
* category
* status

---

## 5. MAINTENANCE REQUEST ENTITY

### Purpose

Represents actual maintenance work.
This is the **transactional entity**.

### Schema

```json
MaintenanceRequest {
  _id: ObjectId
  type: enum [CORRECTIVE, PREVENTIVE]
  subject: string
  description: string (optional)

  equipmentId: ObjectId
  equipmentCategorySnapshot: string

  maintenanceTeamId: ObjectId

  assignedTechnicianId: ObjectId (nullable)

  stage: enum [NEW, IN_PROGRESS, REPAIRED, SCRAP]

  scheduledDate: datetime (required only for PREVENTIVE)

  durationHours: number (nullable)

  createdByUserId: ObjectId

  createdAt: datetime
  updatedAt: datetime
}
```

### Snapshot Field (IMPORTANT)

* equipmentCategorySnapshot stores category at request creation.
* This avoids historical inconsistency if equipment category changes later.

---

## 6. REQUEST STAGE RULES (STRICT)

### Allowed Transitions

| From        | To          |
| ----------- | ----------- |
| NEW         | IN_PROGRESS |
| IN_PROGRESS | REPAIRED    |
| IN_PROGRESS | SCRAP       |

### Forbidden

* NEW → REPAIRED
* REPAIRED → any
* SCRAP → any

These must be enforced at API level.

---

## 7. REQUEST TYPE RULES

### Corrective

* scheduledDate MUST be null
* Appears ONLY in Kanban

### Preventive

* scheduledDate is mandatory
* Appears in Calendar
* Also appears in Kanban once date arrives

---

## 8. TEAM-BASED ACCESS CONTROL

A technician can:

* View requests only for their team(s)
* Assign requests only if:

  * maintenanceTeamId ∈ user.teamIds

Managers can:

* View and assign all requests

Regular users:

* Can create requests
* Can view only requests they created

---

## 9. SCRAP LOGIC (CRITICAL BUSINESS RULE)

When a MaintenanceRequest moves to SCRAP:

1. The linked Equipment.status must change to SCRAP
2. A note must be appended to Equipment.notes
3. No new requests allowed for that equipment

This logic must be atomic.

---

## 10. DATA INTEGRITY CONSTRAINTS

* A request MUST always reference:

  * equipmentId
  * maintenanceTeamId
* assignedTechnicianId:

  * Must belong to maintenanceTeamId
* durationHours:

  * Can only be set when stage = REPAIRED

---

## 11. SOFT DELETE POLICY

No hard deletes.

* Use isActive flags if needed.
* Historical data must remain for demo & reporting.

---

## 12. WHY THIS MODEL WINS HACKATHONS

* Clear ownership
* Strong constraints
* Easy to explain
* Matches real-world maintenance systems
* Minimal yet powerful

Judges should immediately see:
"This team understands domain modeling."

---

END OF DOMAIN MODEL FILE.

