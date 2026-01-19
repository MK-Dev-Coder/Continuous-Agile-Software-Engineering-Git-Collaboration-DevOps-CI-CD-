Project Git workflow and commands (short guide)

Branches
- main: stable, production-ready
- develop: integration branch
- feature/*: feature branches (use kebab-case or short-descriptive names), e.g., feature-auth, feature-api

Common commands

# Create a feature branch
git checkout -b feature/your-feature

# Work and commit (use clear messages explaining WHY)
git add <files>
git commit -m "feat: add X to allow Y because ..."

# Push and open PR
git push -u origin feature/your-feature
# Open a PR on GitHub targeting 'develop'

Rebasing example (to keep history linear)

# Fetch remote updates
git fetch origin
# Rebase your feature branch onto updated develop
git checkout feature/your-feature
git rebase origin/develop

# If conflicts occur: edit files, then
git add <resolved-files>
git rebase --continue
# To abort rebase if needed
git rebase --abort

Merging
- Prefer merging via Pull Request (squash or merge commit depending on team rules)
- To merge locally and push:
  git checkout develop
  git pull origin develop
  git merge --no-ff feature/your-feature
  git push origin develop

Tags and releases

# Create an annotated tag for a release (locally)
git checkout main
git pull origin main
git tag -a v1.0 -m "Release v1.0"
# Push tag to remote
git push origin v1.0

Rolling back changes

# Safe: revert a specific commit (creates a new commit that undoes changes)
git revert <commit-sha>

# Unsafe: reset (rewrites history) - avoid on shared branches
git reset --hard <commit-sha>
# If you must reset public history, coordinate with the team and force-push:
# git push --force-with-lease origin branch-name

Simulating and resolving merge conflicts

# Cause a conflict by modifying the same lines of a file on both develop and feature branch, commit and push.
# Try merging locally to see the conflict handling:
git checkout develop
git pull origin develop
git merge feature/your-feature
# Git will report conflicts. Edit the files to resolve, then:
git add <resolved-files>
git commit
git push origin develop

Commit message guidance
- Use types like feat:, fix:, docs:, chore:, test:, refactor:
- Explain why the change was needed, not only what changed
- Keep commits small and focused

Code review checklist
- Link to PR_CHECKLIST.md in this repo
- Ensure tests are present and CI passes before merge

Note: All git operations that change history (reset, rebase with push) should be done carefully and communicated to team members.