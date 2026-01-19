Build and run instructions for the student-directory-app

Prerequisites
- Docker & docker-compose installed
- (Optional) Docker Hub account to push images

Build backend image

cd student-directory-app\backend
docker build -t <your-dockerhub-username>/student-directory-backend:v1 .

Build frontend image

cd ../frontend
docker build -t <your-dockerhub-username>/student-directory-frontend:v1 .

Start the full stack with docker-compose (recommended)

# from repository root
docker-compose -f student-directory-app\docker-compose.yml up --build -d

Check services

docker ps

Access the app
- Frontend (nginx) will be reachable on http://localhost:8080
- Backend API on http://localhost:5000/api/students

Persistent storage (MySQL)
- The compose file defines a named volume `db_data` mapped to /var/lib/mysql
- To list volumes: docker volume ls
- To inspect a volume: docker volume inspect <volume-name>

Notes on volumes and container removal
- docker-compose down (without -v) stops and removes containers but preserves named volumes
- docker-compose down -v removes volumes as well (data will be lost)

Tagging and pushing images (optional)

docker tag student-directory-backend:latest <your-dockerhub-username>/student-directory-backend:v1
docker push <your-dockerhub-username>/student-directory-backend:v1

Running backend tests (locally)

cd student-directory-app\backend
python -m venv venv  # optional
# activate the venv and install dependencies
pip install -r requirements.txt
pytest -q

If you want me to create a Windows PowerShell script to perform the backup and move of .github then commit the CI workflow, tell me and I will generate it.

Windows PowerShell (build & run helper)

From the repository root you can run the provided helper script:

```powershell
# build images and start compose (no push):
.\scripts\build_and_run.ps1

# build images, tag for Docker Hub and push:
.\scripts\build_and_run.ps1 -DockerHubUser "myuser" -Push
```

Notes:
- The script builds local images `student-directory-backend:local` and `student-directory-frontend:local`.
- If you pass `-DockerHubUser` the script will tag images as `<user>/...:v1` and when `-Push` is supplied it will push them.

Running tests with PowerShell helper

From repository root you can run tests either locally (requires Python) or inside Docker:

```powershell
# Run tests using local Python virtual environment (creates .venv in backend/):
.\scripts\run_tests.ps1

# Run tests inside backend container via docker-compose (no local Python needed):
.\scripts\run_tests.ps1 -UseDocker
```

Notes:
- The local path creates a `.venv` folder in `backend/` and installs `requirements.txt` before running `pytest`.
- If your machine lacks Python, use `-UseDocker` to run tests inside the service container.