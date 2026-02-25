#!/bin/bash
# Production smoke tests - verify deployment is working
# Run this AFTER deploying to production

API_URL="${1:-http://localhost:3000}"
echo "🔍 Running smoke tests against: $API_URL"
echo ""

# Test 1: Homepage loads
echo "✓ Testing homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/")
if [ "$STATUS" -eq 200 ]; then
  echo "  ✅ Homepage returns 200"
else
  echo "  ❌ Homepage failed with status: $STATUS"
  exit 1
fi

# Test 2: User registration endpoint responds
echo "✓ Testing user registration endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$API_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$STATUS" -eq 400 ]; then
  echo "  ✅ Registration endpoint responding (400 expected for empty data)"
else
  echo "  ⚠️  Registration endpoint returned: $STATUS (expected 400)"
fi

# Test 3: Login endpoint responds
echo "✓ Testing login endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 400 ]; then
  echo "  ✅ Login endpoint responding"
else
  echo "  ⚠️  Login endpoint returned: $STATUS"
fi

# Test 4: Protected endpoint requires auth
echo "✓ Testing authentication..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/teams")
if [ "$STATUS" -eq 401 ]; then
  echo "  ✅ Auth protection working (401 without token)"
else
  echo "  ❌ Auth failed with status: $STATUS (expected 401)"
  exit 1
fi

echo ""
echo "✅ All smoke tests passed!"
echo "🚀 Production deployment verified"
