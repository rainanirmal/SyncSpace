# SyncSpace

A backend-first project management and collaboration platform, built with Node.js, Express.js, and MongoDB.

## Overview

SyncSpace is being built to help teams organize projects, manage tasks, and collaborate in one place. Development is intentionally sequenced backend-first: the API, authentication, and data layer are built and tested before any UI work begins.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| API Testing | Postman / Newman |
| Frontend | Planned (not yet built) |

## Features

| Feature | Status |
|---|---|
| User authentication (JWT) | ✅ Done |
| REST API (CRUD) | ✅ Done |
| API testing (Postman/Newman) | ✅ Done |
| Project management endpoints | ✅ Done |
| Task management endpoints | ✅ Done |
| Frontend UI | 🔜 Planned |
| Deployment | 🔜 Planned |

## Why Backend-First?

The frontend was intentionally deferred to focus on strengthening API design, authentication flows, and endpoint testing — the core of a reliable full-stack application.

## Getting Started

```bash
git clone https://github.com/rainanirmal/SyncSpace.git
cd SyncSpace
npm install
npm start
```

Create a `.env` file with your MongoDB URI and JWT secret before running.

## Author

**Raina Nirmal** — [GitHub](https://github.com/rainanirmal)