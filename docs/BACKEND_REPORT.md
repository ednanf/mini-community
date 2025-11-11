# Mini Community Backend Report

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Server Startup Flow](#server-startup-flow)
6. [Request Processing Pipeline](#request-processing-pipeline)
7. [API Routes Deep Dive](#api-routes-deep-dive)
8. [Database Models and Relations](#database-models-and-relations)
9. [Security Layers](#security-layers)
10. [Error Handling](#error-handling)
11. [Authentication System](#authentication-system)
12. [Validation Pipeline](#validation-pipeline)
13. [Follow/Unfollow System](#followunfollow-system)
14. [Cursor-Based Pagination](#cursor-based-pagination)
15. [Performance Considerations](#performance-considerations)
16. [Development and Deployment](#development-and-deployment)

---

## Overview

The Mini Community backend is a RESTful API built with Node.js and Express that powers a social media platform similar
to Twitter/X. The system features user authentication, post creation and management, commenting, user following, and
robust security measures.

**Core Functionality:**

- User registration and authentication
- User profile management (nickname, bio, avatar)
- Social features (follow/unfollow users)
- Post creation, retrieval, and deletion
- Commenting on posts
- Personalized feeds based on followed users
- Cursor-based pagination for efficient data retrieval
- Input validation and sanitization
- Comprehensive error handling and logging

**Key Design Principles:**

- RESTful API design
- Stateless JWT-based authentication
- Layered architecture with clear separation of concerns
- Type safety with TypeScript
- Defense-in-depth security
- Scalable cursor-based pagination

---

## Technology Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│                 │    │                 │    │                 │
│   React         │◄──►│  Node.js        │◄──►│   MongoDB       │
│   Vite          │    │  Express.js     │    │   Mongoose      │
│   TypeScript    │    │  TypeScript     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Backend Technologies:**

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Database**: MongoDB with Mongoose ODM 8.19.0
- **Authentication**: JSON Web Tokens (JWT) via jsonwebtoken 9.0.2
- **Validation**: Zod 4.1.11 schemas
- **Security**:
    - Helmet 8.1.0 (security headers)
    - CORS 2.8.5 (cross-origin resource sharing)
    - express-rate-limit 8.1.0 (rate limiting)
    - express-xss-sanitizer 2.0.1 (XSS protection)
- **Password Hashing**: bcryptjs 3.0.2
- **HTTP Status Codes**: http-status-codes 2.3.0
- **Logging**: morgan 1.10.1
- **Email Validation**: validator 13.15.15
- **Development**: tsx 4.20.6 (TypeScript execution)

---

## Architecture Overview

The backend follows a layered architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    GLOBAL MIDDLEWARE LAYER                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────┐  │
│  │express.json()│ │Rate Limiting │ │   CORS   │ │ Helmet  │  │
│  └──────────────┘ └──────────────┘ └──────────┘ └─────────┘  │
│  ┌──────────────┐                                            │
│  │   Morgan     │                                            │
│  └──────────────┘                                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                      ROUTE LAYER                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐  │
│  │ /api/v1/   │ │ /api/v1/   │ │ /api/v1/   │ │ /api/v1/  │  │
│  │   auth     │ │   users    │ │   posts    │ │  comments │  │
│  └────────────┘ └────────────┘ └────────────┘ └───────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                 ROUTE-SPECIFIC MIDDLEWARE                    │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────────┐│
│ │ XSS Sanitize │ │ Validation   │ │   Authentication        ││
│ └──────────────┘ └──────────────┘ └─────────────────────────┘│
│ ┌──────────────┐ ┌──────────────┐                            │
│ │Authenticate  │ │ValidateObjId │                            │
│ │OrContinue    │ │              │                            │
│ └──────────────┘ └──────────────┘                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   CONTROLLER LAYER                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐  │
│  │   Auth    │ │   Users   │ │   Posts   │ │   Comments   │  │
│  │Controller │ │Controller │ │Controller │ │  Controller  │  │
│  └───────────┘ └───────────┘ └───────────┘ └──────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                     MODEL LAYER                              │
│      ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│      │ User Model  │ │ Post Model  │ │  Comment Model      │ │
│      └─────────────┘ └─────────────┘ └─────────────────────┘ │
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
backend/
├── src/
│   ├── app.ts                        # Express app configuration
│   ├── server.ts                     # Server startup and database connection
│   ├── configs/                      # Configuration files
│   │   ├── corsOptions.ts            # CORS configuration
│   │   └── rateLimitOptions.ts       # Rate limiting settings
│   ├── controllers/                  # Business logic handlers
│   │   ├── authController.ts         # Authentication operations
│   │   ├── usersControllers.ts       # User management operations
│   │   ├── postsController.ts        # Post CRUD operations
│   │   └── commentController.ts      # Comment operations
│   ├── errors/                       # Custom error classes
│   │   ├── index.ts                  # Error exports
│   │   ├── CustomError.ts            # Base error class
│   │   ├── HttpError.ts              # HTTP-specific errors
│   │   ├── BadRequestError.ts        # 400 errors
│   │   ├── UnauthorizedError.ts      # 401 errors
│   │   ├── UnauthenticatedError.ts   # 401 errors
│   │   ├── NotFoundError.ts          # 404 errors
│   │   ├── ConflictError.ts          # 409 errors
│   │   ├── InternalServerError.ts    # 500 errors
│   │   ├── DatabaseError.ts          # Database-specific errors
│   │   ├── MongoDuplicateError.ts    # Mongo duplicate key errors
│   │   ├── JWTConfigurationError.ts  # JWT config errors
│   │   └── EnvVarsMissingError.ts    # Environment variable errors
│   ├── middlewares/                  # Request processing middleware
│   │   ├── authenticate.ts           # JWT authentication
│   │   ├── authenticateOrContinue.ts # Optional authentication
│   │   ├── validateWithZod.ts        # Input validation
│   │   ├── validateObjectId.ts       # MongoDB ObjectID validation
│   │   ├── errorHandler.ts           # Global error handling
│   │   └── notFound.ts               # 404 handler
│   ├── models/                       # Database models
│   │   ├── User.ts                   # User schema and methods
│   │   ├── Post.ts                   # Post schema
│   │   └── Comment.ts                # Comment schema
│   ├── routes/                       # Route definitions
│   │   ├── authRoutes.ts             # Authentication endpoints
│   │   ├── usersRoutes.ts            # User endpoints
│   │   ├── postsRoutes.ts            # Post endpoints
│   │   └── commentsRoutes.ts         # Comment endpoints (nested)
│   ├── schemas/                      # Validation schemas
│   │   ├── userSchemas.ts            # User input validation
│   │   ├── postSchemas.ts            # Post validation
│   │   └── commentSchemas.ts         # Comment validation
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.ts                    # API response types
│   │   ├── express.d.ts              # Express extensions
│   │   └── index.d.ts                # General types
│   └── utils/                        # Utility functions
│       ├── dbConnect.ts              # MongoDB connection
│       ├── checkEnvVars.ts           # Environment variable validation
│       ├── hashPassword.ts           # Password hashing
│       ├── comparePasswords.ts       # Password comparison
│       └── createJWT.ts              # JWT creation
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── eslint.config.mjs                 # ESLint configuration
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
2. Load environment variables from .env file
   - NODE_ENV (production/development)
   - PORT (default: 3000)
   - MONGODB_URI (production database)
   - MONGODB_LOCAL_URI (development database)
   - JWT_SECRET (for token signing)
     │
     ▼
3. Validate required environment variables
   checkEnvVars(['NODE_ENV', 'PORT', 'MONGODB_URI', 'MONGODB_LOCAL_URI'])
   ├─ Success ──┐
   └─ Failure ──┼── Throw EnvVarsMissingError → Exit process
                │
                │
                ▼ 
4. Select database URI based on NODE_ENV
   DB_URI = NODE_ENV === "production" ? MONGODB_URI : MONGODB_LOCAL_URI
     │
     ▼
5. Create HTTP server with Express app
   server = http.createServer(app)
     │
     ▼
6. Connect to MongoDB via databaseConnect(DB_URI)
   ├─ Success ──┐
   └─ Failure ──┼── Log error → Exit process with code 1
                │
                │
                ▼ 
7. Start HTTP server on specified PORT
   server.listen(PORT)
     │
     ▼
[READY] Server listening for requests
   Console: "[system] server is running on port 3000"
   Console: "[system] successfully connected to MongoDB..."
```

**Key Points:**

- Environment variables are validated before any server operations
- Database connection is established **before** accepting HTTP requests
- If database connection fails, the process exits immediately (fail-fast approach)
- Different database URIs for production and development environments
- All startup errors are logged with `[system]` prefix for easy filtering

**Error Scenarios:**

- Missing environment variables → Process exits with error message
- Invalid MONGODB_URI → DatabaseError thrown, process exits
- Database connection timeout → Error logged, process exits
- Port already in use → Error logged, process exits

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
│ 1. express.json() ──────────► Parse JSON request body       │
│ 2. rateLimit() ─────────────► Check rate limits (300/15min) │
│    ├─ Under limit ──┐                                       │
│    └─ Exceeded ─────┼─► 429 Too Many Requests               │
│ 3. cors() ───────────────────► Apply CORS policy            │
│    ├─ Allowed origin ───┐                                   │
│    └─ Blocked origin ───┼─► 403 Forbidden                   │
│ 4. helmet() ─────────────────► Set security headers         │
│ 5. morgan('tiny') ───────────► Log request                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE MATCHING                           │
│                                                             │
│ Express router matches URL pattern:                         │
│ • /api/v1/auth/*                                            │
│ • /api/v1/users/*                                           │
│ • /api/v1/posts/*                                           │
│ • /api/v1/comments/* (nested under posts)                   │
│                                                             │
│ No match? ────────────────────► notFound middleware (404)   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                ROUTE-SPECIFIC MIDDLEWARE                    │
│                                                             │
│ Applied based on route requirements:                        │
│ • xss() ────────────────────► XSS sanitization              │
│ • validateWithZod(schema) ──► Input validation              │
│   ├─ Valid ────┐                                            │
│   └─ Invalid ──┼─► 400 Bad Request with error details       │
│ • authenticate() ───────────► JWT verification              │
│   ├─ Valid token ──┐                                        │
│   └─ Invalid ──────┼─► 401 Unauthorized                     │
│ • authenticateOrContinue() ► Optional authentication        │
│ • validateObjectId(param) ──► MongoDB ObjectID validation   │
│   ├─ Valid ────┐                                            │
│   └─ Invalid ──┼─► 400 Bad Request                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTROLLER                             │
│                                                             │
│ Business logic execution:                                   │
│ • Extract validated input from req.body/params/query        │
│ • Execute business logic                                    │
│ • Interact with database models                             │
│ • Format response data                                      │
│ • Return JSON response with consistent structure            │
│                                                             │
│ Response format:                                            │
│ {                                                           │
│   "status": "success",                                      │
│   "data": { ... }                                           │
│ }                                                           │
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
│ • Custom HttpErrors caught by errorHandler middleware       │
│ • MongoDB duplicate key errors specially handled            │
│ • Unknown errors logged with unique errorId                 │
│ • Formatted into consistent JSON response                   │
│ • Appropriate HTTP status code set                          │
│                                                             │
│ Error response format:                                      │
│ {                                                           │
│   "status": "error",                                        │
│   "data": {                                                 │
│     "message": "Error description",                         │
│     "errorId": "uuid" (for unknown errors)                  │
│   }                                                         │
│ }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                [ERROR RESPONSE TO CLIENT]
```

---

## API Routes Deep Dive

### Authentication Routes (`/api/v1/auth`)

#### 1. User Registration: `POST /api/v1/auth/register`

**Data Flow:**

```
[CLIENT] POST /api/v1/auth/register
   Body: { nickname: "johndoe", email: "john@email.com", password: "secret123" }
     │
     ▼
[MIDDLEWARE CHAIN]
1. express.json() ──────► Parse request body
2. rateLimit() ─────────► Check if under rate limit
3. cors() ──────────────► Check origin
4. helmet() ────────────► Add security headers
5. morgan() ────────────► Log request
     │
     ▼
[ROUTE MATCHING] /api/v1/auth/register
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. xss() ──────────────► Sanitize input against XSS
2. validateWithZod(userRegisterSchema)
   ├─ Validate nickname (3-10 chars, lowercase)
   ├─ Validate email format
   ├─ Validate password length (min 6 chars)
   ├─ Optional: avatarUrl (max 2048 chars, valid URL)
   ├─ Optional: bio (max 280 chars)
   └─ Strip unknown properties
     │
     ▼
[CONTROLLER] registerUser()
1. Extract validated { nickname, email, password } from req.body
2. Create new user with User.create()
   ├─ Mongoose validates uniqueness (nickname, email)
   ├─ Pre-save hook hashes password with bcrypt (12 rounds)
   └─ Assigns unique MongoDB ObjectId as _id
3. Generate JWT token with user._id as userId
4. Format success response
5. Send HTTP 201 with user data and token
     │
     ▼
[RESPONSE] 201 Created
{
  "status": "success",
  "data": {
    "message": "User registered successfully.",
    "id": "60d5ecb54b24a1234567890a",
    "nickname": "johndoe",
    "email": "john@email.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

[ERROR SCENARIOS]
• Nickname already exists ──► 409 Conflict
• Email already exists ────► 409 Conflict
• Invalid email format ────► 400 Bad Request
• Password too short ──────► 400 Bad Request
• Database error ──────────► 500 Internal Server Error
```

#### 2. User Login: `POST /api/v1/auth/login`

**Data Flow:**

```
[CLIENT] POST /api/v1/auth/login
   Body: { email: "john@email.com", password: "secret123" }
     │
     ▼
[MIDDLEWARE CHAIN] (same as registration)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. xss() ──────────────► Sanitize input
2. validateWithZod(userLoginSchema)
   ├─ Validate email format
   └─ Validate password presence
     │
     ▼
[CONTROLLER] loginUser()
1. Extract { email, password } from validated req.body
2. Find user by email: User.findOne({ email }).select('+password')
   ├─ User not found ──────► Return 401 Unauthorized
   └─ User found ──────────► Continue
3. Compare password with stored hash using bcrypt.compare()
   ├─ Password invalid ────► Return 401 Unauthorized
   └─ Password valid ──────► Continue
4. Generate JWT token with user._id
5. Send success response with token
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Log in successful. Welcome back!",
    "id": "60d5ecb54b24a1234567890a",
    "nickname": "johndoe",
    "email": "john@email.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Security Note:** The error message for invalid email/password is intentionally generic to prevent user enumeration
attacks.

#### 3. User Logout: `POST /api/v1/auth/logout`

**Data Flow:**

```
[CLIENT] POST /api/v1/auth/logout
     │
     ▼
[MIDDLEWARE CHAIN] (global only)
     │
     ▼
[CONTROLLER] logoutUser()
1. Return success message (stateless logout)
   - JWT invalidation handled on client side
   - Server doesn't maintain session state
   - Client should delete token from storage
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Good bye!"
  }
}
```

#### 4. Get Current User: `GET /api/v1/auth/me`

**Data Flow:**

```
[CLIENT] GET /api/v1/auth/me
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
[CONTROLLER] me()
1. Extract userId from req.user
2. Find user: User.findById(userId)
   ├─ User not found ──► Return 401 Unauthenticated
   └─ User found ──────► Continue
3. Return user data (excludes password)
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User retrieved successfully",
    "id": "60d5ecb54b24a1234567890a",
    "nickname": "johndoe",
    "bio": "Software developer",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

---

### User Routes (`/api/v1/users`)

#### 1. Get User By ID: `GET /api/v1/users/:id`

**Data Flow:**

```
[CLIENT] GET /api/v1/users/60d5ecb54b24a1234567890a
   Headers: { Authorization: "Bearer <jwt_token>" } (optional)
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticateOrContinue()
   ├─ Valid token present ──► Set req.user = { userId }
   └─ No/invalid token ─────► Continue without req.user
     │
     ▼
[CONTROLLER] getUserById()
1. Extract id from req.params
2. Extract currentUserId from req.user (if authenticated)
3. Find user: User.findById(id)
   ├─ User not found ──► Return 404 Not Found
   └─ User found ──────► Continue
4. Check if current user follows this user
   isFollowing = user.followers.includes(currentUserId)
5. Return user data with isFollowing flag
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User fetched successfully.",
    "id": "60d5ecb54b24a1234567890a",
    "nickname": "johndoe",
    "email": "john@email.com",
    "bio": "Software developer",
    "avatarUrl": "https://example.com/avatar.jpg",
    "followersCount": 42,
    "followingCount": 18,
    "isFollowing": true
  }
}
```

**Note:** `isFollowing` is only calculated if the request is authenticated. This allows both public and authenticated
access to user profiles.

#### 2. Update User Profile: `PATCH /api/v1/users/me`

**Data Flow:**

```
[CLIENT] PATCH /api/v1/users/me
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { bio: "Updated bio", avatarUrl: "https://new-avatar.jpg" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. xss() ──────────────► Sanitize input
2. authenticate() ─────► Verify JWT and set req.user
3. validateWithZod(userPatchSchema)
   ├─ All fields optional (partial update)
   ├─ Same validation rules as registration
   └─ Strips unknown fields
     │
     ▼
[CONTROLLER] patchUser()
1. Extract userId from req.user
2. Extract updatePayload from validated req.body
3. Check if updatePayload is not empty
   ├─ Empty ──► Return 400 Bad Request
   └─ Has data ──► Continue
4. Update user: User.findByIdAndUpdate(userId, updatePayload, {
     new: true,        // Return updated document
     runValidators: true  // Run schema validations
   })
   ├─ User not found ──► Return 404 Not Found
   └─ Updated ─────────► Continue
5. Return updated user data
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User updated successfully.",
    "nickname": "johndoe",
    "email": "john@email.com",
    "bio": "Updated bio",
    "avatarUrl": "https://new-avatar.jpg"
  }
}
```

#### 3. Delete User: `DELETE /api/v1/users/me`

**Data Flow:**

```
[CLIENT] DELETE /api/v1/users/me
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Verify JWT and set req.user
     │
     ▼
[CONTROLLER] deleteUser()
1. Extract userId from req.user
2. Find user: User.findById(userId)
   ├─ User not found ──► Return 404 Not Found
   └─ User found ──────► Continue
3. CASCADE DELETION:
   a. Delete all user's posts: Post.deleteMany({ createdBy: userId })
   b. Delete all user's comments: Comment.deleteMany({ createdBy: userId })
   c. Remove user from all followers lists:
      User.updateMany(
        { following: userId },
        { $pull: { following: userId } }
      )
   d. Remove user from all following lists:
      User.updateMany(
        { followers: userId },
        { $pull: { followers: userId } }
      )
   e. Delete user: User.findByIdAndDelete(userId)
4. Return success message
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User deleted successfully."
  }
}
```

**Critical:** Cascade deletion ensures data integrity by removing all user-related data from the system.

#### 4. Follow User: `POST /api/v1/users/follow/:id`

**Data Flow:**

```
[CLIENT] POST /api/v1/users/follow/60d5ecb54b24a1234567890b
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Verify JWT and set req.user
     │
     ▼
[CONTROLLER] followUser()
1. Extract userId from req.user (current user)
2. Extract id from req.params (user to follow)
3. Check if userId === id
   ├─ Same user ──► Return 400 Bad Request (can't follow yourself)
   └─ Different ──► Continue
4. Update both users atomically:
   a. Add targetUserId to current user's following array
      User.findByIdAndUpdate(userId, {
        $addToSet: { following: targetUserId }
      })
   b. Add userId to target user's followers array
      User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: userId }
      })
5. Return success message
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User followed successfully."
  }
}
```

**Note:** `$addToSet` prevents duplicate entries if user tries to follow the same user multiple times.

#### 5. Unfollow User: `POST /api/v1/users/unfollow/:id`

**Data Flow:**

```
[CLIENT] POST /api/v1/users/unfollow/60d5ecb54b24a1234567890b
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[CONTROLLER] unfollowUser()
1. Extract userId from req.user
2. Extract id from req.params (user to unfollow)
3. Update both users atomically:
   a. Remove targetUserId from current user's following array
      User.findByIdAndUpdate(userId, {
        $pull: { following: targetUserId }
      })
   b. Remove userId from target user's followers array
      User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: userId }
      })
4. Return success message
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "User unfollowed successfully."
  }
}
```

#### 6. Get User Followers: `GET /api/v1/users/:id/followers`

Returns list of users who follow the specified user.

#### 7. Get User Following: `GET /api/v1/users/:id/following`

Returns list of users the specified user follows.

#### 8. Check If Following: `GET /api/v1/users/:id/is-following`

Returns boolean indicating if current user follows the specified user.

---

### Post Routes (`/api/v1/posts`)

#### 1. Get Posts (Global Feed): `GET /api/v1/posts?limit=20&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts?limit=20&cursor=60d5ecb54b24a1234567890c
     │
     ▼
[CONTROLLER] getPosts()
1. Parse query parameters:
   ├─ limit (default: 20)
   └─ cursor (optional, for pagination)
2. Build database query:
   query = cursor ? { _id: { $lt: new ObjectId(cursor) } } : {}
3. Fetch posts with cursor-based pagination:
   Post.find(query)
     .sort({ _id: -1 })        // Newest first
     .limit(limit + 1)          // Fetch one extra to check for next page
     .populate('createdBy', 'nickname')  // Join with User
4. Check if there's a next page:
   hasNextPage = posts.length > limit
   If yes, remove extra post
5. Determine next cursor:
   nextCursor = hasNextPage ? posts[last]._id : null
6. Return posts with pagination info
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Posts retrieved successfully",
    "posts": [
      {
        "_id": "60d5ecb54b24a1234567890d",
        "createdBy": {
          "_id": "60d5ecb54b24a1234567890a",
          "nickname": "johndoe"
        },
        "postContent": "Hello, world!",
        "postComments": [],
        "createdAt": "2023-01-25T14:20:00.000Z",
        "updatedAt": "2023-01-25T14:20:00.000Z"
      }
    ],
    "nextCursor": "60d5ecb54b24a1234567890e"
  }
}
```

**Note:** This is a public endpoint - no authentication required.

#### 2. Get My Posts: `GET /api/v1/posts/my-posts?limit=20&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts/my-posts?limit=20
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Verify JWT and set req.user
     │
     ▼
[CONTROLLER] getMyPosts()
1. Extract userId from req.user
2. Query posts created by current user:
   Post.find({ createdBy: userId })
     .sort({ _id: -1 })
     .limit(limit + 1)
3. Apply cursor-based pagination (same as global feed)
4. Return user's posts
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Posts retrieved successfully",
    "posts": [ /* user's posts */ ],
    "nextCursor": "..."
  }
}
```

#### 3. Get Personalized Feed: `GET /api/v1/posts/feed?limit=20&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts/feed?limit=20
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──► Verify JWT and set req.user
     │
     ▼
[CONTROLLER] getFollowedUsersPosts()
1. Extract userId from req.user
2. Find current user: User.findById(userId).select('following')
3. Get list of followed user IDs
4. Query posts from followed users:
   Post.find({ createdBy: { $in: followedUserIds } })
     .sort({ _id: -1 })
     .limit(limit + 1)
     .populate('createdBy', 'nickname')
5. Apply cursor-based pagination
6. Return personalized feed
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Posts retrieved successfully",
    "posts": [ /* posts from followed users */ ],
    "nextCursor": "..."
  }
}
```

#### 4. Get Posts By User ID: `GET /api/v1/posts/user/:id?limit=20&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts/user/60d5ecb54b24a1234567890a?limit=20
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. validateObjectId('id') ──► Validate MongoDB ObjectId
     │
     ▼
[CONTROLLER] getPostsByUserId()
1. Extract id from req.params
2. Query posts by specific user:
   Post.find({ createdBy: id })
     .sort({ _id: -1 })
     .limit(limit + 1)
     .populate('createdBy', 'nickname')
3. Apply cursor-based pagination
4. Return user's posts
     │
     ▼
[RESPONSE] 200 OK (same structure as other post queries)
```

#### 5. Create Post: `POST /api/v1/posts`

**Data Flow:**

```
[CLIENT] POST /api/v1/posts
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { postContent: "Hello, world!" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──────────► Verify JWT and set req.user
2. xss() ───────────────────► Sanitize input against XSS
3. validateWithZod(postCreateSchema)
   ├─ postContent: required, string, 1-140 chars, trimmed
   └─ Strip unknown properties
     │
     ▼
[CONTROLLER] createPost()
1. Extract userId from req.user
2. Extract postContent from validated req.body
3. Create post: Post.create({
     createdBy: userId,
     postContent
   })
   - Mongoose adds timestamps automatically
   - Validates against schema constraints
4. Return created post
     │
     ▼
[RESPONSE] 201 Created
{
  "status": "success",
  "data": {
    "message": "Post created successfully",
    "postContent": {
      "_id": "60d5ecb54b24a1234567890d",
      "createdBy": "60d5ecb54b24a1234567890a",
      "postContent": "Hello, world!",
      "postComments": [],
      "createdAt": "2023-01-25T14:20:00.000Z",
      "updatedAt": "2023-01-25T14:20:00.000Z"
    }
  }
}
```

#### 6. Get Single Post: `GET /api/v1/posts/:id`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts/60d5ecb54b24a1234567890d
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. validateObjectId('id') ──► Validate MongoDB ObjectId
     │
     ▼
[CONTROLLER] getPostById()
1. Extract id from req.params
2. Find post: Post.findById(id).populate('createdBy', 'nickname')
   ├─ Not found ──► Return 404 Not Found
   └─ Found ──────► Continue
3. Return post data
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Post retrieved successfully",
    "post": { /* post object */ }
  }
}
```

#### 7. Delete Post: `DELETE /api/v1/posts/:id`

**Data Flow:**

```
[CLIENT] DELETE /api/v1/posts/60d5ecb54b24a1234567890d
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. authenticate() ──────────► Verify JWT and set req.user
2. validateObjectId('id') ──► Validate MongoDB ObjectId
     │
     ▼
[CONTROLLER] deletePost()
1. Extract userId from req.user
2. Extract id from req.params
3. Delete with ownership check:
   Post.findOneAndDelete({ _id: id, createdBy: userId })
   ├─ Not found ──► Return 404 (not found or unauthorized)
   └─ Deleted ────► Continue
4. CASCADE: Delete all comments on this post
   Comment.deleteMany({ parentPost: id })
5. Return success message
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Post deleted successfully",
    "deletedPostId": "60d5ecb54b24a1234567890d"
  }
}
```

**Security:** The query `{ _id: id, createdBy: userId }` ensures users can only delete their own posts.

---

### Comment Routes (`/api/v1/posts/:postId/comments`)

**Note:** Comments are nested under posts, so all routes include the `postId` parameter.

#### 1. Get Comments: `GET /api/v1/posts/:postId/comments?limit=20&cursor=xyz`

**Data Flow:**

```
[CLIENT] GET /api/v1/posts/60d5ecb54b24a1234567890d/comments?limit=20
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. validateObjectId('postId') ──► Validate post ID
     │
     ▼
[CONTROLLER] getComments()
1. Extract postId from req.params
2. Parse query parameters (limit, cursor)
3. Query comments for this post:
   Comment.find({ parentPost: postId, ...cursorQuery })
     .sort({ _id: -1 })
     .limit(limit + 1)
     .populate('createdBy', 'nickname')
4. Apply cursor-based pagination
5. Return comments
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Comments retrieved successfully",
    "comments": [
      {
        "_id": "60d5ecb54b24a1234567890e",
        "createdBy": {
          "_id": "60d5ecb54b24a1234567890a",
          "nickname": "johndoe"
        },
        "parentPost": "60d5ecb54b24a1234567890d",
        "commentContent": "Great post!",
        "createdAt": "2023-01-25T15:30:00.000Z",
        "updatedAt": "2023-01-25T15:30:00.000Z"
      }
    ],
    "nextCursor": "60d5ecb54b24a1234567890f"
  }
}
```

#### 2. Create Comment: `POST /api/v1/posts/:postId/comments`

**Data Flow:**

```
[CLIENT] POST /api/v1/posts/60d5ecb54b24a1234567890d/comments
   Headers: { Authorization: "Bearer <jwt_token>" }
   Body: { commentContent: "Great post!" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. validateObjectId('postId') ──► Validate post ID
2. authenticate() ──────────────► Verify JWT and set req.user
3. xss() ───────────────────────► Sanitize input
4. validateWithZod(commentCreateSchema)
   ├─ commentContent: required, string, 1-140 chars, trimmed
   └─ Strip unknown properties
     │
     ▼
[CONTROLLER] createComment()
1. Extract userId from req.user
2. Extract postId from req.params
3. Extract commentContent from validated req.body
4. Create comment: Comment.create({
     createdBy: userId,
     parentPost: postId,
     commentContent
   })
5. Update parent post's comment array:
   Post.findByIdAndUpdate(postId, {
     $push: { postComments: newComment._id }
   })
6. Return created comment
     │
     ▼
[RESPONSE] 201 Created
{
  "status": "success",
  "data": {
    "message": "Comment created successfully",
    "commentContent": {
      "_id": "60d5ecb54b24a1234567890e",
      "createdBy": "60d5ecb54b24a1234567890a",
      "parentPost": "60d5ecb54b24a1234567890d",
      "commentContent": "Great post!",
      "createdAt": "2023-01-25T15:30:00.000Z",
      "updatedAt": "2023-01-25T15:30:00.000Z"
    }
  }
}
```

**Note:** The comment's `_id` is pushed to the parent post's `postComments` array for easy reference counting.

#### 3. Delete Comment: `DELETE /api/v1/posts/:postId/comments/:id`

**Data Flow:**

```
[CLIENT] DELETE /api/v1/posts/60d5ecb54b24a1234567890d/comments/60d5ecb54b24a1234567890e
   Headers: { Authorization: "Bearer <jwt_token>" }
     │
     ▼
[ROUTE-SPECIFIC MIDDLEWARE]
1. validateObjectId('postId') ──► Validate post ID
2. authenticate() ──────────────► Verify JWT and set req.user
3. validateObjectId('id') ──────► Validate comment ID
     │
     ▼
[CONTROLLER] deleteComment()
1. Extract userId from req.user
2. Extract id (commentId) from req.params
3. Delete with ownership check:
   Comment.findOneAndDelete({ _id: commentId, createdBy: userId })
   ├─ Not found ──► Return 404 (not found or unauthorized)
   └─ Deleted ────► Continue
4. Return success message
     │
     ▼
[RESPONSE] 200 OK
{
  "status": "success",
  "data": {
    "message": "Comment deleted successfully",
    "deletedCommentId": "60d5ecb54b24a1234567890e"
  }
}
```

**Security:** Users can only delete their own comments.

---

## Database Models and Relations

### User Model

```typescript
interface IUser {
    _id: ObjectId;              // MongoDB-generated unique ID
    nickname: string;           // Unique, 3-30 chars, lowercase
    email: string;              // Unique, validated email
    password: string;           // Hashed with bcrypt (12 rounds)
    avatarUrl?: string;         // Optional, max 2048 chars, valid URL
    bio?: string;               // Optional, max 280 chars
    followers: ObjectId[];      // Array of user IDs who follow this user
    following: ObjectId[];      // Array of user IDs this user follows
    createdAt: Date;            // Auto-generated
    updatedAt: Date;            // Auto-updated
}
```

**Schema Features:**

- **Nickname uniqueness** enforced at database level
- **Email uniqueness** enforced at database level
- **Email validation** using validator library
- **Password automatically hashed** before saving (pre-save hook)
- **Timestamps** managed by Mongoose (`{ timestamps: true }`)
- **Instance methods**:
    - `createJWT(payload?)`: Generate JWT token with user's ID
    - `comparePassword(candidatePassword)`: Verify password against hash

**Database Indexes:**

- Unique index on `nickname` field
- Unique index on `email` field
- Default `_id` index

**Password Security:**

```typescript
// Pre-save hook automatically hashes password
UserSchema.pre('save', async function hashPasswordBeforeSave() {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
});
```

### Post Model

```typescript
interface IPost {
    _id: ObjectId;              // MongoDB-generated unique ID
    createdBy: ObjectId;        // Reference to User._id
    postContent: string;        // Post text (1-140 chars)
    postComments: ObjectId[];   // Array of Comment._id references
    createdAt: Date;            // Auto-generated
    updatedAt: Date;            // Auto-updated
}
```

**Schema Features:**

- `createdBy` references User model (foreign key relationship)
- `postContent` length validation (1-140 characters)
- `postComments` array stores comment IDs for reference
- Automatic timestamps
- Content trimming

**Database Indexes:**

```javascript
// For efficient chronological queries
{
    createdAt: -1
}
```

**Recommended Additional Indexes:**

```javascript
// For user-specific queries
{
    createdBy: 1, _id
:
    -1
}

// For efficient pagination
{
    createdBy: 1, createdAt
:
    -1
}
```

### Comment Model

```typescript
interface IComment {
    _id: ObjectId;              // MongoDB-generated unique ID
    createdBy: ObjectId;        // Reference to User._id
    parentPost: ObjectId;       // Reference to Post._id
    commentContent: string;     // Comment text (1-140 chars)
    createdAt: Date;            // Auto-generated
    updatedAt: Date;            // Auto-updated
}
```

**Schema Features:**

- `createdBy` references User model (required)
- `parentPost` references Post model (required)
- `commentContent` length validation (1-140 characters)
- Automatic timestamps
- Content trimming

**Database Indexes:**

```javascript
// Compound index for efficient post-comment queries
{
    parentPost: 1, createdBy
:
    1
}
```

### Data Relationships

```
User (1) ────────── (Many) Post
  │                           │
  │                           │
  _id ←──── createdBy ────────┘
  │
  │
  │ (Many to Many - Self-referencing)
  │
  ├─► followers[]  ◄── Users who follow this user
  └─► following[]  ◄── Users this user follows


Post (1) ────────── (Many) Comment
  │                           │
  │                           │
  _id ←──── parentPost ───────┘
  │
  │
postComments[] ──► Array of comment IDs


User (1) ────────── (Many) Comment
  │                           │
  │                           │
  _id ←──── createdBy ────────┘
```

**Relationship Diagram:**

```
┌──────────────────────────────────────────────────────────────┐
│                        USER MODEL                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ _id, nickname, email, password, avatarUrl, bio         │  │
│  │ followers[], following[], createdAt, updatedAt         │  │
│  └────────────────────────────────────────────────────────┘  │
└────┬─────────────────────────────┬───────────────────────────┘
     │                             │
     │ createdBy (1:M)             │ createdBy (1:M)
     │                             │
     ▼                             ▼
┌─────────────────────┐    ┌─────────────────────┐
│   POST MODEL        │    │   COMMENT MODEL     │
│  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ _id           │  │    │  │ _id           │  │
│  │ createdBy     │  │    │  │ createdBy     │  │
│  │ postContent   │  │    │  │ parentPost    │  │
│  │ postComments[]│  │    │  │commentContent │  │
│  │ timestamps    │  │    │  │ timestamps    │  │
│  └───────────────┘  │    │  └───────────────┘  │
└──────┬──────────────┘    └─────────▲───────────┘
       │                             │
       │ parentPost (1:M)            │
       └─────────────────────────────┘
```

**Cascade Deletion Rules:**

1. **When a User is deleted:**
    - Delete all posts created by the user
    - Delete all comments created by the user
    - Remove user from all other users' `followers` arrays
    - Remove user from all other users' `following` arrays

2. **When a Post is deleted:**
    - Delete all comments on the post

3. **When a Comment is deleted:**
    - No cascade (comment ID remains in post's `postComments` array for simplicity)

**Data Isolation:**

- Users can only access/modify their own resources
- All queries include ownership checks: `{ createdBy: userId }`
- Prevents horizontal privilege escalation

---

## Security Layers

The backend implements defense-in-depth security with multiple layers:

### 1. Network Level Security

```
[Internet] ──► [Rate Limiting] ──► [CORS] ──► [Express App]
```

**Rate Limiting (express-rate-limit):**

```typescript
{
    windowMs: 15 * 60 * 1000,  // 15 minutes
        limit
:
    300,                 // Max 300 requests per window per IP
        message
:
    "Too many requests, please try again later.",
        store
:
    new MemoryStore()    // In-memory storage
}
```

- **Purpose**: Prevents brute force attacks, API abuse, and DDoS
- **Returns**: 429 Too Many Requests when exceeded
- **Scope**: Per IP address
- **Recommendation**: Use Redis store for production scalability

**CORS (Cross-Origin Resource Sharing):**

```typescript
{
    origin: ['http://localhost:5173', 'http://10.0.0.102:5173'],
        methods
:
    ['GET', 'POST', 'PATCH', 'DELETE'],
        optionsSuccessStatus
:
    200
}
```

- **Purpose**: Restricts which origins can access the API
- **Allowed Origins**: Development servers only (update for production)
- **Allowed Methods**: Only necessary HTTP methods
- **Prevents**: Unauthorized cross-origin requests

### 2. Application Level Security

```
[Request] ──► [Helmet] ──► [XSS Protection] ──► [Input Validation] ──► [Authorization]
```

**Helmet (Security Headers):**

Sets various HTTP security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY (prevents clickjacking)
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'
```

- Removes `X-Powered-By` header (hides Express.js)
- Prevents MIME type sniffing
- Protects against clickjacking
- Mitigates XSS attacks

**XSS Protection (express-xss-sanitizer):**

```typescript
// Applied to routes with user input
router.post('/register', xss(), validateWithZod(schema), registerUser);
```

- Sanitizes all user inputs before validation
- Removes potentially malicious scripts
- Applied on all routes that accept user data
- Works in conjunction with input validation

**Input Validation (Zod):**

```typescript
const userRegisterSchema = z.object({
    nickname: z.string().min(3).max(10),
    email: z.email(),
    password: z.string().min(6),
    // ... other fields
});
```

- Schema-based validation
- Type checking and format validation
- Automatic sanitization (strips unknown fields with `.strict()`)
- Detailed error messages for developers
- Prevents injection attacks

**Authorization (JWT):**

```typescript
// Middleware verifies JWT on protected routes
router.get('/me', authenticate, me);
```

- Stateless authentication
- Token includes encrypted user ID
- Verified on every protected request
- Automatic expiration (7 days default)
- Secret stored in environment variable

### 3. Data Level Security

```
[Controller] ──► [Ownership Check] ──► [Database Query] ──► [Response]
```

**Ownership Enforcement:**

```typescript
// Example: Only allow users to delete their own posts
Post.findOneAndDelete({
    _id: postId,
    createdBy: userId  // Ensures ownership
});
```

- All queries include `createdBy: userId` filter
- Users can only access/modify their own data
- Prevents horizontal privilege escalation
- Enforced at controller level

**Password Security:**

```typescript
// Hash password with bcrypt (12 salt rounds)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(candidatePassword, hashedPassword);
```

- Passwords hashed with bcrypt (12 salt rounds)
- Plain text passwords **never** stored
- Password comparison done through secure bcrypt.compare()
- Pre-save hook automatically hashes on updates

**Database Security:**

- MongoDB ObjectIds provide non-sequential identifiers (prevents enumeration)
- Mongoose schema validation as last line of defense
- No direct database queries (all through Mongoose ODM)
- Connection string stored in environment variable
- Separate production and development databases

### 4. JWT Token Security

**Token Structure:**

```
Header.Payload.Signature

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": "60d5ecb54b24a1234567890b", "iat": 1623456789, "exp": 1623543189 }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)
```

**Security Considerations:**

- JWT_SECRET must be strong and kept secret
- Tokens have 7-day expiration (configurable)
- No token blacklisting (stateless design)
- Client responsible for token storage
- **HTTPS required in production** to prevent token interception
- Token includes minimal data (only userId)

### 5. Environment Variable Security

```typescript
// Validate required environment variables on startup
checkEnvVars(['NODE_ENV', 'PORT', 'MONGODB_URI', 'MONGODB_LOCAL_URI', 'JWT_SECRET']);
```

- Sensitive configuration in `.env` file (not committed to git)
- Validation on server startup
- Process exits if required variables missing
- Different configurations for production/development

**Security Checklist:**

- ✅ Rate limiting to prevent abuse
- ✅ CORS to restrict origins
- ✅ Helmet for security headers
- ✅ XSS sanitization on all user inputs
- ✅ Input validation with Zod schemas
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Ownership checks on all operations
- ✅ MongoDB ObjectIds for non-sequential IDs
- ✅ Environment variable validation
- ✅ Error messages don't leak sensitive info
- ⚠️ HTTPS required in production (handled by hosting)
- ⚠️ Token refresh mechanism (currently not implemented)

---

## Error Handling

### Error Hierarchy

```
CustomError (Base)
    │
    ├── HttpError (Base for HTTP errors)
    │   ├── BadRequestError (400)
    │   ├── UnauthorizedError (401)
    │   ├── UnauthenticatedError (401)
    │   ├── NotFoundError (404)
    │   ├── ConflictError (409)
    │   └── InternalServerError (500)
    │
    ├── DatabaseError (Database connection/operation errors)
    ├── JWTConfigurationError (JWT secret missing/invalid)
    ├── EnvVarsMissingError (Environment variables missing)
    └── MongoDuplicateError (MongoDB duplicate key violations)
```

### Error Flow

```
[Error Occurs in Controller/Middleware]
                │
                ▼
        next(error)
                │
                ▼
┌────────────────────────────────────────────────────────┐
│         ERROR HANDLER MIDDLEWARE                       │
│                                                        │
│  Check error type:                                     │
│  ├─ HttpError? ──────────► Extract message & status    │
│  ├─ MongoDuplicateError? ─► Format duplicate key msg   │
│  └─ Unknown error? ───────► Log with UUID, return 500  │
│                                                        │
│  Format consistent response:                           │
│  {                                                     │
│    "status": "error",                                  │
│    "data": {                                           │
│      "message": "Error description",                   │
│      "errorId": "uuid" (for unknown errors)            │
│    }                                                   │
│  }                                                     │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
            [Send to Client]
```

### Error Response Format

All errors follow a consistent structure:

```json
{
  "status": "error",
  "data": {
    "message": "Descriptive error message for the client"
  }
}
```

For unknown errors:

```json
{
  "status": "error",
  "data": {
    "message": "Internal Server Error",
    "errorId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Error Handling Examples

**1. Validation Error (400 Bad Request):**

```javascript
// Input: { email: "invalid-email", password: "123" }
// Zod validation fails
{
    "status"
:
    "error",
        "data"
:
    {
        "message"
    :
        "Invalid email. String must contain at least 6 character(s)"
    }
}
```

**2. Authentication Error (401 Unauthorized):**

```javascript
// Missing or invalid JWT token
{
    "status"
:
    "error",
        "data"
:
    {
        "message"
    :
        "Authorization header missing or malformed. Expected format: Bearer 'token'."
    }
}
```

**3. Not Found Error (404):**

```javascript
// Accessing non-existent post
{
    "status"
:
    "error",
        "data"
:
    {
        "message"
    :
        "Post not found."
    }
}
```

**4. MongoDB Duplicate Error (409 Conflict):**

```javascript
// Attempting to register with existing email
{
    "status"
:
    "error",
        "data"
:
    {
        "code"
    :
        11000,
            "message"
    :
        "Email already exists."
    }
}
```

**5. Unknown Error (500):**

```javascript
// Unexpected server error
{
    "status"
:
    "error",
        "data"
:
    {
        "message"
    :
        "Internal Server Error",
            "errorId"
    :
        "550e8400-e29b-41d4-a716-446655440000"
    }
}
```

### Error Logging

```typescript
const logError = (error: unknown, errorId: string) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ErrorID: ${errorId}] Error: ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }
};
```

**Logging Strategy:**

- All errors logged to console with timestamp
- Unknown errors logged with unique UUID for tracing
- Stack traces included for debugging
- Sensitive information **never** exposed to client
- Production logs should be sent to external logging service (e.g., LogDNA, Datadog)

### Error Prevention

**At Route Level:**

```typescript
// Input validation prevents bad data from reaching controllers
router.post('/register', xss(), validateWithZod(schema), registerUser);
```

**At Controller Level:**

```typescript
// Try-catch blocks catch all errors
try {
    const user = await User.create(userData);
    res.status(201).json({status: 'success', data: user});
} catch (error) {
    next(error);  // Pass to error handler
}
```

**At Database Level:**

```typescript
// Mongoose schema validation as last defense
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {validator: (email) => validator.isEmail(email)}
    }
});
```

---

## Authentication System

### JWT (JSON Web Token) Implementation

**Authentication Flow Diagram:**

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Client      │         │    Backend      │         │    Database     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │ 1. POST /auth/register    │                           │
         │ { nickname, email, pass } │                           │
         │──────────────────────────►│                           │
         │                           │ 2. Hash password (bcrypt) │
         │                           │──────────────────────────►│
         │                           │ 3. Create user            │
         │                           │◄──────────────────────────│
         │                           │ 4. Generate JWT           │
         │                           │    payload: { userId }    │
         │                           │    sign with JWT_SECRET   │
         │ 5. Return token           │    expiry: 7 days         │
         │◄──────────────────────────│                           │
         │                           │                           │
         │ 6. Store token            │                           │
         │ (localStorage/memory)     │                           │
         │                           │                           │
         │ 7. Subsequent requests    │                           │
         │ Authorization: Bearer     │                           │
         │ <token>                   │                           │
         │──────────────────────────►│                           │
         │                           │ 8. Verify token signature │
         │                           │    with JWT_SECRET        │
         │                           │ 9. Extract userId         │
         │                           │    from payload           │
         │                           │ 10. Query with userId     │
         │                           │──────────────────────────►│
         │                           │ 11. Return user data      │
         │                           │◄──────────────────────────│
         │ 12. Protected resource    │                           │
         │◄──────────────────────────│                           │
```

### Token Generation

**In User Model:**

```typescript
UserSchema.methods.createJWT = async function createUserJWT(
    payload: Record<string, unknown> = {}
) {
    // Package the user's MongoDB _id as userId into the JWT payload
    return createJWT({userId: this._id, ...payload});
};
```

**In utils/createJWT.ts:**

```typescript
const createJWT = (payload: Record<string, unknown>): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new JWTConfigurationError('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, secret, {
        expiresIn: '7d'  // Token expires in 7 days
    });
};
```

### Token Verification

**In authenticate middleware:**

```typescript
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authorization header missing or malformed');
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new InternalServerError('JWT_SECRET not configured');
    }

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;

        // 4. Validate payload structure
        if (!isUserPayload(payload)) {
            throw new UnauthorizedError('Invalid token structure');
        }

        // 5. Attach userId to request
        req.user = {userId: payload.userId};
        next();
    } catch (error) {
        throw new UnauthorizedError('JWT verification failed');
    }
};
```

### Optional Authentication

**authenticateOrContinue middleware:**

```typescript
const authenticateOrContinue = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = {userId: payload.userId};
        } catch (error) {
            // Silently fail - continue as unauthenticated
        }
    }

    next();  // Continue regardless of token validity
};
```

**Use Case:** Routes that provide different content for authenticated vs. unauthenticated users (e.g., showing "
isFollowing" flag only for logged-in users).

### Token Payload

```json
{
  "userId": "60d5ecb54b24a1234567890b",
  "iat": 1623456789,
  // Issued At
  "exp": 1624061589
  // Expiration (7 days later)
}
```

**Minimal Design:**

- Only includes `userId` (necessary for authorization)
- Doesn't include email, nickname, or other user data
- Smaller token size
- User data can change; token doesn't need to be refreshed

### Security Considerations

**Strengths:**

- ✅ Stateless design (no server-side session storage)
- ✅ Scales horizontally (no shared session store needed)
- ✅ Token includes expiration
- ✅ Signature prevents tampering
- ✅ Secret stored in environment variable

**Limitations:**

- ⚠️ No token blacklisting (can't revoke before expiration)
- ⚠️ No refresh token mechanism (user must re-login after 7 days)
- ⚠️ Client responsible for secure token storage
- ⚠️ HTTPS required in production to prevent interception

**Best Practices:**

1. **Use HTTPS in production** - Prevents token interception
2. **Store token securely on client** - Use httpOnly cookies or secure storage
3. **Keep JWT_SECRET strong** - Use long, random string
4. **Rotate JWT_SECRET periodically** - Invalidates all existing tokens
5. **Set appropriate expiration** - Balance between UX and security
6. **Implement refresh tokens** - For long-lived sessions (future enhancement)

---

## Validation Pipeline

### Zod Schema Validation

The backend uses Zod for runtime type checking and validation.

**Validation Flow:**

```
[Raw Request Body] ──► [XSS Sanitization] ──► [Zod Schema] ──► [Validated Data] ──► [Controller]
                                                    │
                                                    ▼
                                            [Validation Error] ──► [400 Bad Request]
```

### Validation Schemas

**User Registration Schema:**

```typescript
const userBaseSchema = z.object({
    nickname: z.string().min(3).max(10),
    email: z.email(),
    password: z.string().min(6),
    avatarUrl: z.string().max(2048),
    bio: z.string().max(280),
});

const userRegisterSchema = userBaseSchema
    .pick({nickname: true, email: true, password: true})
    .extend({
        avatarUrl: userBaseSchema.shape.avatarUrl.optional(),
        bio: userBaseSchema.shape.bio.optional(),
    });
```

**Generated TypeScript Type:**

```typescript
type UserRegisterBody = {
    nickname: string;  // 3-10 chars
    email: string;     // Valid email format
    password: string;  // Min 6 chars
    avatarUrl?: string;  // Optional, max 2048 chars
    bio?: string;      // Optional, max 280 chars
};
```

**User Login Schema:**

```typescript
const userLoginSchema = userBaseSchema.pick({
    email: true,
    password: true,
});
```

**User Patch Schema:**

```typescript
const userPatchSchema = userBaseSchema.partial();
// All fields optional for partial updates
```

**Post Creation Schema:**

```typescript
const postCreateSchema = z.object({
    postContent: z.string().trim().min(1).max(140),
});
```

**Comment Creation Schema:**

```typescript
const commentCreateSchema = z.object({
    commentContent: z.string().trim().min(1).max(140),
});
```

### Validation Middleware Process

**1. Input Sanitization:**

```typescript
// XSS protection removes malicious content BEFORE validation
router.post('/register', xss(), validateWithZod(schema), registerUser);
```

**2. Schema Parsing:**

```typescript
const validateWithZod = (schema: z.Schema) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Zod validates structure, types, and constraints
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues
                    .map(issue => issue.message)
                    .join('. ');
                next(new BadRequestError(errorMessages));
            } else {
                next(error);
            }
        }
    };
```

**3. Data Transformation:**

- Automatic trimming (`.trim()`)
- Type coercion where applicable
- Unknown field removal (implicit with Zod)
- Lowercase conversion (handled by Mongoose schema)

**4. Validated Output:**

```typescript
// Input
{
    "nickname"
:
    "  JohnDoe  ",
        "email"
:
    "JOHN@EMAIL.COM",
        "password"
:
    "secret123",
        "unknownField"
:
    "malicious"
}

// After XSS + Zod validation
{
    "nickname"
:
    "johndoe",    // Trimmed, lowercased (by Mongoose)
        "email"
:
    "john@email.com", // Lowercased (by Mongoose)
        "password"
:
    "secret123"    // unknownField removed
}
```

### Validation Error Examples

**Invalid Input:**

```json
{
  "nickname": "ab",
  // Too short
  "email": "not-an-email",
  // Invalid format
  "password": "123",
  // Too short
  "unknownField": "value"
  // Not in schema
}
```

**Validation Result:**

```json
{
  "status": "error",
  "data": {
    "message": "String must contain at least 3 character(s). Invalid email. String must contain at least 6 character(s)"
  }
}
```

### ObjectId Validation

**Middleware for MongoDB ObjectId validation:**

```typescript
const validateObjectId = (paramName: string) =>
    (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[paramName];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(new BadRequestError(`Invalid ${paramName} format`));
            return;
        }

        next();
    };
```

**Usage:**

```typescript
router.get('/posts/:id', validateObjectId('id'), getPostById);
router.delete('/posts/:postId/comments/:id',
    validateObjectId('postId'),
    validateObjectId('id'),
    deleteComment
);
```

---

## Follow/Unfollow System

### System Design

The follow/unfollow system uses a **bidirectional relationship** stored in the User model:

```typescript
{
    followers: ObjectId[];   // Users who follow this user
    following: ObjectId[];   // Users this user follows
}
```

**Advantages:**

- Fast follower/following count queries
- No need for join operations
- Efficient bidirectional lookups

**Trade-offs:**

- Requires updating two documents per follow/unfollow
- Array size limits (MongoDB max document size: 16MB)
- For very large follower counts, consider separate collection

### Follow Flow

```
[CLIENT] POST /api/v1/users/follow/60d5ecb54b24a1234567890b
   Headers: { Authorization: "Bearer <token>" }
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              FOLLOW OPERATION                               │
│                                                             │
│ currentUser._id = 60d5ecb54b24a1234567890a                  │
│ targetUser._id  = 60d5ecb54b24a1234567890b                  │
│                                                             │
│ Transaction 1:                                              │
│ User.findByIdAndUpdate(currentUser._id, {                   │
│   $addToSet: { following: targetUser._id }                  │
│ })                                                          │
│ ──────────────────────────────────────────────────────────► │
│ currentUser.following.push(targetUser._id)                  │
│                                                             │
│ Transaction 2:                                              │
│ User.findByIdAndUpdate(targetUser._id, {                    │
│   $addToSet: { followers: currentUser._id }                 │
│ })                                                          │
│ ──────────────────────────────────────────────────────v───► │
│ targetUser.followers.push(currentUser._id)                  │
└─────────────────────────────────────────────────────────────┘

Result:
currentUser.following = [..., 60d5ecb54b24a1234567890b]
targetUser.followers  = [..., 60d5ecb54b24a1234567890a]
```

**Note:** `$addToSet` prevents duplicate entries if the user tries to follow the same person multiple times.

### Unfollow Flow

```
[CLIENT] POST /api/v1/users/unfollow/60d5ecb54b24a1234567890b
   Headers: { Authorization: "Bearer <token>" }
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              UNFOLLOW OPERATION                             │
│                                                             │
│ Transaction 1:                                              │
│ User.findByIdAndUpdate(currentUser._id, {                   │
│   $pull: { following: targetUser._id }                      │
│ })                                                          │
│ ──────────────────────────────────────────────────────────► │
│ Remove targetUser._id from currentUser.following            │
│                                                             │
│ Transaction 2:                                              │
│ User.findByIdAndUpdate(targetUser._id, {                    │
│   $pull: { followers: currentUser._id }                     │
│ })                                                          │
│ ──────────────────────────────────────────────────────────► │
│ Remove currentUser._id from targetUser.followers            │
└─────────────────────────────────────────────────────────────┘
```

### Personalized Feed

**Getting posts from followed users:**

```
[CLIENT] GET /api/v1/posts/feed?limit=20
   Headers: { Authorization: "Bearer <token>" }
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              FEED GENERATION                                │
│                                                             │
│ 1. Get current user's following list                        │
│    User.findById(userId).select('following')                │
│    → followedUserIds = [id1, id2, id3, ...]                 │
│                                                             │
│ 2. Query posts from followed users                          │
│    Post.find({ createdBy: { $in: followedUserIds } })       │
│      .sort({ _id: -1 })                                     │
│      .limit(limit + 1)                                      │
│      .populate('createdBy', 'nickname')                     │
│                                                             │
│ 3. Apply cursor-based pagination                            │
│                                                             │
│ 4. Return personalized feed                                 │
└─────────────────────────────────────────────────────────────┘
```

### Following Status Check

**Checking if current user follows a profile:**

```typescript
// In getUserById controller
const user = await User.findById(profileUserId);
let isFollowing = false;

if (currentUserId) {
    isFollowing = user.followers.some(
        (followerId) => followerId.toString() === currentUserId
    );
}
```

**Use Cases:**

- Show "Follow" vs "Unfollow" button
- Display personalized content
- Conditional feature access

---

## Cursor-Based Pagination

### Why Cursor-Based Pagination?

**Traditional Offset-Based Pagination Issues:**

```
// Page 1: GET /posts?page=1&limit=10
// Returns items 1-10

// Meanwhile, 5 new posts are created...

// Page 2: GET /posts?page=2&limit=10
// Returns items 11-20, but these were originally items 16-25
// Items 11-15 are skipped!
```

**Cursor-Based Pagination Benefits:**

- ✅ Consistent results even when data changes
- ✅ Efficient for large datasets (uses index)
- ✅ No duplicate items across pages
- ✅ No skipped items when data is added/removed
- ✅ Better performance (no COUNT queries needed)

### Implementation

**Database Query:**

```typescript
const getPosts = async (req: Request, res: Response) => {
    // 1. Parse parameters
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const cursor = req.query.cursor as string;

    // 2. Build query
    const query: { _id?: { $lt: ObjectId } } = {};
    if (cursor) {
        // Get posts with _id less than cursor (older posts)
        query._id = {$lt: new mongoose.Types.ObjectId(cursor)};
    }

    // 3. Fetch limit + 1 items (extra item to check if there's a next page)
    const posts = await Post.find(query)
        .sort({_id: -1})      // Newest first
        .limit(limit + 1)        // Fetch one extra
        .populate('createdBy', 'nickname');

    // 4. Check for next page
    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
        posts.pop();  // Remove the extra item
    }

    // 5. Determine next cursor
    const nextCursor = hasNextPage
        ? posts[posts.length - 1]._id.toString()
        : null;

    // 6. Return response
    res.json({
        status: 'success',
        data: {
            posts,
            nextCursor  // null if no more pages
        }
    });
};
```

### Pagination Flow Diagram

```
Initial Request:
GET /api/v1/posts?limit=3

┌──────────────────────────────────────────┐
│ All Posts (newest first, by _id):        │
│                                          │
│ Post A (_id: ...890a)  ◄─┐               │
│ Post B (_id: ...890b)    │ Page 1        │
│ Post C (_id: ...890c)  ◄─┘               │
│ Post D (_id: ...890d)  ◄─┐               │
│ Post E (_id: ...890e)    │ Page 2        │
│ Post F (_id: ...890f)  ◄─┘               │
│ Post G (_id: ...890g)  ◄── Page 3        │
└──────────────────────────────────────────┘

Response:
{
  "posts": [Post A, Post B, Post C],
  "nextCursor": "...890c"
}

Next Request:
GET /api/v1/posts?limit=3&cursor=...890c

Query: { _id: { $lt: "...890c" } }
Returns: [Post D, Post E, Post F]
nextCursor: "...890f"

Final Request:
GET /api/v1/posts?limit=3&cursor=...890f

Returns: [Post G]
nextCursor: null  // No more pages
```

### Pagination Parameters

**Request:**

```
GET /api/v1/posts?limit=20&cursor=60d5ecb54b24a1234567890c
```

- `limit`: Number of items per page (default: 20)
- `cursor`: MongoDB ObjectId of last item from previous page

**Response:**

```json
{
  "status": "success",
  "data": {
    "posts": [
      /* array of posts */
    ],
    "nextCursor": "60d5ecb54b24a1234567890e"
    // or null if last page
  }
}
```

### Client Implementation Example

```typescript
const fetchPosts = async (cursor: string | null = null) => {
    const url = cursor
        ? `/api/v1/posts?limit=20&cursor=${cursor}`
        : '/api/v1/posts?limit=20';

    const response = await fetch(url);
    const data = await response.json();

    return {
        posts: data.data.posts,
        nextCursor: data.data.nextCursor,
        hasMore: data.data.nextCursor !== null
    };
};

// Usage
let allPosts = [];
let cursor = null;

do {
    const {posts, nextCursor} = await fetchPosts(cursor);
    allPosts = [...allPosts, ...posts];
    cursor = nextCursor;
} while (cursor !== null);
```

### Performance Considerations

**Index Requirements:**

```javascript
// Ensure _id index exists (default in MongoDB)
// For filtered queries, add compound indexes:

// For user-specific posts
postSchema.index({createdBy: 1, _id: -1});

// For comments by post
commentSchema.index({parentPost: 1, _id: -1});
```

**Query Performance:**

- **O(log n)** for indexed cursor lookups
- No COUNT queries needed (unlike offset pagination)
- Consistent performance regardless of page number
- Suitable for infinite scroll UIs

---

## Performance Considerations

### Database Optimization

**1. Cursor-Based Pagination:**

```typescript
// Efficient: Uses index, constant performance
const query = cursor ? {_id: {$lt: cursor}} : {};
const posts = await Post.find(query)
    .sort({_id: 1})
    .limit(limit + 1);

// Inefficient: Performance degrades with page number
const posts = await Post.find()
    .skip(page * limit)
    .limit(limit);
```

**Benefits:**

- Constant-time performance (doesn't degrade with page number)
- Uses MongoDB index efficiently
- No expensive SKIP operations
- Suitable for infinite scroll

**2. Compound Indexes:**

```javascript
// Post model
postSchema.index({createdAt: -1});           // For chronological queries
postSchema.index({createdBy: 1, _id: -1});   // For user-specific pagination

// Comment model
commentSchema.index({parentPost: 1, createdBy: 1});  // For post comments
```

**3. Selective Field Population:**

```typescript
// Good: Only populate needed fields
Post.find(query)
    .populate('createdBy', 'nickname')  // Only get nickname

// Bad: Populates all fields (including password!)
Post.find(query)
    .populate('createdBy')
```

**4. Lean Queries:**

```typescript
// Returns plain JavaScript objects (faster)
const posts = await Post.find(query).lean();

// Returns full Mongoose documents (slower, but with methods)
const posts = await Post.find(query);
```

### Memory Management

**1. Stateless Design:**

- No server-side sessions
- JWT tokens eliminate session storage
- Scales horizontally without shared state
- Memory usage independent of concurrent users

**2. Connection Pooling:**

```typescript
// Mongoose handles connection pooling automatically
mongoose.connect(uri, {
    // Default pool size: 5
    // Adjust based on load
});
```

**3. Request Limits:**

- Rate limiting prevents memory exhaustion
- Maximum request body size (Express default: 100kb)
- Pagination limits prevent large result sets

### Security Performance

**1. Password Hashing:**

```typescript
// bcrypt is CPU-intensive but necessary
// 12 salt rounds = ~250ms per hash
const hashedPassword = await bcrypt.hash(password, 12);
```

**Trade-off:**

- Higher rounds = more secure, but slower
- 12 rounds is industry standard
- Async hashing doesn't block event loop

**2. Rate Limiting:**

```typescript
// Prevents resource exhaustion from abuse
{
    windowMs: 15 * 60 * 1000,  // 15 minutes
        limit
:
    300                  // 300 requests per window
}
```

**3. Input Validation:**

- Happens before database queries
- Early rejection prevents expensive operations
- Zod validation is fast (negligible overhead)

### Query Optimization

**1. Avoid N+1 Queries:**

```typescript
// Bad: N+1 queries
const posts = await Post.find();
for (const post of posts) {
    post.user = await User.findById(post.createdBy);  // N queries!
}

// Good: Single query with populate
const posts = await Post.find().populate('createdBy');  // 1 query
```

**2. Projection:**

```typescript
// Only select needed fields
User.findById(userId).select('nickname email bio');

// Exclude sensitive fields
User.findOne({email}).select('-password');
```

**3. Limit Result Sets:**

```typescript
// Always use limits
Post.find().limit(100);

// For counting, use countDocuments (more efficient than .length)
const count = await Post.countDocuments({createdBy: userId});
```

### Monitoring and Logging

**1. Request Logging (Morgan):**

```typescript
// 'tiny' format: minimal overhead
app.use(morgan('tiny'));

// Output: GET /api/v1/posts 200 45.123 ms - 1234
```

**2. Error Logging:**

```typescript
// All errors logged with timestamp and UUID
console.error(`[${timestamp}] [ErrorID: ${errorId}] Error: ${error.message}`);
```

**3. Database Query Logging (Development):**

```typescript
mongoose.set('debug', process.env.NODE_ENV === 'development');
```

### Caching Strategies (Future Enhancements)

**1. Redis for Frequent Queries:**

```typescript
// Cache user profiles (frequently accessed)
// Cache post feeds (computationally expensive)
// Cache follower counts
```

**2. HTTP Caching Headers:**

```typescript
// For public, rarely-changing data
res.set('Cache-Control', 'public, max-age=300');
```

---

## Development and Deployment

### Environment Variables

```bash
# .env file (DO NOT commit to git)

# Server Configuration
NODE_ENV=development           # or 'production'
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mini-community
MONGODB_LOCAL_URI=mongodb://localhost:27017/mini-community

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
```

**Environment Variable Validation:**

```typescript
// server.ts validates on startup
checkEnvVars([
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'MONGODB_LOCAL_URI',
    'JWT_SECRET'
]);
```

### NPM Scripts

```json
{
  "scripts": {
    "dev": "node --env-file=.env --import tsx --watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "lint:fix": "eslint 'src/**/*.{ts,tsx}' --fix",
    "check": "tsc --watch --noEmit",
    "clean": "rm -rf node_modules .turbo node_modules/.cache dist .tsbuildinfo",
    "rebuild": "npm run clean && npm install && npx tsc --force"
  }
}
```

**Script Descriptions:**

- **dev**: Development server with hot reload and automatic env file loading
- **build**: Compile TypeScript to JavaScript (output to `dist/`)
- **start**: Run compiled JavaScript (production)
- **lint**: Check code style with ESLint
- **lint:fix**: Auto-fix linting issues
- **check**: Type-check TypeScript without emitting files
- **clean**: Remove all generated files and dependencies
- **rebuild**: Clean install and rebuild

### Development Workflow

**1. Initial Setup:**

```bash
# Clone repository
git clone <repo-url>
cd mini-community/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Then edit with your values

# Start MongoDB locally (or use MongoDB Atlas)
mongod

# Start development server
npm run dev
```

**2. Development Cycle:**

```bash
# Run type checking in one terminal
npm run check

# Run dev server in another terminal
npm run dev

# Make code changes
# Server auto-reloads on file save
```

**3. Code Quality:**

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### Production Deployment

**Build Process:**

```bash
# 1. Install production dependencies only
npm ci --production

# 2. Compile TypeScript
npm run build

# 3. Start server
NODE_ENV=production npm start
```

**Deployment Checklist:**

- [ ] Set `NODE_ENV=production`
- [ ] Use production `MONGODB_URI`
- [ ] Generate strong `JWT_SECRET` (min 32 characters)
- [ ] Update CORS `origin` to production frontend URL
- [ ] Enable HTTPS (handled by hosting platform)
- [ ] Set up environment variables on hosting platform
- [ ] Configure rate limiting for production traffic
- [ ] Set up logging service
- [ ] Configure monitoring and alerts
- [ ] Set up database backups
- [ ] Consider using Redis for rate limiting (instead of MemoryStore)

**Hosting Recommendations:**

- **Backend**: Render, Railway, Fly.io, DigitalOcean App Platform
- **Database**: MongoDB Atlas (managed MongoDB)
- **DNS/CDN**: Cloudflare (for DDoS protection)

### Testing Considerations

**Current State:**

- No automated tests currently implemented
- Manual testing via API clients (Postman, Thunder Client, curl)

**Recommended Test Structure:**

```
backend/
├── src/
└── tests/
    ├── unit/                        # Unit tests for utilities
    │   ├── hashPassword.test.ts
    │   ├── createJWT.test.ts
    │   └── comparePasswords.test.ts
    ├── integration/                 # Integration tests for routes
    │   ├── auth.test.ts
    │   ├── users.test.ts
    │   ├── posts.test.ts
    │   └── comments.test.ts
    └── e2e/                         # End-to-end tests
        └── userFlow.test.ts
```

**Testing Stack Recommendations:**

- **Test Runner**: Jest or Vitest
- **Assertions**: Built-in or Chai
- **HTTP Mocking**: Supertest
- **Database**: MongoDB Memory Server (for testing)
- **Coverage**: c8 or Istanbul

---

## Conclusion

The Mini Community backend demonstrates modern Node.js/Express.js best practices for building a social media platform.

### Architecture Strengths

**1. Clean Separation of Concerns:**

- Routes define endpoints
- Middleware handles cross-cutting concerns
- Controllers contain business logic
- Models encapsulate data layer
- Clear, maintainable structure

**2. Type Safety:**

- TypeScript throughout codebase
- Zod schemas for runtime validation
- Type inference from schemas
- Mongoose TypeScript integration
- Reduced runtime errors

**3. Security First:**

- Multiple security layers (network, application, data)
- JWT-based authentication
- XSS protection
- Rate limiting
- Input validation
- Ownership enforcement
- Password hashing with bcrypt
- CORS policy
- Security headers via Helmet

**4. Scalable Design:**

- Stateless authentication (horizontal scaling)
- Cursor-based pagination (efficient for large datasets)
- Database indexes for performance
- Connection pooling
- No session storage

**5. Developer Experience:**

- Consistent API responses
- Detailed error messages
- Type safety catches errors early
- Hot reload in development
- Comprehensive logging
- Clear code organization

### Key Features

**Authentication & Authorization:**

- JWT-based stateless authentication
- Secure password hashing
- Optional authentication support
- User ownership validation

**Social Features:**

- User following system
- Personalized feeds
- Global and user-specific feeds
- Follower/following counts

**Content Management:**

- Post creation and deletion
- Comment system with nesting
- Cursor-based pagination
- Efficient data retrieval

**Data Integrity:**

- Cascade deletion (users, posts, comments)
- Bidirectional relationships (followers/following)
- Mongoose schema validation
- Transaction-like operations

### Production Readiness

**Completed:**

- ✅ Comprehensive error handling
- ✅ Security middleware stack
- ✅ Input validation
- ✅ Database schema design
- ✅ TypeScript type safety
- ✅ Environment variable validation
- ✅ Cursor-based pagination
- ✅ Request logging

**Recommended Enhancements:**

- 🔄 Implement automated tests (unit, integration, e2e)
- 🔄 Add refresh token mechanism
- 🔄 Implement Redis caching for frequent queries
- 🔄 Add database migration system
- 🔄 Set up CI/CD pipeline
- 🔄 Implement rate limiting with Redis (for production)
- 🔄 Add WebSocket support for real-time features
- 🔄 Implement image upload service
- 🔄 Add email verification
- 🔄 Implement password reset flow
- 🔄 Add audit logging
- 🔄 Set up APM (Application Performance Monitoring)

### Technology Decisions

**Why Express.js?**

- Mature, battle-tested framework
- Large ecosystem of middleware
- Flexible and unopinionated
- Excellent TypeScript support

**Why MongoDB?**

- Flexible schema for social media data
- Excellent horizontal scaling
- Native ObjectId for unique identifiers
- Aggregation pipeline for complex queries
- Good fit for document-based data (posts, users)

**Why JWT?**

- Stateless (scales horizontally)
- No server-side session storage
- Industry standard
- Works across services

**Why Zod?**

- Runtime type validation
- Type inference for TypeScript
- Composable schemas
- Better error messages than alternatives
- Active development

### Final Thoughts

This backend provides a solid foundation for a social media platform. The architecture is clean, secure, and scalable.
The code is well-organized and type-safe, making it maintainable and easy to extend.

**Next Steps:**

1. Implement automated testing
2. Add real-time features (WebSockets)
3. Implement caching strategy
4. Set up production monitoring
5. Add rate limiting with Redis
6. Implement email notifications
7. Add analytics and metrics

The system is ready for deployment and can handle production traffic with appropriate infrastructure (MongoDB Atlas,
hosting platform, CDN).

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-10

