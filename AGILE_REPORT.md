# Agile / SDLC Report

## 1. Planning
- **Scope:** Deliver a 3‑tier containerized student directory application (frontend, API, DB) with automated build/test/deploy.
- **Goals:** Provide a reproducible development workflow (Git + branching), container images, Docker Compose orchestration, CI pipeline that runs tests and builds images, and persistent DB storage.
- **Timeline / Sprints:**
	- Sprint 1 (2 weeks): Core backend API + unit tests.
	- Sprint 2 (1 week): Frontend UI, basic Nginx reverse proxy, and Dockerfiles.
	- Sprint 3 (1 week): Compose, persistence, and CI pipeline (test + build).
- **Assumptions:** Developers have Docker & docker-compose installed; CI runner supports Docker (or uses buildx); environment variables store secrets in CI.

## 2. Analysis
- **Functional requirements:**
	- CRUD API for student records (create, read, update, delete).
	- Static frontend served by Nginx that calls the API.
	- Persistent storage for student data (MySQL).
- **Non-functional requirements:**
	- Images should be small and deterministic.
	- Services reachable on known ports: frontend on 8080, backend on 5000.
	- Data persistence across container recreation.
- **Pain points & mitigations:**
	- Dependency/version drift → Dockerfiles pin base images and use a `requirements.txt`.
	- Data loss → use named Docker volume `db_data` for MySQL.

## 3. Design
- **High-level architecture:** 3-tier system: Nginx (frontend), Flask backend, MySQL database. Services run in Docker containers on a user-defined bridge network `studentnet` and communicate by service name.

- **Responsibilities:**
	- Frontend (Nginx): serve static assets and proxy API calls to backend.
	- Backend (Flask): implement business logic and provide JSON REST endpoints on port 5000.
	- Database (MySQL): store student records persistently in a named volume.

- **Ports / Networks / Volumes:**
	- Frontend: host 8080 -> container 80
	- Backend: host 5000 -> container 5000
	- DB: internal only, exposed to backend via service name `db`
	- Named volume: `db_data` -> /var/lib/mysql (preserves data across container restarts)

- **Architecture diagram (ASCII):**

	[Browser] -> http://localhost:8080 -> [Nginx frontend]
																				 \-> proxies /api -> [Flask backend] -> [MySQL:db mounted on db_data]

## 4. Implementation
- **Files & locations (key items):**
	- [docker-compose.yml](docker-compose.yml#L1-L200) – orchestrates `frontend`, `backend`, `db` and the `db_data` volume.
	- [backend/Dockerfile](backend/Dockerfile#L1-L20) – builds the Flask app from `python:3.11-slim` and installs `requirements.txt`.
	- [backend/app.py](backend/app.py#L1) – Flask application with API routes.
	- [backend/requirements.txt](backend/requirements.txt#L1-L20) – lists `flask`, `mysql-connector-python`, `pytest`.
	- [frontend/Dockerfile](frontend/Dockerfile#L1-L20) – nginx-based static site.
	- [db/init.sql](db/init.sql#L1-L50) – initial schema for students.

- **Branching workflow and Git practices:**
	- `main` — production-ready stable code (tag releases here, e.g., `v1.0`).
	- `develop` — integration branch for completed features.
	- `feature/*` — short-lived feature branches, e.g., `feature-backend`, `feature-db`.
	- Example commands used in coursework:

		- Create feature branch: `git checkout -b feature-backend`
		- Merge feature into develop (after PR & review): `git checkout develop` then `git merge --no-ff feature-backend`
		- Rebase example (one-time): `git checkout feature-x` then `git rebase develop` (and resolve conflicts), with explanation: rebasing rewrites history and should be used for local cleanup before pushing.
		- Tagging a release: `git tag -a v1.0 -m "Release v1.0"` then `git push origin v1.0`.

## 5. Testing
- **Unit tests:** Backend tests live in `backend/` (files `test_app.py`, `test_app_*`) and are run with `pytest`. Example: `cd backend && pip install -r requirements.txt && pytest -q`.
- **Integration tests (optional):** Start compose with `docker-compose up --build -d` and run E2E checks against `http://localhost:8080` and API endpoints.
- **CI pipeline:** The CI workflow executes `pytest`, builds images, and (optionally) pushes tags. Tests run inside pipeline before build artifacts are published.

## 6. Deployment
- **How pipeline packages and deploys:**
	- CI runs tests; if they pass, images are built from `backend/` and `frontend/` Dockerfiles.
	- `docker-compose` is used for local deployment; in a CI/CD production scenario, images are pushed to a registry and deployed to a container host or orchestrator.
- **Local run:** from repository root run:

```
docker-compose -f student-directory-app/docker-compose.yml up --build -d
```

## 7. Persistent Storage (Docker)
- **Approach used:** named Docker volume `db_data` mounted into MySQL at `/var/lib/mysql` to persist database files.
- **Commands demonstrated in repo:**
	- Create/list volumes: `docker volume ls`
	- Inspect volume: `docker volume inspect db_data`
	- Remove containers but keep data: `docker-compose down`
	- Remove volumes (data lost): `docker-compose down -v`

## 8. Collaboration & Code Review (simulation)
- **Required steps demonstrated in repository docs:**
	- Create feature branch, push to remote, open a PR to `develop` (see `GIT_WORKFLOW_GUIDE.md`).
	- Code review checklist available in `PR_CHECKLIST.md` that covers code hygiene, tests, documentation, and security considerations.
	- An intentional merge conflict should be created and resolved locally to demonstrate conflict resolution—record the steps and commit the result.

### 8.1 Rollback demo (revert vs reset)
We created a rollback demonstration to show the difference between safe and unsafe history operations.

- See `docs/rollback_demo.md` for the exact commands and explanation.
- Summary:
	- `git revert HEAD` — creates a new commit that undoes the previous commit (safe for shared branches).
	- `git reset --hard HEAD~1` — removes the latest commit from the branch history (unsafe for shared branches).

Include the recorded terminal screenshots in the report to show `git log --oneline` before and after each operation.

## Evidence Collected
The repository includes the following evidence files (in `screenshots/` and `docs/`):

- `screenshots/DockerDirectory.png` — `docker ps` showing running containers
- `screenshots/Docker.png` — `docker volume ls` output
- `screenshots/Dockels.png` — `docker volume inspect` output
- `docs/rollback_demo.md` — commands and explanations for revert vs reset demo

Add additional screenshots (CI success, PR page) to `screenshots/` and I'll embed them in the reports.

## 9. Maintenance & Retrospective
- **Future improvements:** add authentication (JWT/OAuth), add CI deployment to a registry, add integration tests and health checks, improve error handling and input validation.
- **Retrospective notes:** keep commits small and atomic, document rebases and resets when used, and prefer `git revert` for public branches to avoid rewriting shared history.

---

If you want, I can:
- add a short PowerShell script to build images and run compose on Windows,
- create a `docs/git-demo.md` that records the exact Git commands used (rebase, revert, reset) with examples, or
- run the backend tests here and report results.

Requested next step?
