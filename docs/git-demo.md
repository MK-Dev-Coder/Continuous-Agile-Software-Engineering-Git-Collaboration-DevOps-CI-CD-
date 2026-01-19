# Git Demo: Commands & Examples

This document records key Git operations required by the coursework, with short explanations.

1) Clone repository

```bash
git clone <repo-url>
cd <repo-folder>
```

2) Branching

```bash
# create feature branch
git checkout -b feature-backend

# work, add, commit
git add .
git commit -m "feat: add student create endpoint"

# push feature branch
git push -u origin feature-backend
```

3) Fetch & compare (remote diff)

```bash
git fetch origin
git diff origin/develop..feature-backend
```

4) Merging (fast-forward or no-ff)

```bash
git checkout develop
git merge --no-ff feature-backend -m "Merge feature-backend into develop"
git push origin develop
```

5) Rebase (example and explanation)

```bash
# Bring feature up to date with develop via rebase
git checkout feature-backend
git fetch origin
git rebase origin/develop

# Resolve any conflicts, then continue
git add <resolved-file>
git rebase --continue

# Explanation: rebasing rewrites the feature branch history so it appears as if changes were made on top of the latest develop. Use only for local/feature branches that are not shared, or coordinate when rewriting shared history.
```

6) Tagging a release

```bash
git checkout main
git tag -a v1.0 -m "Release v1.0"
git push origin v1.0
```

7) Rolling back: `git revert` vs `git reset`

```bash
# Safe: create a new commit that undoes a previous commit
git revert <commit-hash>

# Unsafe: reset public history (use only on local branches)
git reset --hard <commit-hash>
# WARNING: --hard will discard commits and working changes. Avoid on shared branches.
```

8) Good commit message examples

- `feat: add /students POST endpoint with validation`
- `fix(auth): correct token expiry parsing`
- `chore: update requirements.txt to pin mysql-connector-python`
