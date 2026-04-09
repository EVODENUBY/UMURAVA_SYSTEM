#  Backend Development Rules

##  Overview

This document defines the rules and standards for backend development in the Umurava AI System.
All backend contributors must follow these guidelines to ensure consistency, scalability, and maintainability.

---

## 1. Responsibilities

* Backend developers work **only inside `/backend`**
* Do not modify frontend code unless agreed
* Maintain clean API structure and documentation

---

## 2. Branching Rules

* Do NOT push directly to `main`
* Always create feature branches:

Examples:

* feature/auth-api
* feature/user-management
* bugfix/login-error

---

## 3. Workflow

1. Pull latest code:
   **git checkout main**
   **git pull origin main**

2. Create branch:
   **git checkout -b feature/your-feature-name**

3. Work and commit:
   **git add .**
   git commit -m "feat: add new endpoint"

4. Push:
   git push origin feature/your-feature-name

5. Open Pull Request → main

---


## 4. Coding Standards

* Use clear and descriptive variable names
* Use async/await (avoid callbacks)
* Keep functions small and reusable
* Separate logic into services (no logic in routes)

Example:

* routes → handle request
* controller → process logic
* service → business logic

---

## 6. Security Rules

* NEVER commit `.env` files
* Always validate user input
* Use authentication (JWT)
* Hash passwords before saving

---

## 7. API Design Rules

* Use RESTful conventions:

GET    /api/applicants
POST   /api/chat
PUT    /api/users/:id
DELETE /api/users/:id

* Use proper HTTP status codes:

  * 200 → Success
  * 201 → Created
  * 400 → Bad request
  * 401 → Unauthorized
  * 500 → Server error

---

##  8. Testing

* Test endpoints before pushing
* Use tools like Postman or Thunder Client
* Ensure no breaking changes

---

## 9. Dependencies

* Install only necessary packages
* Remove unused dependencies
* Keep package.json clean

---

## 10. Commit Rules

Use standard commit messages:

* feat: new feature
* fix: bug fix
* refactor: code improvement
* docs: documentation update

---

##  11. Code Review Rules

Before merging:

* Code must run without errors
* No console logs in production
* Clean and readable code
* Follow project structure

---

## 12. Deployment Readiness

Before merging to main:

* Backend must start without errors
* All environment variables documented
* API tested and working

---

## 13. Best Practices

* Keep controllers thin
* Use services for logic
* Use middleware for reusable logic
* Write scalable and modular code

---

##  14. Forbidden

* ❌ Pushing node_modules
* ❌ Hardcoding secrets
* ❌ Breaking API structure
* ❌ Skipping PR process

---

##  15. Final Rule

"Clean code is better than clever code."

Write code your teammates can easily understand and maintain.
