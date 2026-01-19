# Merge Conflict Demo — Steps to create and resolve

This file documents commands to intentionally create a merge conflict and resolve it. Run these locally to produce the required evidence for the coursework.

1) Prepare base file

```bash
git checkout -b demo-base
echo "Line A" > CONFLICT_DEMO.txt
git add CONFLICT_DEMO.txt
git commit -m "chore: add conflict demo base file"
git push -u origin demo-base
```

2) Create two feature branches with conflicting edits

```bash
git checkout -b feature-1 demo-base
echo "Feature 1 change" > CONFLICT_DEMO.txt
git commit -am "feat: feature-1 edit"
git push -u origin feature-1

git checkout demo-base
git checkout -b feature-2
echo "Feature 2 change" > CONFLICT_DEMO.txt
git commit -am "feat: feature-2 edit"
git push -u origin feature-2
```

3) Merge `feature-1` into `demo-base` (no conflict)

```bash
git checkout demo-base
git merge feature-1
git push origin demo-base
```

4) Now attempt to merge `feature-2` into `demo-base` — this will cause a conflict

```bash
git merge feature-2
# Git will report a conflict in CONFLICT_DEMO.txt
```

5) Resolve the conflict manually

```bash
# open CONFLICT_DEMO.txt, edit to the desired final content, then:
git add CONFLICT_DEMO.txt
git commit -m "fix: resolve merge conflict between feature-1 and feature-2"
git push origin demo-base
```

6) Documenting the resolution

- Include the pre-merge diffs (`git show feature-1:CONFLICT_DEMO.txt`, `git show feature-2:CONFLICT_DEMO.txt`) and the final file content after resolve. Commit these logs/screenshots to your report.
