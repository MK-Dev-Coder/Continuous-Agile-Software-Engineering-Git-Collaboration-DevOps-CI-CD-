# Agile/SDLC Report
## 1. Planning
* **Scope:** Build a 3-tier containerized student directory app.
* **Goals:** Automate deployment with Docker and CI/CD.
* **Timeline:** Sprint 1 (Core App), Sprint 2 (Docker), Sprint 3 (CI/CD).

## 2. Analysis
* **Pain Points:** "Dependency hell" in manual setups; Database data loss risks.
* **Requirements:** Python Flask API, MySQL DB, Nginx Proxy.

## 3. Design
* **High-Level Architecture:**
	- 3-tier: Nginx (frontend proxy), Flask API (backend), MySQL (database)
	- All services run in Docker containers, connected via a user-defined Docker network
* **Responsibilities:**
	- Nginx: Serves static HTML/CSS, proxies API requests
	- Flask: Handles business logic, serves API endpoints
	- MySQL: Stores persistent student data

## 4. Implementation
* **Code Written:**
	- Frontend: HTML/CSS for student directory UI
	- Backend: Flask API for CRUD operations
	- Database: MySQL schema for students
* **Branching Workflow:**
	- main: production-ready
	- develop: integration
	- feature branches: e.g., feature-frontend, feature-backend, feature-db

## 5. Testing
* **Unit Tests:**
	- Backend API endpoints tested with pytest/unittest
* **Integration Tests:**
	- (Optional) End-to-end tests for API + DB

## 6. Deployment
* **Pipeline:**
	- CI/CD pipeline builds images, runs tests, and deploys containers
	- Docker Compose manages multi-container setup

## 7. Maintenance
* **Future Improvements:**
	- Add authentication, improve UI, expand API
* **Retrospective:**
	- Document lessons learned, challenges, and next steps
