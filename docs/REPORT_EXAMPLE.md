# Game Journal Backend Report

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Server Startup Flow](#server-startup-flow)
6. [Request Processing Pipeline](#request-processing-pipeline)
7. [API Routes Deep Dive](#api-routes-deep-dive)
8. [Database Models](#database-models)
9. [Security Layers](#security-layers)
10. [Error Handling](#error-handling)
11. [Authentication System](#authentication-system)
12. [Validation Pipeline](#validation-pipeline)

---

## Overview

The Game Journal backend is a RESTful API built with Node.js and Express that allows users to maintain a personal journal of games they've played. The system features user authentication, CRUD operations for journal entries, and robust security measures.

**Core Functionality:**

-   User registration and authentication
-   Personal game journal management
-   Secure data isolation between users
-   Input validation and sanitization
-   Error handling and logging

---

## Technology Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│                 │    │                 │    │                 │
│   (External)    │◄──►│  Node.js        │◄──►│   MongoDB       │
│                 │    │  Express.js     │    │   Mongoose      │
│                 │    │  TypeScript     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Backend Technologies:**

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JSON Web Tokens (JWT)
-   **Validation**: Zod schemas
-   **Security**: Helmet, CORS, Rate Limiting, XSS Protection
-   **Password Hashing**: bcryptjs

---

## Architecture Overview

The backend follows a layered architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    MIDDLEWARE LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │    CORS     │ │Rate Limiting│ │   Helmet    │ │ Morgan  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                      ROUTE LAYER                             │
│  ┌─────────────────┐              ┌─────────────────────────┐│
│  │  /api/v1/users  │              │ /api/v1/journal-entries ││
│  └─────────────────┘              └─────────────────────────┘│
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                 ROUTE-SPECIFIC MIDDLEWARE                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ │ XSS Protect │ │ Validation  │ │   Auth      │ │ ObjectID │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   CONTROLLER LAYER                           │
│  ┌─────────────────┐              ┌─────────────────────────┐│
│  │ Users Controller│              │Journal Entries Controller│
│  └─────────────────┘              └─────────────────────────┘│
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                     MODEL LAYER                              │
│      ┌─────────────────┐              ┌─────────────────────┐│
│      │   User Model    │              │ JournalEntry Model  ││
│      └─────────────────┘              └─────────────────────┘│
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                      DATABASE                                │
│                     MongoDB                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
backend/src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server startup and database connection
├── configs/                  # Configuration files
│   ├── corsOptions.ts       # CORS configuration
│   └── rateLimitOptions.ts  # Rate limiting settings
├── controllers/             # Business logic handlers
│   ├── usersController.ts   # User-related operations
│   └── journalEntriesController.ts # Journal operations
├── errors/                  # Custom error classes
│   ├── index.ts            # Error exports
│   ├── CustomError.ts      # Base error class
│   ├── HttpError.ts        # HTTP-specific errors
│   └── [specific errors]   # BadRequest, NotFound, etc.
├── middlewares/            # Request processing middleware
│   ├── authenticate.ts     # JWT authentication
│   ├── validateZodSchemas.ts # Input validation
│   ├── validateObjectId.ts # MongoDB ObjectID validation
│   ├── errorHandler.ts     # Global error handling
│   └── notFound.ts        # 404 handler
├── models/                 # Database models
│   ├── User.ts            # User schema and methods
│   └── JournalEntry.ts    # Journal entry schema
├── routes/                 # Route definitions
│   ├── usersRoutes.ts     # User endpoints
│   └── journalEntriesRoutes.ts # Journal endpoints
├── schemas/                # Validation schemas
│   ├── userSchemas.ts     # User input validation
│   └── journalEntrySchemas.ts # Journal validation
├── types/                  # TypeScript type definitions
│   ├── api.ts             # API response types
│   ├── express.d.ts       # Express extensions
│   └── index.d.ts         # General types
└── utils/                  # Utility functions
    ├── databaseConnect.ts  # MongoDB connection
    ├── hashPassword.ts     # Password hashing
    ├── comparePasswords.ts # Password comparison
    ├── createJWT.ts        # JWT creation
    └── performCursorPagination.ts # Pagination logic
```

---

## Server Startup Flow

When the server starts, it follows this sequence:

```
[START] server.ts
     │
     ▼
1. Import app.ts (Express configuration)
     │
     ▼
2. Load environment variables
   - PORT (default: 3000)
   - MONGODB_URI
   - JWT_SECRET
     │
     ▼
3. Create HTTP server with Express app
     │
     ▼
4. Connect to MongoDB via databaseConnect()
   ├─ Success ──┐
   └─ Failure ──┼── Exit process with error
                │
     ▼          │
5. Start HTTP server on specified PORT
     │
     ▼
[READY] Server listening for requests
```

**Key Points:**

-   Database connection is established before the server starts accepting requests
-   If database connection fails, the process exits immediately
-   Environment variables are validated during startup

---

## Request Processing Pipeline

Every incoming request goes through this pipeline:

```
[CLIENT REQUEST]
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL MIDDLEWARE                        │
│                                                             │
│ 1. express.json() ──► Parse JSON body                       │
│ 2. cors() ──────────► Apply CORS policy                     │
│ 3. rateLimit() ─────► Check rate limits                     │
│ 4. helmet() ────────► Set security headers                  │
│ 5. morgan() ────────► Log request                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE MATCHING                           │
│                                                             │
│ Express router matches URL pattern:                         │
│ • /api/v1/users/*                                           │
│ • /api/v1/journal-entries/*                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                ROUTE-SPECIFIC MIDDLEWARE                    │
│                                                             │
│ Applied based on route requirements:                        │
│ • xss() ────────────► XSS sanitization                      │
│ • validateZodSchemas() ► Input validation                   │
│ • authenticate() ────► JWT verification                     │
│ • validateObjectId() ► MongoDB ObjectID validation          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTROLLER                             │
│                                                             │
│ Business logic execution:                                   │
│ • Process validated input                                   │
│ • Interact with database models                             │
│ • Format response data                                      │
│ • Return JSON response                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                    [CLIENT RESPONSE]

If error occurs at any step:
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                            │
│                                                             │
│ • Custom errors are caught by errorHandler middleware       │
│ • Formatted into consistent JSON response                   │
│ • Appropriate HTTP status code set                          │
│ • Error details logged (but not exposed to client)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                [ERROR RESPONSE TO CLIENT]
```

---

## API Routes Deep Dive

### User Routes (`/api/v1/users`)

#### 1. User Registration: `POST /api/v1/users/register`

**Data Flow:**

```
[CLIENT] POST /api/v1/users/register
   Body: { email: "user@email.com", password: "secret123" }
     │
     ▼
[MIDDLEWARE CHAIN]
1. express.json() ──► Parse request body
2. cors() ──────────► Check origin
3. rateLimit() ─────► Check if under rate limit
4. helmet() ────────► Add security headers
5. morgan() ────────► Log request
     │
     ▼
[ROUTE MATCHING] /api/v1/users/register
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. xss() ──────────► Sanitize input against XSS
2. validateZodSchemas(registerUserBodySchema)
   ├─ Validate email format
   ├─ Validate password length (min 6 chars)
   └─ Strip unknown properties
     │
     ▼
[CONTROLLER] registerUser()
1. Extract validated { email, password } from req.body
2. Create new user with User.create()
   ├─ Mongoose validates email uniqueness
   ├─ Pre-save hook hashes password with bcrypt
   └─ Assigns unique MongoDB ObjectId as _id
3. Generate JWT token with user._id as userId
4. Format success response
5. Send HTTP 201 with user email and token
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "User registered successfully",
    "user": "user@email.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

[ERROR SCENARIOS]
• Email already exists ──► 409 Conflict
• Invalid email format ──► 400 Bad Request
• Password too short ──► 400 Bad Request
• Database error ──► 500 Internal Server Error
```

#### 2. User Login: `POST /api/v1/users/login`

**Data Flow:**

```
[CLIENT] POST /api/v1/users/login
   Body: { email: "user@email.com", password: "secret123" }
     │
     ▼
[MIDDLEWARE CHAIN] (same as registration)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. xss() ──────────► Sanitize input
2. validateZodSchemas(loginUserBodySchema)
   ├─ Validate email format
   └─ Validate password presence
     │
     ▼
[CONTROLLER] loginUser()
1. Extract { email, password } from validated req.body
2. Find user by email: User.findOne({ email })
   ├─ User not found ──► Return 401 Unauthorized
   └─ User found ──► Continue
3. Compare password with stored hash
   ├─ Password invalid ──► Return 401 Unauthorized
   └─ Password valid ──► Continue
4. Generate JWT token with user._id
5. Send success response with token
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "User logged in successfully",
    "user": "user@email.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. User Logout: `POST /api/v1/users/logout`

**Data Flow:**

```
[CLIENT] POST /api/v1/users/logout
     │
     ▼
[MIDDLEWARE CHAIN] (global only)
     │
     ▼
[CONTROLLER] logoutUser()
1. Return success message (stateless logout)
   - JWT invalidation handled on client side
   - Server doesn't maintain session state
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "User logged out successfully"
  }
}
```

#### 4. Delete User: `DELETE /api/v1/users/delete`

**Data Flow:**

```
[CLIENT] DELETE /api/v1/users/delete
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[MIDDLEWARE CHAIN] (global)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate()
   ├─ Extract token from Authorization header
   ├─ Verify JWT signature with JWT_SECRET
   ├─ Extract userId from payload
   └─ Attach req.user = { userId } to request
     │
     ▼
[CONTROLLER] deleteUser()
1. Extract userId from req.user (set by auth middleware)
2. Find and delete user: User.findByIdAndDelete(userId)
   ├─ User not found ──► Return 404 Not Found
   └─ User deleted ──► Continue
3. Clean up related data: JournalEntry.deleteMany({ createdBy: userId })
4. Send success response
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "User deleted successfully"
  }
}
```

### Journal Entry Routes (`/api/v1/journal-entries`)

**All journal entry routes require authentication!**

#### 1. Get Journal Entries: `GET /api/v1/journal-entries?limit=10&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/journal-entries?limit=10&cursor=abc123
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[MIDDLEWARE CHAIN] (global)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate()
   ├─ Verify JWT token
   └─ Set req.user = { userId }
     │
     ▼
[CONTROLLER] getJournalEntries()
1. Extract userId from req.user
2. Parse query parameters:
   ├─ limit (default: 10, max validation)
   └─ cursor (for pagination)
3. Call performCursorPagination()
   ├─ Query: JournalEntry.find({ createdBy: userId })
   ├─ Sort by _id for consistent pagination
   ├─ Apply limit + 1 (to check for next page)
   └─ Use cursor to start from specific document
4. Map database models to DTOs using toJournalEntryResponseDTO()
5. Return entries with nextCursor for pagination
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "Journal entries retrieved successfully.",
    "entries": [
      {
        "id": "60d5ecb54b24a1234567890a",
        "createdBy": "60d5ecb54b24a1234567890b",
        "title": "The Legend of Zelda: Breath of the Wild",
        "platform": "Nintendo Switch",
        "status": "completed",
        "rating": 9,
        "createdAt": "2023-01-15T10:30:00.000Z",
        "updatedAt": "2023-01-20T15:45:00.000Z"
      }
    ],
    "nextCursor": "60d5ecb54b24a1234567890c"
  }
}
```

**Pagination Explanation:**

-   Uses cursor-based pagination (not offset-based)
-   Cursor is the `_id` of the last document from previous page
-   More efficient for large datasets
-   Prevents issues with data shifting between requests

#### 2. Create Journal Entry: `POST /api/v1/journal-entries`

**Data Flow:**

```
[CLIENT] POST /api/v1/journal-entries
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: {
     "title": "Cyberpunk 2077",
     "platform": "PC",
     "status": "started",
     "rating": 7
   }
     │
     ▼
[MIDDLEWARE CHAIN] (global + auth)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Set req.user = { userId }
2. xss() ──────────► Sanitize input against XSS attacks
3. validateZodSchemas(createJournalEntryBodySchema)
   ├─ title: required, string, 1-100 chars, trimmed
   ├─ platform: required, string, non-empty, trimmed
   ├─ status: optional, enum ["started", "completed", "dropped", "paused", "revisited"]
   └─ rating: optional, number, 0-10 range
     │
     ▼
[CONTROLLER] createJournalEntry()
1. Extract userId from req.user
2. Merge validated req.body with createdBy: userId
3. Create entry: JournalEntry.create({ ...req.body, createdBy: userId })
   ├─ Mongoose adds timestamps automatically
   └─ Validates against schema constraints
4. Transform to DTO: toJournalEntryResponseDTO()
5. Return created entry
     │
     ▼
[RESPONSE] HTTP 201 Created
{
  "status": "success",
  "data": {
    "message": "Journal entry created successfully.",
    "entry": {
      "id": "60d5ecb54b24a1234567890d",
      "createdBy": "60d5ecb54b24a1234567890b",
      "title": "Cyberpunk 2077",
      "platform": "PC",
      "status": "started",
      "rating": 7,
      "createdAt": "2023-01-25T14:20:00.000Z",
      "updatedAt": "2023-01-25T14:20:00.000Z"
    }
  }
}
```

#### 3. Get Single Journal Entry: `GET /api/v1/journal-entries/:id`

**Data Flow:**

```
[CLIENT] GET /api/v1/journal-entries/60d5ecb54b24a1234567890d
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[MIDDLEWARE CHAIN] (global + auth)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Set req.user = { userId }
2. validateObjectId('id')
   ├─ Check if req.params.id is valid MongoDB ObjectId
   ├─ Invalid ──► Return 400 Bad Request
   └─ Valid ──► Continue
     │
     ▼
[CONTROLLER] getJournalEntryById()
1. Extract userId from req.user
2. Extract entryId from req.params.id (validated)
3. Query with ownership check:
   JournalEntry.findOne({ _id: entryId, createdBy: userId })
   ├─ Not found ──► Return 404 Not Found
   └─ Found ──► Continue
4. Transform to DTO and return
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "Journal entry retrieved successfully.",
    "entry": { /* entry object */ }
  }
}
```

**Security Note:** The query `{ _id: entryId, createdBy: userId }` ensures users can only access their own entries.

#### 4. Update Journal Entry: `PATCH /api/v1/journal-entries/:id`

**Data Flow:**

```
[CLIENT] PATCH /api/v1/journal-entries/60d5ecb54b24a1234567890d
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { "status": "completed", "rating": 9 }
     │
     ▼
[MIDDLEWARE CHAIN] (global + auth)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Set req.user = { userId }
2. validateObjectId('id') ──► Validate MongoDB ObjectId
3. xss() ──────────► Sanitize input
4. validateZodSchemas(patchJournalEntryBodySchema)
   ├─ Uses createJournalEntryBodySchema.partial()
   ├─ All fields optional (partial update)
   ├─ .strict() prevents unknown fields
   └─ Same validation rules as create
     │
     ▼
[CONTROLLER] updateJournalEntry()
1. Extract userId from req.user
2. Extract entryId from req.params.id
3. Build updatePayload from validated req.body
4. Check if updatePayload is not empty
   ├─ Empty ──► Return 400 Bad Request
   └─ Has data ──► Continue
5. Update with ownership check:
   JournalEntry.findOneAndUpdate(
     { _id: entryId, createdBy: userId },
     updatePayload,
     { new: true, runValidators: true }
   )
   ├─ Not found ──► Return 404 Not Found
   └─ Updated ──► Continue
6. Transform updated document to DTO
7. Return updated entry
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "Journal entry updated successfully.",
    "entry": { /* updated entry */ }
  }
}
```

#### 5. Delete Journal Entry: `DELETE /api/v1/journal-entries/:id`

**Data Flow:**

```
[CLIENT] DELETE /api/v1/journal-entries/60d5ecb54b24a1234567890d
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[MIDDLEWARE CHAIN] (global + auth)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Set req.user = { userId }
2. validateObjectId('id') ──► Validate ObjectId
     │
     ▼
[CONTROLLER] deleteJournalEntry()
1. Extract userId from req.user
2. Extract entryId from req.params.id
3. Delete with ownership check:
   JournalEntry.findOneAndDelete({ _id: entryId, createdBy: userId })
   ├─ Not found ──► Return 404 Not Found
   └─ Deleted ──► Continue
4. Return success message
     │
     ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "message": "Journal entry deleted successfully."
  }
}
```

---

#### 6. Get Journal Entry Statistics: `GET /api/v1/journal-entries/statistics`

Computes per-user statistics for journal entries, returning lifetime totals by status and a year-by-year breakdown.

**Data Flow:**

```
[CLIENT] GET /api/v1/journal-entries/statistics
   Headers: { Authorization: "Bearer <jwt_token>" }
  │
  ▼
[MIDDLEWARE CHAIN] (global)
  │
  ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Set req.user = { userId }
  │
  ▼
[CONTROLLER] getJournalEntriesStatistics()
1. Extract userId from req.user
2. Cast userId (string) → new mongoose.Types.ObjectId(userId)
3. Run aggregation pipelines:
   ├─ Lifetime: $match { createdBy: userId }, $group by $status, count
   └─ Yearly:   $match { createdBy: userId }, $project { year: {$year: "$createdAt"}, status }
        $group by { year, status }, count
4. Normalize output so all statuses appear (0 when missing)
5. Return JSON with lifetime and byYear objects
  │
  ▼
[RESPONSE]
{
  "status": "success",
  "data": {
    "lifetime": { "started": 0, "completed": 0, "revisited": 0, "paused": 0, "dropped": 0 },
    "byYear": { "2025": { "started": 0, "completed": 0, "revisited": 0, "paused": 0, "dropped": 0 } }
  }
}
```

**Notes:**

-   Statistics are always scoped to the authenticated user via `{ createdBy: userId }`.
-   The controller casts the `userId` string to `ObjectId` for correct matching against the `createdBy` field.
-   Uses MongoDB Aggregation Pipeline operators: `$match`, `$project` (extract `year`), and `$group`.
-   UTC is used for year extraction by default. If a local time zone is required, consider `$dateToParts` or `$dateTrunc`.

**Performance:**

-   To keep queries fast as data grows, the `JournalEntry` schema defines indexes:
    -   `{ createdBy: 1 }`
    -   `{ createdAt: 1 }`
    -   `{ status: 1 }`
    -   Composite `{ createdBy: 1, createdAt: 1, status: 1 }`

## Database Models

### User Model

```typescript
interface IUser {
    email: string; // Unique, validated email
    password: string; // Hashed with bcrypt
    createdAt?: Date; // Auto-generated
    updatedAt?: Date; // Auto-updated
}
```

**Schema Features:**

-   Email uniqueness enforced at database level
-   Password automatically hashed before saving (pre-save hook)
-   Timestamps managed by Mongoose
-   Email validation using validator library
-   Instance methods: `createJWT()`, `comparePassword()`

**Database Indexes:**

-   Unique index on `email` field
-   Default `_id` index

### Journal Entry Model

```typescript
interface IJournalEntry {
    _id: ObjectId; // MongoDB-generated unique ID
    createdBy: ObjectId; // Reference to User._id
    title: string; // Game title (max 100 chars)
    platform: string; // Gaming platform
    status: 'started' | 'completed' | 'dropped' | 'revisited' | 'paused';
    rating?: number; // 0-10 scale, optional
    createdAt: Date; // Auto-generated
    updatedAt: Date; // Auto-updated
}
```

**Schema Features:**

-   `createdBy` references User model (foreign key)
-   Enum validation on `status` field
-   Range validation on `rating` (0-10)
-   Automatic timestamps

**Recommended Database Indexes:**

```javascript
// For efficient user-specific queries
{ createdBy: 1, _id: 1 }

// For pagination queries
{ createdBy: 1, createdAt: -1 }
```

### Data Relationships

```
User (1) ──────── (Many) JournalEntry
  │                         │
  │                         │
  _id ←──── createdBy ──────┘

• One user can have many journal entries
• Each journal entry belongs to exactly one user
• Cascade delete: When user is deleted, all their entries are deleted
• Data isolation: Users can only access their own entries
```

---

## Security Layers

The backend implements defense-in-depth security:

### 1. Network Level

```
[Internet] ──► [Rate Limiting] ──► [CORS] ──► [Express App]
```

**Rate Limiting:**

-   300 requests per 15-minute window per IP
-   Prevents brute force attacks and API abuse
-   Returns 429 Too Many Requests when exceeded

**CORS (Cross-Origin Resource Sharing):**

-   Only allows requests from whitelisted frontend address
-   Restricts HTTP methods to: GET, POST, PATCH, DELETE
-   Prevents unauthorized cross-origin requests

### 2. Application Level

```
[Request] ──► [Helmet] ──► [XSS Protection] ──► [Input Validation] ──► [Authorization]
```

**Helmet:** Sets security headers

-   `X-Content-Type-Options: nosniff`
-   `X-Frame-Options: DENY`
-   `X-XSS-Protection: 1; mode=block`
-   Removes `X-Powered-By` header

**XSS Protection:**

-   Sanitizes all user inputs
-   Removes potentially malicious scripts
-   Applied before validation on all user-facing routes

**Input Validation (Zod):**

-   Schema-based validation
-   Type checking and format validation
-   Automatic sanitization (strips unknown fields)
-   Detailed error messages for developers

**Authorization (JWT):**

-   Stateless authentication
-   Token includes encrypted user ID
-   Verified on every protected request
-   Automatic expiration

### 3. Data Level

```
[Controller] ──► [Ownership Check] ──► [Database Query] ──► [Response]
```

**Ownership Enforcement:**

-   All queries include `createdBy: userId` filter
-   Users can only access their own data
-   Prevents horizontal privilege escalation

**Password Security:**

-   Passwords hashed with bcrypt (salt rounds: 12)
-   Plain text passwords never stored
-   Password comparison done through secure bcrypt.compare()

**Database Security:**

-   MongoDB ObjectIds provide non-sequential identifiers
-   Mongoose schema validation as last line of defense
-   No direct database queries (all through Mongoose ODM)

---

## Error Handling

### Error Hierarchy

```
CustomError (Base)
    │
    ├── HttpError
    │   ├── BadRequestError (400)
    │   ├── UnauthorizedError (401)
    │   ├── UnauthenticatedError (401)
    │   ├── NotFoundError (404)
    │   ├── ConflictError (409)
    │   └── InternalServerError (500)
    │
    ├── DatabaseError
    └── JWTConfigurationError
```

### Error Flow

```
[Error Occurs] ──► [Controller catches] ──► [next(error)] ──► [Error Handler Middleware]
                                                                    │
                                                                    ▼
                                                              [Format Response]
                                                                    │
                                                                    ▼
                                                                [Send to Client]
```

**Error Response Format:**

```json
{
    "status": "error",
    "data": {
        "message": "Descriptive error message for the client"
    }
}
```

**Error Handling Examples:**

1. **Validation Error:**

```javascript
// Input: { email: "invalid-email", password: "123" }
// Response: 400 Bad Request
{
  "status": "error",
  "data": {
    "message": "Invalid email. Password must be at least 6 characters long"
  }
}
```

2. **Authentication Error:**

```javascript
// Missing or invalid JWT token
// Response: 401 Unauthorized
{
  "status": "error",
  "data": {
    "message": "Authorization header missing or malformed. Expected format: Bearer 'token'."
  }
}
```

3. **Not Found Error:**

```javascript
// Accessing non-existent journal entry
// Response: 404 Not Found
{
  "status": "error",
  "data": {
    "message": "Journal entry not found."
  }
}
```

**Error Logging:**

-   All errors logged to console with full stack trace
-   Sensitive information never exposed to client
-   Production logs should be sent to external logging service

---

## Authentication System

### JWT (JSON Web Token) Implementation

**Token Structure:**

```
Header.Payload.Signature

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": "60d5ecb54b24a1234567890b", "iat": 1623456789, "exp": 1623543189 }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Authentication Flow:**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Client      │         │    Backend      │         │    Database     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │ 1. POST /register         │                           │
         │ { email, password }       │                           │
         │──────────────────────────►│                           │
         │                           │ 2. Hash password          │
         │                           │──────────────────────────►│
         │                           │ 3. Create user            │
         │                           │◄──────────────────────────│
         │                           │ 4. Generate JWT           │
         │                           │    with user._id          │
         │ 5. Return token           │                           │
         │◄──────────────────────────│                           │
         │                           │                           │
         │ 6. Store token            │                           │
         │    (localStorage/memory)  │                           │
         │                           │                           │
         │ 7. Subsequent requests    │                           │
         │ Authorization: Bearer     │                           │
         │ <token>                   │                           │
         │──────────────────────────►│                           │
         │                           │ 8. Verify token           │
         │                           │ 9. Extract userId         │
         │                           │ 10. Query with userId     │
         │                           │──────────────────────────►│
         │                           │ 11. Return user data      │
         │                           │◄──────────────────────────│
         │ 12. Protected resource    │                           │
         │◄──────────────────────────│                           │
```

**Token Generation:**

```typescript
// In User model method
async createJWT(payload = {}) {
  return createJWT({ userId: this._id, ...payload });
}

// In utils/createJWT.ts
const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};
```

**Token Verification:**

```typescript
// In authenticate middleware
const payload = jwt.verify(token, process.env.JWT_SECRET);
if (isUserPayload(payload)) {
    req.user = { userId: payload.userId };
    next();
} else {
    throw new UnauthorizedError('Invalid token structure');
}
```

**Security Considerations:**

-   JWT_SECRET must be strong and kept secret
-   Tokens have 7-day expiration (configurable)
-   No token blacklisting (stateless design)
-   Client responsible for token storage and cleanup
-   HTTPS required in production to prevent token interception

---

## Validation Pipeline

### Zod Schema Validation

The backend uses Zod for runtime type checking and validation:

**Validation Flow:**

```
[Raw Request Body] ──► [XSS Sanitization] ──► [Zod Schema] ──► [Validated Data] ──► [Controller]
                                                    │
                                                    ▼
                                            [Validation Error] ──► [400 Bad Request]
```

**User Registration Schema:**

```typescript
const registerUserBodySchema = z.object({
    email: z.string().email('Must be a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Auto-generated TypeScript type:
type RegisterUserBody = {
    email: string;
    password: string;
};
```

**Journal Entry Creation Schema:**

```typescript
const createJournalEntryBodySchema = z.object({
    title: z.string().trim().min(1).max(100),
    platform: z.string().trim().min(1),
    status: z.enum(['started', 'completed', 'dropped']).optional(),
    rating: z.number().min(0).max(10).optional(),
});
```

**Validation Middleware Process:**

1. **Input Sanitization**: XSS protection removes malicious content
2. **Schema Parsing**: Zod validates structure and types
3. **Data Transformation**: Automatic trimming, type coercion
4. **Unknown Field Removal**: `.strict()` mode strips extra properties
5. **Error Formatting**: Detailed validation messages for developers

**Validation Error Example:**

```javascript
// Invalid input
{
  "email": "not-an-email",
  "password": "123",
  "unknownField": "value"
}

// Validation result
{
  "status": "error",
  "data": {
    "message": "Invalid email. Password must be at least 6 characters long"
  }
}

// Cleaned output (if valid)
{
  "email": "user@example.com",
  "password": "validpass123"
  // unknownField removed
}
```

---

## Performance Considerations

### Database Optimization

**Cursor-Based Pagination:**

```typescript
// Instead of offset/limit (slow for large datasets)
const documents = await Model.find(query)
    .sort({ _id: 1 })
    .limit(limit + 1);

// Uses cursor (efficient for any dataset size)
const query = cursor ? { _id: { $gt: cursor } } : {};
const documents = await Model.find({ ...filters, ...query })
    .sort({ _id: 1 })
    .limit(limit + 1);
```

**Efficient Queries:**

-   All journal entry queries include `createdBy` filter
-   Compound indexes recommended: `{ createdBy: 1, _id: 1 }`
-   No N+1 queries (single query per operation)

### Memory Management

-   Stateless design (no server-side sessions)
-   JWT tokens eliminate session storage
-   Mongoose connection pooling handles database connections
-   Express.js built-in memory management

### Security Performance

-   bcrypt hashing is CPU intensive but necessary
-   Rate limiting prevents resource exhaustion
-   Input validation happens before database queries
-   Early authentication failures prevent expensive operations

---

## Development and Deployment

### Environment Variables

```bash
# Required for operation
PORT=3000
MONGODB_URI=mongodb://localhost:27017/game-journal
JWT_SECRET=your-super-secret-jwt-key-here

# Optional for development
NODE_ENV=development
```

### Build Process

```bash
# Development
npm run dev          # Start with hot reload
npm run check        # TypeScript type checking

# Production
npm run build        # Compile TypeScript to JavaScript
npm start           # Run compiled JavaScript
```

### Testing Considerations

-   Unit tests for utility functions
-   Integration tests for API endpoints
-   Mock database for testing
-   JWT token generation for authenticated tests

---

## Conclusion

This Game Journal backend demonstrates modern Node.js/Express.js best practices:

**Architecture Strengths:**

-   Clean separation of concerns
-   Comprehensive security layers
-   Robust error handling
-   Type-safe development with TypeScript
-   Scalable pagination system
-   Stateless authentication

**Security Features:**

-   Multi-layer input validation
-   XSS protection
-   Rate limiting
-   CORS policy enforcement
-   Secure password hashing
-   Data ownership enforcement

**Developer Experience:**

-   Detailed error messages
-   Consistent API responses
-   Type safety with TypeScript
-   Comprehensive logging
-   Clear code organization

The system is production-ready and follows industry best practices for security, performance, and maintainability.
