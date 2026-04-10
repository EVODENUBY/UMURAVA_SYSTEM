#  FRONTEND DEVELOPER RULES

## Overview

This document defines the rules and standards for frontend development in the Umurava AI System.
All frontend contributors must follow these guidelines to ensure a consistent, scalable, and high-quality UI/UX.

---

##  1. Responsibilities

* Frontend developers work **only inside `/frontend`**
* Do not modify backend code unless agreed
* Focus on UI, UX, and API integration

---

## 2. Branching Rules

* Do NOT push directly to `main`
* Always create feature branches

Examples:

* feature/login-ui
* feature/dashboard-ui
* bugfix/navbar-error

---

## 🔁 3. Workflow

1. Pull latest code:
   git checkout main
   git pull origin main

2. Create branch:
   git checkout -b feature/your-feature-name

3. Work and commit:
   git add .
   git commit -m "ui: add login page"

4. Push:
   git push origin feature/your-feature-name

5. Open Pull Request → main

---

## 5. UI/UX Standards

* Keep design **clean and modern**
* Use consistent colors and spacing
* Ensure responsiveness (mobile, tablet, desktop)
* Avoid cluttered layouts
* Use reusable components

---

## 6. Coding Standards

* Use functional components (React. Next)
* Use hooks (useState, useEffect, etc.)
* Keep components small and reusable
* Avoid duplicate code

Example:

* One component = one responsibility

---

##  7. API Integration Rules

* All API calls must be in `/services`
* Do NOT call APIs directly inside components
* Use async/await
* Handle errors properly

---

##  8. Performance Rules

* Optimize images
* Avoid unnecessary re-renders
* Lazy load components when needed
* Keep bundle size small

---

##  9. Testing

* Test UI before pushing
* Check responsiveness
* Ensure no console errors

---

##  10. Styling Rules

* Use consistent styling approach (CSS, Tailwind, or MUI)
* Avoid inline styles unless necessary
* Use variables for colors and spacing

---

##  11. Commit Rules

Use clear commit messages:

* ui: UI changes
* feat: new feature
* fix: bug fix
* refactor: code improvement

---

##  12. Code Review Rules

Before merging:

* UI must be responsive
* No broken layouts
* No console errors
* Clean and readable code

---

##  13. Deployment Readiness

Before merging to main:

* Frontend builds successfully
* No runtime errors
* API integration works correctly

---

##  14. Best Practices

* Use reusable components
* Keep logic separate from UI
* Use proper folder structure
* Write readable and maintainable code

---

##  15. Forbidden

* ❌ Pushing node_modules
* ❌ Hardcoding API URLs (use .env)
* ❌ Mixing backend logic
* ❌ Skipping PR process

---

## 16. Final Rule

"Users judge the system by the UI."

Make it clean, fast, and user-friendly.
