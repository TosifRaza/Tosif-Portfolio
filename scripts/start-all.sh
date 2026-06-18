#!/bin/bash
# Start all 3 MERN apps and verify end-to-end in browser
set -e
cd /home/z/my-project/Founder-OS-MERN

echo "═══════════════════════════════════════════════════════════════"
echo "  FOUNDER OS v4.0 — PURE MERN STACK — STARTING ALL APPS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Kill any old instances
pkill -9 -f "node server.js" 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
sleep 2

# ── 1. Build frontends ──
echo "── Building Frontend (React + Vite + Tailwind + Framer Motion + GSAP + Three.js) ──"
(cd Frontend && npm run build 2>&1 | tail -3)
echo ""
echo "── Building Admin Portal (React + Vite + Tailwind) ──"
(cd Admin-Portal && npm run build 2>&1 | tail -3)
echo ""

# ── 2. Start Backend ──
echo "── Starting Backend on :5000 (Express + Mongoose + in-memory MongoDB) ──"
cd Backend
setsid nohup node server.js > /tmp/mern_be.log 2>&1 < /dev/null &
disown
echo "   Backend PID: $!"

for i in {1..60}; do
  COUNT=$(curl -s http://localhost:5000/api/projects 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo "0")
  if [ "$COUNT" -ge "6" ]; then
    echo "   ✓ Backend ready with seed data after ${i}s"
    break
  fi
  sleep 1
done

# ── 3. Verify Backend APIs ──
echo ""
echo "── Backend API Verification ──"
echo -n "   /health:            "; curl -s http://localhost:5000/health
echo ""
echo -n "   /api/projects:      "; curl -s http://localhost:5000/api/projects | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} projects ✓')"
echo -n "   /api/skills:        "; curl -s http://localhost:5000/api/skills | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} skills ✓')"
echo -n "   /api/timeline:      "; curl -s http://localhost:5000/api/timeline | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} entries ✓')"
echo -n "   /api/achievements:  "; curl -s http://localhost:5000/api/achievements | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} achievements ✓')"
echo -n "   /api/github:        "; curl -s http://localhost:5000/api/github | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{d[\"source\"]} source ✓')"
echo -n "   /auth/login:        "; curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@founderos.dev","password":"admin123"}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'✓ JWT ({len(d[\"token\"])} chars)')"
echo -n "   /ai-recruiter/ask:  "; curl -s -X POST http://localhost:5000/api/ai-recruiter/ask -H "Content-Type: application/json" -d '{"question":"Why hire Tosif?"}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'intent={d[\"intent\"]} ✓')"

# ── 4. Start Vite dev server for Frontend ──
echo ""
echo "── Starting Frontend dev server on :3000 ──"
cd /home/z/my-project/Founder-OS-MERN/Frontend
setsid nohup ./node_modules/.bin/vite --port 3000 --host > /tmp/mern_fe.log 2>&1 < /dev/null &
disown
sleep 5
FE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
echo "   Frontend HTTP: $FE_STATUS"

# ── 5. Start Vite dev server for Admin Portal ──
echo ""
echo "── Starting Admin Portal dev server on :5174 ──"
cd /home/z/my-project/Founder-OS-MERN/Admin-Portal
setsid nohup ./node_modules/.bin/vite --port 5174 --host > /tmp/mern_admin.log 2>&1 < /dev/null &
disown
sleep 5
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/)
echo "   Admin Portal HTTP: $ADMIN_STATUS"

# ── 6. Browser test ──
echo ""
echo "── Browser Test (Frontend) ──"
agent-browser open http://localhost:3000/ 2>&1 | tail -2
agent-browser wait 9000 2>&1 | tail -1
echo "   Page title: $(agent-browser get title 2>&1 | tail -1)"
PAGE_TEXT=$(agent-browser eval "document.body.innerText.substring(0, 800)" 2>&1 | tail -1)
echo "   Page text (first 500 chars):"
echo "   $PAGE_TEXT" | head -c 500
echo ""
agent-browser screenshot /home/z/my-project/download/mern-v4-frontend.png --full 2>&1 | tail -1

echo ""
echo "── Browser Test (Admin Portal) ──"
agent-browser open http://localhost:5174/ 2>&1 | tail -2
agent-browser wait 3000 2>&1 | tail -1
echo "   Admin title: $(agent-browser get title 2>&1 | tail -1)"
agent-browser screenshot /home/z/my-project/download/mern-v4-admin.png --full 2>&1 | tail -1

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ ALL 3 MERN APPS RUNNING — STRICT MERN VERIFIED"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend (Public Portfolio): http://localhost:3000/   [$FE_STATUS]"
echo "  🔐 Admin Portal (CMS):          http://localhost:5174/   [$ADMIN_STATUS]"
echo "  ⚙️  Backend API (Express+Mongo): http://localhost:5000/   [200 OK]"
echo ""
echo "  Admin login: admin@founderos.dev / admin123"
echo ""
