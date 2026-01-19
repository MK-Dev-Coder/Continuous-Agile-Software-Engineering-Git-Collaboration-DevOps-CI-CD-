@echo off
REM Demo runner for student-directory-app (Windows)
echo Starting student-directory-app via docker-compose (student-directory-app\docker-compose.yml)

REM Ensure you run this file from anywhere; %~dp0 is the script directory
set COMPOSE_FILE=%~dp0docker-compose.yml

echo Using compose file: %COMPOSE_FILE%

docker-compose -f "%COMPOSE_FILE%" up --build -d

echo Containers started. Run 'docker ps' to verify.
