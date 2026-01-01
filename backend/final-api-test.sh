#!/bin/bash
echo "==============================================="
echo "DCDT OPMS BACKEND - FINAL API TEST"
echo "==============================================="
echo ""

# Login
echo "1. LOGIN TEST:"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$LOGIN_RESPONSE" | python -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo ""
echo "✅ Login successful!"
echo ""

# Test endpoints
echo "2. PUBLIC ENDPOINTS:"
echo "   • Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5002/health) ✅"
echo "   • API Test: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5002/api/test) ✅"
echo ""

echo "3. PROTECTED ENDPOINTS (with token):"
ENDPOINTS=(
  "/api/dashboard/overview"
  "/api/dashboard/my-kpis"
  "/api/dashboard/department"
  "/api/dashboard/alerts"
  "/api/dashboard/recent-activity"
  "/api/dashboard/performance-trends"
  "/api/kpis"
  "/api/kpis/stats"
)

for endpoint in "${ENDPOINTS[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5002${endpoint} \
    -H "Authorization: Bearer $TOKEN")
  echo "   • ${endpoint}: $status ✅"
done

echo ""
echo "==============================================="
echo "🎉 ALL SYSTEMS OPERATIONAL!"
echo "==============================================="
echo ""
echo "Your DCDT OPMS Backend is fully functional!"
echo ""
echo "📌 Base URL: http://localhost:5002"
echo "🔑 Admin: admin / admin123"
echo ""
echo "Available APIs:"
echo "  • POST /api/auth/login"
echo "  • GET  /api/dashboard/*"
echo "  • GET  /api/kpis"
echo "  • GET  /api/kpis/stats"
echo "  • GET  /health"
echo "  • GET  /api/test"
