# Production Server Cleanup - Engineer Handover

**Date:** 2026-02-24
**Issue:** Test suite accidentally ran on production, caused heap out of memory crash
**Action Required:** Complete cleanup and migrate to GitHub Actions testing workflow

---

## 🔴 What Happened

A developer accidentally ran `npm test` on the production server (https://api.kv23.dashanddata.com), which caused:

1. **Memory crash** - Jest test suite consumed all available RAM
2. **Dev dependencies installed** - 486+ unnecessary packages (jest, ts-jest, supertest, etc.) were installed on production
3. **Server crash** - Node process crashed with "JavaScript heap out of memory" error

**Root cause:** Running test suites requires 1GB+ RAM and dev dependencies. Production servers should never run full test suites.

---

## 📋 Current State (Partial Cleanup Done)

### Already Completed:
✅ Node processes killed: `pkill -9 node`
✅ Dev dependencies removed: `npm install --production --no-optional`
✅ 486 packages removed from node_modules

### Still Showing (Expected):
⚠️ `npm list` shows "UNMET DEPENDENCY" errors for:
- `@types/jest`, `@types/supertest`, etc.
- `jest`, `supertest`, `ts-jest`

**Note:** These errors are cosmetic. The packages are NOT installed (which is correct). They're listed in `package.json` `devDependencies` but npm knows not to install them in production mode. This is expected and safe.

### Remaining Issues:
❌ smoke-test.sh not executable (permission denied)
❌ Production app restart status unknown
❌ Smoke tests not verified

---

## 🎯 Action Items for Production Engineers

### 1. Verify Current State

```bash
# SSH into production server
ssh user@production-server

# Navigate to API directory
cd /var/www/kybervision23/api  # or your actual path

# Check what's installed
du -sh node_modules/
# Should be ~200-300MB (not 500MB+)

# Verify jest/supertest are NOT installed
ls node_modules/ | grep -E "jest|supertest"
# Should return nothing (empty)

# Check if dev dependencies physically exist
npm list jest 2>&1 | grep -v "UNMET"
# Should show package is not installed
```

### 2. Complete the Cleanup

```bash
# Pull latest code (includes smoke-test.sh and new docs)
git pull origin main

# Re-verify production dependencies only
npm install --omit=dev --omit=optional

# Clear npm cache (optional but recommended)
npm cache clean --force

# Make smoke test executable
chmod +x smoke-test.sh

# Verify the app starts correctly
npm start
# OR if using pm2:
pm2 restart kybervision23api
# OR if using systemd:
sudo systemctl restart kybervision23api
```

### 3. Verify Production is Healthy

```bash
# Check if app is running
ps aux | grep node
# Should see your app running

# Check logs for errors
# If using pm2:
pm2 logs kybervision23api --lines 50
# If using systemd:
sudo journalctl -u kybervision23api -n 50

# Test API responds locally
curl -v http://localhost:3000/
# Should return 200 OK with HTML

# Test API responds externally
curl -v https://api.kv23.dashanddata.com/
# Should return 200 OK with HTML
```

### 4. Run Smoke Tests

```bash
# From the API directory on production server
./smoke-test.sh https://api.kv23.dashanddata.com
```

**Expected output:**
```
🔍 Running smoke tests against: https://api.kv23.dashanddata.com

✓ Testing homepage...
  ✅ Homepage returns 200
✓ Testing user registration endpoint...
  ✅ Registration endpoint responding (400 expected for empty data)
✓ Testing login endpoint...
  ✅ Login endpoint responding
✓ Testing authentication...
  ✅ Auth protection working (401 without token)

✅ All smoke tests passed!
🚀 Production deployment verified
```

If any test fails, check:
- Is the app running? `ps aux | grep node`
- Are there errors in logs? `pm2 logs` or `journalctl`
- Is nginx/reverse proxy configured correctly?
- Is SSL certificate valid?

---

## 🔄 New Testing Workflow (Going Forward)

### Old Workflow (❌ WRONG):
```
1. Developer pushes code
2. Pull on production server
3. Run npm install (installs dev deps)
4. Run npm test on production → CRASH 💥
```

### New Workflow (✅ CORRECT):

#### Pre-Deployment Testing (Automated):
```
1. Developer pushes code to GitHub
2. GitHub Actions automatically runs tests in cloud
3. If tests pass ✅ → safe to deploy
4. If tests fail ❌ → don't deploy
```

**View test results:** https://github.com/costa-rica/KyberVision23/actions

#### Deployment to Production:
```
1. Pull code: git pull origin main
2. Install production deps: npm install --omit=dev --omit=optional
3. Restart app: pm2 restart kybervision23api
4. Verify with smoke tests: ./smoke-test.sh https://api.kv23.dashanddata.com
```

### GitHub Actions Configuration

Already set up in `.github/workflows/test.yml`:
- Runs on every push to `main` or `develop`
- Tests on Ubuntu with Node.js 18 and 20
- Runs all 68 tests (9 skipped, expected)
- Takes ~30 seconds
- 100% isolated from production

**No action needed** - this is already configured and running.

---

## 📊 What Gets Installed Where

### Production Server (Current Target State):

```bash
# node_modules should contain ONLY:
node_modules/
├── express/           ✅ Production dependency
├── sequelize/         ✅ Production dependency
├── bcrypt/            ✅ Production dependency
├── cors/              ✅ Production dependency
├── jsonwebtoken/      ✅ Production dependency
└── ... (~35 packages, ~200-300MB total)

# These should NOT be present:
❌ jest/
❌ ts-jest/
❌ supertest/
❌ @types/jest/
❌ nodemon/
```

### GitHub Actions (Test Environment):
- Has ALL dependencies (production + dev)
- Runs full test suite
- Fresh Ubuntu server per run
- Automatically cleans up after tests

---

## 🔍 Verification Checklist

After completing cleanup, verify:

- [ ] Production app is running (`ps aux | grep node`)
- [ ] No jest/supertest in node_modules (`ls node_modules/ | grep jest`)
- [ ] node_modules size is reasonable (~200-300MB, not 500MB+)
- [ ] API responds to requests (`curl https://api.kv23.dashanddata.com/`)
- [ ] Smoke tests pass (`./smoke-test.sh https://api.kv23.dashanddata.com`)
- [ ] Logs show no errors (`pm2 logs` or `journalctl`)
- [ ] GitHub Actions shows tests passing (check Actions tab on GitHub)

---

## 🚨 Troubleshooting

### Issue: "UNMET DEPENDENCY" errors when running npm commands

**Status:** ✅ Expected, not a problem

**Explanation:** These warnings appear because devDependencies are listed in package.json but not installed. This is correct for production. The app will run fine.

To silence these warnings, you can:
```bash
npm install --omit=dev --omit=optional --no-audit
```

### Issue: App won't start after cleanup

**Check:**
```bash
# Are production dependencies installed?
npm install --omit=dev

# Is there a .env file?
ls -la .env

# Check for errors
npm start
# Read the error message carefully
```

### Issue: Smoke tests fail

**Diagnose:**
```bash
# Is the app running?
curl http://localhost:3000/

# Check if it's a port issue
netstat -tulpn | grep 3000

# Check if it's an nginx/proxy issue
curl -v https://api.kv23.dashanddata.com/

# Check SSL certificate
curl -vI https://api.kv23.dashanddata.com/ 2>&1 | grep -i cert
```

### Issue: Memory usage still high

**Check:**
```bash
# What's consuming memory?
top -b -n 1 | head -20

# Is there a memory leak?
pm2 monit

# Check node_modules size
du -sh node_modules/
# Should be ~200-300MB, not 500MB+
```

---

## 📚 Reference Documentation

- **Testing workflow:** `api/docs/PRODUCTION_TESTING.md`
- **Test implementation:** `api/docs/TEST_IMPLEMENTATION_TODO.md`
- **Test coverage:** `api/README.md` (Testing section)
- **GitHub Actions:** `.github/workflows/test.yml`

---

## 👥 Contact

**Issue reported by:** Developer (local Mac)
**Handover to:** Production engineering team
**Priority:** Medium (production is running but cleanup incomplete)
**Estimated time:** 15-30 minutes

---

## ✅ Sign-off

**Production engineer name:** _______________
**Date completed:** _______________
**Verification:** All checklist items completed? ☐ Yes ☐ No
**Issues encountered:** _______________________________________________

---

**Questions?** See `api/docs/PRODUCTION_TESTING.md` for detailed workflow explanation.
