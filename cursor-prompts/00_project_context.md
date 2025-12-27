# GearGuard – Ultimate Maintenance Tracker
## MASTER PROJECT CONTEXT FOR CURSOR AGENT

### ROLE
You are acting as a senior full-stack engineer building a hackathon-grade, production-quality module.
Your goal is NOT just to implement features, but to:
- Follow correct business logic
- Avoid hallucinated requirements
- Optimize for demo clarity and judging criteria

You must strictly follow this document and NOT invent features beyond it.

---

## 1. PROBLEM SUMMARY (IN SIMPLE TERMS)

GearGuard is a maintenance management system.

It connects **three core entities**:
1. Equipment (machines/assets)
2. Maintenance Teams (who fix things)
3. Maintenance Requests (repair jobs)

The system tracks:
- Which equipment exists
- Who is responsible for maintaining it
- What maintenance work is requested
- The lifecycle of each maintenance job

---

## 2. CORE BUSINESS PHILOSOPHY (DO NOT BREAK)

Every Maintenance Request MUST logically connect:
- WHAT is broken → Equipment
- WHO fixes it → Maintenance Team & Technician
- WHAT work is done → Request lifecycle

No request should exist without:
- Equipment
- Team
- Clear stage (New → In Progress → Repaired / Scrap)

---

## 3. USER ROLES & BEHAVIOR

### Regular User
- Can create maintenance requests
- Cannot assign technicians
- Cannot move request stages beyond "New"

### Technician
- Belongs to one or more Maintenance Teams
- Can assign requests to themselves
- Can move requests to:
  - In Progress
  - Repaired
  - Scrap
- Can log duration (hours spent)

### Manager
- Can do everything a Technician can
- Can schedule preventive maintenance
- Can assign requests to technicians

---

## 4. EQUIPMENT – SOURCE OF TRUTH

Equipment represents any company asset:
- Machine
- Vehicle
- Laptop
- Printer
- CNC
- Server

Each Equipment MUST have:
- Name
- Serial Number
- Department
- Location
- Purchase Date
- Warranty Info
- Default Maintenance Team
- Operational Status (Active / Scrap)

Equipment determines:
- Which team handles its maintenance
- Which category is auto-filled in requests

---

## 5. MAINTENANCE TEAMS

The system supports multiple teams:
- Mechanics
- Electricians
- IT Support
- HVAC
- Others

Each team:
- Has a name
- Has multiple technician users
- Receives requests automatically via equipment mapping

IMPORTANT RULE:
Only technicians belonging to a request’s team are allowed to pick or work on it.

---

## 6. MAINTENANCE REQUESTS (TRANSACTION ENTITY)

Requests represent actual maintenance work.

### Request Types
- Corrective → Unplanned breakdown
- Preventive → Scheduled maintenance

### Mandatory Fields
- Subject (problem description)
- Equipment (affected asset)
- Maintenance Team (auto-filled)
- Stage
- Created By
- Assigned Technician (optional initially)

### Preventive-only Fields
- Scheduled Date (mandatory)
- Appears in Calendar View

---

## 7. REQUEST LIFECYCLE (STRICT FLOW)

### Default Stages
1. New
2. In Progress
3. Repaired
4. Scrap

### Breakdown Flow
1. User creates request → Stage = New
2. Equipment selected → Team auto-filled
3. Technician assigns themselves
4. Stage moves to In Progress
5. Technician logs duration
6. Stage moves to Repaired

### Scrap Flow
- If moved to Scrap:
  - Equipment becomes non-operational
  - Equipment status must be updated to "Scrap"
  - This change must be recorded

---

## 8. REQUIRED USER INTERFACES

### Kanban Board (Primary Workspace)
- Grouped by Stage
- Drag & Drop between stages
- Shows:
  - Assigned technician avatar
  - Overdue indicator (red highlight)

### Calendar View
- Shows only Preventive requests
- Requests appear on scheduled date
- Clicking a date allows scheduling

### Equipment Form
- Contains Smart Button: "Maintenance"
- Clicking shows only requests for that equipment
- Button displays count of open requests

---

## 9. SMART & AUTOMATED BEHAVIOR (MANDATORY)

- Equipment selection auto-fills:
  - Maintenance Team
  - Equipment Category
- Scrap stage triggers:
  - Equipment status update
- Team-based request visibility
- No manual duplication of data

---

## 10. NON-GOALS (DO NOT IMPLEMENT)

- No billing or invoicing
- No inventory/spare parts management
- No AI prediction features
- No mobile app (web only)
- No multi-company tenancy

---

## 11. QUALITY BAR (VERY IMPORTANT)

Code must be:
- Clean
- Predictable
- Demo-friendly
- Free of unused features
- Easy to explain to judges

Assume judges WILL ask:
- Why this data model?
- How scrap logic works?
- How team restriction is enforced?

You must be able to answer clearly.

---

## 12. DEVELOPMENT ORDER (DO NOT CHANGE)

You MUST build in this order:
1. Domain models
2. Backend architecture
3. APIs & business logic
4. Frontend structure
5. Kanban & calendar
6. Automation & polish
7. Demo readiness

---

END OF CONTEXT FILE.
