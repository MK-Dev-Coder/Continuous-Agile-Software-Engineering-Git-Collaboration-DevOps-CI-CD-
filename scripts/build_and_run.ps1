param(
    [string]$DockerHubUser = "",
    [switch]$Push
)

# Build backend image
Write-Host "Building backend image..."
Push-Location -Path (Join-Path $PSScriptRoot "..\backend")
docker build -t student-directory-backend:local .
if ($DockerHubUser -ne "") {
    docker tag student-directory-backend:local $DockerHubUser/student-directory-backend:v1
    if ($Push) { docker push $DockerHubUser/student-directory-backend:v1 }
}
Pop-Location

# Build frontend image
Write-Host "Building frontend image..."
Push-Location -Path (Join-Path $PSScriptRoot "..\frontend")
docker build -t student-directory-frontend:local .
if ($DockerHubUser -ne "") {
    docker tag student-directory-frontend:local $DockerHubUser/student-directory-frontend:v1
    if ($Push) { docker push $DockerHubUser/student-directory-frontend:v1 }
}
Pop-Location

# Start docker-compose
Write-Host "Starting docker-compose (building if needed)..."
Push-Location -Path (Join-Path $PSScriptRoot "..")
docker-compose -f docker-compose.yml up --build -d
Pop-Location

Write-Host "All done. Frontend: http://localhost:8080  Backend: http://localhost:5000"
