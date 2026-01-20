# Student Directory App

A simple 3-tier student directory application (frontend, API, DB) used for teaching CI/CD and containerization.

Features
- Static frontend served by Nginx (port 8080)
- Flask backend providing a JSON REST API (port 5000)
- MySQL database for persistent storage (internal to docker-compose)

Quick start (local)

1. From repository root, build and start services:

```powershell
cd student-directory-app
docker-compose up --build -d
```

2. Open the frontend in your browser:

http://localhost:8080

3. Backend API endpoints:

- GET /api/students — list students
- POST /api/students — add a student (JSON body: `name`, `email`, `phone`)

Run backend tests (inside container):

```powershell
docker exec student-directory-app-backend-1 python -m pytest -q
```


