# GearGuard – Backend Architecture
## CLEAN, SCALABLE, HACKATHON-PROOF DESIGN

### ROLE OF THIS FILE
This document defines:
- Backend folder structure
- Architectural rules
- Responsibility separation
- Authentication & authorization strategy
- Error handling & validation approach

Cursor must strictly follow this architecture.
No shortcuts, no mixed responsibilities.

---

## 1. BACKEND TECHNOLOGY ASSUMPTIONS

- Runtime: Node.js (LTS)
- Framework: Express.js
- Database: MongoDB (Mongoose ODM)
- Auth: JWT (Access Token)
- Optional: Socket.IO (later stage)

---

## 2. HIGH-LEVEL ARCHITECTURE

We follow a **Layered Architecture**:

```

Client (React)
↓
Routes (HTTP)
↓
Controllers (Request handling)
↓
Services (Business logic)
↓
Models (Database)

```

RULE:
- Controllers NEVER talk directly to Models
- Routes NEVER contain logic
- Services NEVER return HTTP responses

---

## 3. FOLDER STRUCTURE (MANDATORY)

```

backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.middleware.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   └── user.routes.js
│   │   │
│   │   ├── teams/
│   │   │   ├── team.model.js
│   │   │   ├── team.controller.js
│   │   │   ├── team.service.js
│   │   │   └── team.routes.js
│   │   │
│   │   ├── equipment/
│   │   │   ├── equipment.model.js
│   │   │   ├── equipment.controller.js
│   │   │   ├── equipment.service.js
│   │   │   └── equipment.routes.js
│   │   │
│   │   ├── requests/
│   │   │   ├── request.model.js
│   │   │   ├── request.controller.js
│   │   │   ├── request.service.js
│   │   │   └── request.routes.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   ├── role.middleware.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── constants.js
│   │
│   └── routes.js
│
└── package.json

````

---

## 4. RESPONSIBILITY RULES (VERY IMPORTANT)

### Routes
- Define HTTP method + URL
- Attach middleware
- Forward to controller

NO logic allowed.

---

### Controllers
- Extract request data
- Call service
- Return standardized response

NO database queries allowed.

---

### Services
- Contain ALL business rules
- Validate domain constraints
- Perform database operations
- Handle transactions (scrap logic)

NO Express `req` or `res` allowed.

---

### Models
- Define schema
- Indexes
- Enums
- Validation rules

NO business logic.

---

## 5. AUTHENTICATION DESIGN

### JWT Payload
```json
{
  "userId": "ObjectId",
  "role": "USER | TECHNICIAN | MANAGER",
  "teamIds": ["ObjectId"]
}
````

### Auth Middleware Responsibilities

* Verify token
* Attach `req.user`
* Reject unauthenticated access

---

## 6. ROLE-BASED ACCESS CONTROL (RBAC)

### Role Middleware

```js
requireRole(["TECHNICIAN", "MANAGER"])
```

### Rules

* USER:

  * Create requests
  * View own requests
* TECHNICIAN:

  * Work only on own team requests
* MANAGER:

  * Full access

RBAC must be enforced at **service level**, not only routes.

---

## 7. ERROR HANDLING STRATEGY

### ApiError Utility

```js
throw new ApiError(403, "Not authorized");
```

### Central Error Middleware

* Catches all errors
* Returns consistent JSON:

```json
{
  "success": false,
  "message": "Error message"
}
```

NO try-catch in controllers unless required.

---

## 8. VALIDATION STRATEGY

* Validate:

  * Required fields
  * Enum values
  * Stage transitions
  * Team ownership
* Validation happens in:

  * Services (business rules)
  * Mongoose schema (field-level)

DO NOT rely only on frontend validation.

---

## 9. REQUEST STAGE TRANSITION ENFORCEMENT

Service layer must enforce:

* Allowed stage transitions
* Role permissions
* Duration logging only at REPAIRED

Any invalid transition must throw error.

---

## 10. SCRAP LOGIC IMPLEMENTATION RULE

Scrap logic must:

1. Run in a single service function
2. Update MaintenanceRequest
3. Update Equipment status
4. Append audit note

This must be treated as a **transactional operation**.

---

## 11. LOGGING & DEBUGGING (HACKATHON FRIENDLY)

* Use `console.log` with clear prefixes:

  * `[AUTH]`
  * `[REQUEST]`
  * `[SCRAP]`
* Avoid noisy logs
* Focus on demo clarity

---

## 12. WHY THIS ARCHITECTURE WINS

* Clean separation of concerns
* Easy to explain to judges
* Prevents logic bugs
* Scales well if extended
* Matches real-world enterprise systems

Judges will trust this design instantly.

---

END OF BACKEND ARCHITECTURE FILE.