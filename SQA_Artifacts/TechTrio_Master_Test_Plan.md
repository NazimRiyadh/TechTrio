# Master Test Plan for TechTrio E-Commerce Platform

## 1. Introduction
**Project Name:** TechTrio  
**Description:** A full-stack e-commerce application built with React, Node.js, PostgreSQL, and Redis. Features include product search, cart management, checkout with Stripe integration, and role-based access control (Admin/User).  
**Prepared By:** Nazim-E-Alam (SQA Engineer)

## 2. Testing Objectives
- Ensure all end-to-end user workflows (Registration -> Search -> Cart -> Checkout) function seamlessly without data loss or UI interruption.
- Validate REST APIs for data integrity, correct status codes, and proper schema validation.
- Verify security aspects including JWT-based authentication, password encryption, and Role-Based Access Control (RBAC).
- Confirm integration with third-party services (Stripe for payments, Nodemailer for emails, Pinecone for vector search).

## 3. Scope of Testing
### In-Scope
- **Functional Testing:** All frontend and backend features visible to the user and admin.
- **API Testing:** CRUD operations for Products, Orders, Auth, and Payments.
- **Integration Testing:** Payment Gateway (Stripe) and Email Gateway integrations.
- **Security Testing:** Authentication flows, session expiry, token tampering, and basic XSS/SQLi prevention checks.
- **Performance/Load:** Basic rate-limiting validation on authentication and checkout endpoints using Redis.

### Out-of-Scope
- **Automated UI Testing:** (Currently manual execution, transitioning to Playwright in Phase 2).
- **Deep Penetration Testing:** Formal security audits are out of scope for this cycle.

## 4. Test Environment & Tools
- **Frontend Environment:** Windows 10/11, Chrome (latest), Firefox (latest)
- **Backend:** Node.js (v18+), Express
- **Database:** PostgreSQL (Primary), Redis (Caching & Rate Limiting)
- **API Testing Tools:** Postman, Swagger UI
- **Defect Tracking:** Jira / GitHub Issues

## 5. Entry & Exit Criteria
### Entry Criteria
- Development phase for the module is completed and unit tested.
- Test Environment is configured and DB is seeded with sample data.
- API documentation (Swagger/Postman collection) is up-to-date.

### Exit Criteria
- 100% of defined critical and high-priority Test Cases are executed.
- No 'Blocker' or 'Critical' defects remain open.
- All functional requirements outlined in the PRs/Tickets have been verified.
- Test Summary Report is published.

## 6. Deliverables
1. Master Test Plan
2. Functional Test Scenarios
3. API Test Cases (Postman Collection / Spreadsheet)
4. Defect Reports
5. Final Execution Summary
