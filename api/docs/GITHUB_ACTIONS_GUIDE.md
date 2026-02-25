# GitHub Actions Testing Guide

## 🎯 Overview

GitHub Actions runs your tests automatically in the cloud. No manual intervention needed after setup.

---

## ✅ Setup (Already Complete)

We've already set up everything needed:

```
.github/workflows/test.yml  ← Workflow configuration (already pushed)
```

**You don't need to do anything else in terminal for GitHub Actions to work.**

---

## 🌐 How to Use GitHub Actions (Website)

### Step 1: Navigate to Actions Tab

1. Go to: `https://github.com/costa-rica/KyberVision23`
2. Click **"Actions"** tab (top navigation bar)

```
┌──────────────────────────────────────────────────────┐
│ Code  Issues  Pull requests  Actions  Projects  Wiki │  ← Click here
└──────────────────────────────────────────────────────┘
```

### Step 2: View Test Runs

You'll see a list of workflow runs:

```
All workflows          Search workflows...

✅ Add GitHub Actions workflow for automated testing
   Run API Tests #3 · main
   Triggered 5 minutes ago · Took 28s

✅ Add production server cleanup handover documentation
   Run API Tests #2 · main
   Triggered 12 minutes ago · Took 31s

✅ Remove adminDb.test.ts and clean up compiled test files
   Run API Tests #1 · main
   Triggered 1 hour ago · Took 29s
```

**Status indicators:**
- ✅ Green checkmark = All tests passed
- ❌ Red X = Tests failed
- 🟡 Yellow circle = Tests running
- ⚪ Gray circle = Queued/waiting

### Step 3: View Detailed Results

Click on any run to see:

**Summary page shows:**
```
Run API Tests #3
✅ Completed in 28s

Jobs:
  ✅ test (18.x) - 27s
  ✅ test (20.x) - 28s
```

**Click "test (18.x)" or "test (20.x)" to see:**
- Full test output
- Which tests passed/failed
- Error messages (if any)
- Complete logs

### Step 4: Expand Log Details

Each step shows output:

```
▼ Run tests
  > kybervision23api@1.0.0 test
  > jest

  PASS tests/videos.test.ts
  PASS tests/sessions.test.ts
  PASS tests/users.test.ts
  ...

  Test Suites: 12 passed, 12 total
  Tests:       9 skipped, 68 passed, 77 total
  Time:        23.74s
  ✅
```

---

## 🤖 When Tests Run Automatically

GitHub Actions runs automatically when:

### 1. You Push to main or develop
```bash
# On your Mac
git add .
git commit -m "Fix bug"
git push origin main
```
→ **Triggers tests automatically** 🤖

### 2. Someone Opens a Pull Request
```
Create PR: feature-branch → main
```
→ **Tests run before merge** 🤖

### 3. You Push to a Pull Request Branch
```bash
git push origin feature-branch
```
→ **Tests run on the PR** 🤖

**You don't need to click anything - it just happens!**

---

## 🔧 Optional: Manual Trigger

You can also trigger tests manually:

### On GitHub Website:

1. Go to **Actions** tab
2. Click **"Run API Tests"** (left sidebar)
3. Click **"Run workflow"** button (right side)
4. Select branch (usually `main`)
5. Click green **"Run workflow"** button

**When to use this:**
- Testing the workflow itself
- Re-running failed tests without new commit
- Debugging GitHub Actions issues

**Most of the time, you won't need to do this** - automatic triggers are sufficient.

---

## 📊 Reading Test Results

### Green ✅ = Safe to Deploy

```
All checks have passed
✅ Run API Tests — 68 tests passed

You're good to deploy to production! 🚀
```

### Red ❌ = Don't Deploy

```
Some checks failed
❌ Run API Tests — 2 tests failed

1. Click the red X to see which tests failed
2. Read the error messages
3. Fix the code locally
4. Push again - tests will re-run automatically
```

---

## 🔄 Complete Workflow Example

### Scenario: You fix a bug

**On your Mac:**
```bash
# 1. Make changes
vim src/routes/users.ts

# 2. Test locally (optional but recommended)
npm test

# 3. Commit and push
git add src/routes/users.ts
git commit -m "Fix user login validation"
git push origin main
```

**On GitHub (automatic):**
```
🤖 GitHub detects push to main branch
🤖 Triggers "Run API Tests" workflow
🤖 Spins up Ubuntu server
🤖 Installs Node.js 18 and 20
🤖 Installs dependencies
🤖 Runs npm test on both versions
🤖 Reports results

✅ All tests passed!
```

**Back to you:**
```
✅ See green checkmark on commit
✅ Safely deploy to production
✅ Run smoke tests on production
```

**Total time from push to results: ~30 seconds**

---

## 📧 Optional: Email Notifications

GitHub can email you when tests fail:

### Enable Notifications:

1. Go to: `https://github.com/settings/notifications`
2. Scroll to **"Actions"**
3. Check: ☑ **"Send notifications for failed workflows only"**
4. Choose: Email, Web, or Both

Now you'll get an email if tests fail.

---

## 🆚 Comparison: Old vs New

### Old Way (What You Tried):
```bash
# On production server ❌
ssh production-server
cd /path/to/api
npm install          # Installs 500+ packages
npm test             # 💥 Crashes with OOM
```

**Problems:**
- ❌ Runs on production server
- ❌ Uses production resources
- ❌ Can crash production
- ❌ Requires manual SSH and commands

### New Way (GitHub Actions):
```bash
# On your Mac ✅
git push origin main
```

**Then GitHub automatically:**
- ✅ Runs on GitHub's servers (not yours)
- ✅ Fresh environment every time
- ✅ Can't affect production
- ✅ Results in 30 seconds
- ✅ No manual intervention needed

---

## 🎓 Key Concepts

### What is GitHub Actions?

Think of it as a **robot assistant** that:
1. Watches your repository 24/7
2. When you push code, it wakes up
3. Runs your tests on a fresh Ubuntu server
4. Reports back: "Tests passed ✅" or "Tests failed ❌"
5. Cleans up and goes back to sleep

### What is a "Workflow"?

A **workflow** is a recipe (YAML file) that tells GitHub:
- When to run (on push, on PR, etc.)
- What to run (install deps, run tests, etc.)
- Where to run (Ubuntu, what Node.js version, etc.)

Our workflow: `.github/workflows/test.yml`

### What is a "Job"?

A **job** is one task in the workflow. Our workflow has one job called "test" that runs on two Node.js versions (18 and 20).

### What is a "Run"?

A **run** is one execution of the workflow. Every time you push, that's a new run.

---

## 🎯 Quick Reference

| Task | Where | How |
|------|-------|-----|
| Set up workflow | Terminal (done) | Create .yml file, commit, push |
| View test results | GitHub website | Actions tab → Click run |
| Trigger tests | Automatic | Just push code |
| Re-run tests | GitHub website | Click "Re-run jobs" |
| Configure workflow | Terminal | Edit .yml file, commit, push |
| Get notifications | GitHub settings | Enable email notifications |

---

## ✅ Your Next Steps

1. **Go check it out:**
   - Visit: https://github.com/costa-rica/KyberVision23/actions
   - You should see 2-3 successful runs already

2. **Test it:**
   ```bash
   # Make a small change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test GitHub Actions"
   git push

   # Then watch it run on GitHub Actions tab
   ```

3. **Bookmark the Actions page:**
   - You'll check this before deploying to production
   - Green ✅ = safe to deploy
   - Red ❌ = fix issues first

---

## 💡 Pro Tips

**Tip 1:** Add the Actions badge to your README
```markdown
![Tests](https://github.com/costa-rica/KyberVision23/actions/workflows/test.yml/badge.svg)
```
Shows test status directly on your repo homepage.

**Tip 2:** Check Actions before deploying
Before pulling to production, check:
```
Actions tab → Latest run → ✅ Green?
```
If green, safe to deploy.

**Tip 3:** Use PR workflow
Create feature branches → Open PR → Wait for tests → Merge
This ensures main branch always has passing tests.

---

## ❓ FAQ

**Q: Do I need to do anything to keep it running?**
A: No, it runs automatically forever (until you delete the .yml file).

**Q: Does it cost money?**
A: Free for public repos. Private repos get 2,000 free minutes/month.

**Q: Can I run tests on production server now?**
A: No! Only use smoke tests on production. Full tests run on GitHub.

**Q: What if tests fail?**
A: Don't deploy. Fix the issue locally, push again, tests will re-run.

**Q: Can I see test results without going to GitHub?**
A: Yes, the commit will show ✅ or ❌ in `git log` on GitHub. Or enable email notifications.

**Q: How do I disable it?**
A: Delete or rename `.github/workflows/test.yml` and push.

---

**Questions?** Check the [official docs](https://docs.github.com/en/actions) or ask your team.
