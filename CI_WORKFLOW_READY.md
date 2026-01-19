CI workflow for GitHub Actions (move to .github/workflows/ci.yml after backing up the existing .github file).

Why this file exists here
Because this repository currently contains a file named ".github" (not a directory), GitHub Actions workflows cannot be created in-place. This file contains the exact workflow YAML; after you back up/rename the ".github" file you can move this file to .github/workflows/ci.yml to enable CI.

Steps to enable the workflow (run in repo root):

1) Backup the existing .github file and create the workflows directory
   git mv ".github" ".github-backup"
   git add -A && git commit -m "Backup .github file"
   mkdir -p .github/workflows

2) Move this file into place
   # Git Bash / Linux / macOS
   mv student-directory-app/CI_WORKFLOW_READY.md .github/workflows/ci.yml

   # PowerShell (Windows)
   Move-Item -Path .\student-directory-app\CI_WORKFLOW_READY.md -Destination .\.github\workflows\ci.yml

3) Add, commit and push
   git add .github/workflows/ci.yml
   git commit -m "Add CI workflow"
   git push origin develop

CI workflow YAML (save these exact lines as .github/workflows/ci.yml):

name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: student-directory-app/backend
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run backend tests
        run: |
          pytest -q

Notes:
- This workflow runs pytest in student-directory-app/backend and assumes requirements.txt contains test dependencies (pytest added).
- After you move the file into .github/workflows and push, GitHub Actions will run on pushes/PRs to main and develop.

If you want, I can produce a PowerShell script that performs the backup/move/commit sequence for you to run locally.