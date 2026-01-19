param(
    [switch]$UseDocker
)

if ($UseDocker) {
    Write-Host "Running tests inside backend container using docker-compose..."
    Push-Location -Path (Join-Path $PSScriptRoot "..")
    # Ensure the backend image is built (installs pytest from requirements)
    docker-compose -f docker-compose.yml build backend
    # Run tests inside a disposable container (will use the rebuilt image)
    docker-compose -f docker-compose.yml run --rm backend pytest -q
    Pop-Location
    return
}

# Local venv-based test runner
Write-Host "Creating virtual environment (\.venv) and running tests locally..."
$venvPath = Join-Path $PSScriptRoot "..\backend\.venv"
Push-Location -Path (Join-Path $PSScriptRoot "..\backend")

if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not available on PATH. Install Python 3.8+ or use -UseDocker to run tests in Docker."
    Pop-Location
    exit 1
}

if (-Not (Test-Path $venvPath)) {
    python -m venv .venv
}

# Activate and install
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating venv..."
    . .\venv\Scripts\Activate.ps1
    pip install --upgrade pip
    pip install -r requirements.txt
    python -m pytest -q
} else {
    Write-Error "Could not find activation script; ensure venv was created successfully."
    exit 1
}

Pop-Location
