# Rollback Demo (Revert vs Reset)

This document records the safe and unsafe rollback demonstrations used for the coursework.

Purpose
- Show `git revert` (safe) which creates a new commit that undoes a previous commit.
- Show `git reset --hard` (unsafe) which removes commits from history and can cause data loss if pushed/shared.

Commands performed (run in the project root)

1) Create a throwaway branch for the demo:

```bash
git checkout -b temp-rollback-demo
```

2) Create an accidental commit (the "mistake"):

```bash
echo "temporary mistake" > error.txt
git add error.txt
git commit -m "mistake: created error file for rollback demo"
```

3) Safe revert (undo with a new commit):

```bash
# creates a revert commit that undoes the effect of the mistake
git revert HEAD
```

- Effect: history remains linear; the revert is a new commit that negates the previous commit. This is safe for branches that have been shared.

4) Unsafe reset (demonstration — do NOT run on public branches):

```bash
# create another temporary bad commit
mkdir temp_demo || true
echo "bad content" > temp_demo/bad_file.txt
git add temp_demo/bad_file.txt
git commit -m "temp: bad commit to demonstrate reset"

# then remove that commit from history
git reset --hard HEAD~1
```

- Effect: `git reset --hard` moves the branch pointer and rewrites history locally. Commits removed by this command are lost locally (and permanently if not recoverable). If this was pushed and others pulled, it causes divergence and requires force-push or complex recovery. Use only on local, non-shared branches.

5) Cleanup the demo branch:

```bash
# switch back and delete the demo branch
git checkout develop
git branch -D temp-rollback-demo
```

Notes for the report
- Include screenshots of the terminal after each step showing `git log --oneline -n 5` before/after revert and after reset to demonstrate the difference.
- Explain why `git revert` is recommended for public branches and `git reset --hard` is only for private, local cleanup.

Recorded outputs
- This document contains command examples for reproducibility. If you want, I can run these commands locally in the repo and capture the terminal output into `docs/rollback_transcript.txt` and commit it for evidence.
