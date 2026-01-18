# Docker & Architecture Report

## 1. Architecture Description
- **Multi-container setup:**
  - Nginx (frontend)
  - Flask (backend API)
  - MySQL (database)
- **Communication:** All containers use a user-defined Docker network (`studentnet`).
- **Exposed ports:**
  - Nginx: 8080 (host) → 80 (container)
  - Flask: 5000 (host) → 5000 (container)
  - MySQL: 3306 (internal only)
- **Volumes:**
  - MySQL data: `db_data` (named volume)
  - DB init script: bind mount (`./db/init.sql`)

# Docker & Architecture Report

## 1. Architecture Description
- **Multi-container setup:**
  - Nginx (frontend)
  - Flask (backend API)
  - MySQL (database)
- **Communication:** All containers use a user-defined Docker network (`studentnet`).
- **Exposed ports:**
  - Nginx: 8080 (host) → 80 (container)
  - Flask: 5000 (host) → 5000 (container)
  - MySQL: 3306 (internal only)
- **Volumes:**
  - MySQL data: `db_data` (named volume)
  - DB init script: bind mount (`./db/init.sql`)

## 2. Architecture Diagram

```
[Browser] → [Nginx (8080)] → [Flask API (5000)] → [MySQL]
```

## 3. Dockerfile Explanation
- **Backend Dockerfile:**
  - FROM python:3.11-slim
  - WORKDIR /app
  - COPY requirements.txt ./
  - RUN pip install -r requirements.txt
  - COPY . .
  - CMD ["python", "app.py"]
- **Frontend Dockerfile:**
  - FROM nginx:alpine
  - COPY index.html, styles.css, app.js to nginx html dir

## 4. Persistent Data Explanation
- **Volumes vs Bind Mounts:**
  - Named volume (`db_data`) stores MySQL data, survives container deletion.
  - Bind mount (`init.sql`) seeds DB on first run.
- **Why:** Volumes are best for DB data; bind mounts for config/scripts.
- **Demo commands:**
  - `docker volume ls`
  - `docker volume inspect student-directory-app_db_data`

## 5. Build & Run Instructions
```sh
docker-compose build
docker-compose up
```
- Visit http://localhost:8080 for the app.

## 6. Reflection
**Challenges:**
  - Docker networking and ensuring all services communicate correctly
  - Volume persistence and verifying data survives container restarts
  - Integrating CI/CD to automate builds and tests
  - Debugging Dockerfile and compose errors in the pipeline

**Learned:**
  - Container immutability and why stateless design matters
  - How Docker image layering affects build speed and cache
  - Using Docker CLI and Compose for orchestration
  - Troubleshooting and reading CI/CD logs

## 7. CI/CD Pipeline Results
- The project uses GitHub Actions to build, test, and lint Dockerfiles on every push and pull request.
- All backend tests are run automatically in the pipeline.
- Docker images are built for both backend and frontend.
- Linting is performed on Dockerfiles using hadolint.

### Example Pipeline Output
_Replace the placeholder below with a screenshot of a successful GitHub Actions run (e.g., `.github/workflows/ci.yml` passing)._

![CI success placeholder](screenshots/ci_success.png)

## 8. Screenshots
Add images to the `screenshots/` folder (not committed here) and update the paths below. Suggested images:

- `screenshots/ci_success.png` — Successful GitHub Actions run (build & tests passed)
- `screenshots/docker_ps.png` — `docker ps` showing running containers
- `screenshots/docker_volume_ls.png` — `docker volume ls` output
- `screenshots/docker_volume_inspect.png` — `docker volume inspect student-directory-app_db_data`

Example image usage (Markdown):

![Running containers](screenshots/docker_ps.png)

## 9. Release Notes
See [RELEASE_NOTES_v1.0.md](RELEASE_NOTES_v1.0.md) for the release summary and suggested GitHub Release body.
