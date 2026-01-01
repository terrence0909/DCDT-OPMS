#!/bin/bash
echo "=== Testing DCDT OPMS Backend ==="
echo ""
echo "1. Health check:"
curl -s http://localhost:5002/health
echo ""
echo ""
echo "2. Login test:"
curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python -m json.tool 2>/dev/null || \
curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
echo ""
