# Student Directory App

A modern, multi-container student directory application built for the Continuous & Agile Software Engineering course at Athens Tech College.

## Features
- Add and view students in a simple web UI
- Python Flask backend API
- MySQL database with persistent storage
- Nginx frontend serving static files and proxying API requests
- Fully Dockerized with docker-compose
- Automated CI/CD pipeline with GitHub Actions
- Unit and integration tests for backend

## Quick Start

1. **Clone the repository:**
   ```sh
   git clone https://github.com/MK-Dev-Coder/Continuous-Agile-Software-Engineering-Git-Collaboration-DevOps-CI-CD-.git
   cd Continuous-Agile-Software-Engineering-Git-Collaboration-DevOps-CI-CD-
   ```
2. **Build and run the app:**
   ```sh
   docker-compose build
   docker-compose up -d
   ```
3. **Visit the app:**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure
```
student-directory-app/
  frontend/      # Nginx, HTML, CSS, JS
  backend/       # Flask API, requirements.txt
  db/            # MySQL init script
  docker-compose.yml
  README.md
  AGILE_REPORT.md
  DOCKER_REPORT.md
```

## Documentation
- **AGILE_REPORT.md:** Agile/SDLC planning and process
- **DOCKER_REPORT.md:** Architecture, Docker, CI/CD, and reflection

## CI/CD
- Automated with GitHub Actions: builds, tests, and lints on every push/PR

## Authors
- Michail-Angelos Karvelis (MK-Dev-Coder)

---
For coursework and educational use only.