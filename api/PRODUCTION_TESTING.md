# Production Testing Guide

## ⚠️ IMPORTANT: Never Run `npm test` in Production

**Why?**
- Jest requires ~1GB+ RAM (production servers are optimized for serving traffic)
- Installs unnecessary dev dependencies (200MB+ of test packages)
- Can crash your production server (as you discovered!)

---

## ✅ The Right Way to Test

### 1. Pre-Deployment Testing (Automated via GitHub Actions)

Tests run automatically in GitHub's cloud when you push code:

```bash
# On your local machine
git add .
git commit -m "Add new feature"
git push origin main
```

**What happens:**
- ✅ GitHub Actions runs all 68 tests on Ubuntu
- ✅ Tests on Node.js 18 and 20
- ✅ You see results in GitHub Actions tab
- ✅ If tests fail, don't deploy to production

**View results:** https://github.com/costa-rica/KyberVision23/actions

---

### 2. Post-Deployment Verification (Smoke Tests)

After deploying to production, verify it's working with lightweight smoke tests:

#### On Production Server:

```bash
cd /path/to/api
./smoke-test.sh https://api.kv23.dashanddata.com
```

#### From Your Local Machine:

```bash
# Quick check - just test the smoke script against production
./api/smoke-test.sh https://api.kv23.dashanddata.com
```

**What it tests:**
- ✅ Homepage loads (GET /)
- ✅ User endpoints respond (POST /users/register, /users/login)
- ✅ Authentication works (protected routes return 401)

**What it doesn't do:**
- ❌ No database writes
- ❌ No heavy memory usage
- ❌ No dev dependencies needed

---

## Production Server Setup (Clean)

Your production server should **only** have production dependencies:

```bash
cd /path/to/api

# Install ONLY production dependencies (no jest, no supertest)
npm install --production --no-optional

# Start your API
npm start  # or pm2 start, systemd, etc.

# Verify it's running
curl http://localhost:3000/
```

---

## Full Workflow

### Development:
1. Write code locally
2. Write tests locally
3. Run `npm test` locally (✅ safe - your Mac)
4. Commit and push

### CI/CD (Automated):
5. GitHub Actions runs tests (✅ safe - GitHub's servers)
6. If tests pass ✅ → proceed to deploy
7. If tests fail ❌ → fix issues, don't deploy

### Deployment:
8. Pull code on production: `git pull`
9. Install production deps: `npm install --production`
10. Restart service: `pm2 restart api` (or equivalent)
11. Run smoke tests: `./smoke-test.sh https://api.kv23.dashanddata.com`

---

## Troubleshooting

### "I accidentally ran npm test in production"

Clean up:
```bash
# 1. Stop any stuck processes
pkill -9 node

# 2. Remove dev dependencies
npm install --production --no-optional

# 3. Restart your app
npm start  # or pm2 restart
```

### "How do I check if my production server is healthy?"

Use smoke tests or curl:
```bash
# Quick health check
curl https://api.kv23.dashanddata.com/

# Or full smoke tests
./smoke-test.sh https://api.kv23.dashanddata.com
```

### "Tests are failing in GitHub Actions"

1. Check the Actions tab: https://github.com/costa-rica/KyberVision23/actions
2. Click on the failed run to see error details
3. Fix the issues locally
4. Push again - tests will re-run automatically

---

## Summary

| Environment | Run Full Tests? | How to Verify |
|-------------|----------------|---------------|
| **Local Dev** | ✅ Yes - `npm test` | Run full test suite |
| **GitHub Actions** | ✅ Yes - automatic | Tests run in cloud |
| **Production** | ❌ NEVER | Use smoke tests only |
| **Staging** | ✅ Optional | Can run full tests if sized properly |

**Remember:** Production servers serve users. Test servers run tests. Keep them separate! 🚀
