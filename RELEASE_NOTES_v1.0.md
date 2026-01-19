# Release v1.0 - Student Directory App

Release: v1.0
Date: 2026-01-18

## Summary
This release packages the student-directory application with a multi-container Docker setup (Nginx frontend, Flask backend, MySQL database), a GitHub Actions CI pipeline that runs backend tests and lints Dockerfiles, and an example `docker-compose.yml` to run the stack locally.

## Notable Features
- Add / View students via a simple web UI (name, email, phone).
- Backend: Flask API exposing `GET /api/students` and `POST /api/students`.
- Frontend: static HTML/CSS/vanilla JS served by Nginx; proxied API requests to backend.
- Persistence: MySQL container with named volume `db_data` and `db/init.sql` seed.
- CI: GitHub Actions workflow runs unit tests and builds images; Dockerfiles are linted with hadolint.
- Container orchestration: `docker-compose.yml` to build and run all services.

## Changelog (high level)
- Initial project scaffold: frontend, backend, db.
- Implemented student add/list functionality (with email and phone fields).
- Added unit tests for backend endpoints and edge cases.
- Integrated Dockerfiles and `docker-compose` with a working nginx proxy configuration.
- Added CI workflow for tests and Docker lint/build.
- Merged `develop` into `main` and tagged release `v1.0`.

## Suggested GitHub Release Body
Title: v1.0 — Student Directory App

Description:
```
Release v1.0: student-directory-app

Highlights:
- Multi-container Docker stack (Nginx, Flask, MySQL)
- Backend API with unit tests (automated in CI)
- Frontend static UI with add/list student functionality
- Docker Compose for local development

How to run locally:
1. docker-compose build
2. docker-compose up
3. Open http://localhost:8080


```


