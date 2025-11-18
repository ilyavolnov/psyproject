#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Запуск Frontend + Backend           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Папка backend не найдена${NC}"
    exit 1
fi

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules не найден, устанавливаем зависимости...${NC}"
    cd backend && npm install && cd ..
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Остановка серверов...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}🚀 Запуск Backend (порт 3001)...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend (using Python's built-in HTTP server)
echo -e "${GREEN}🌐 Запуск Frontend (порт 8000)...${NC}"
python3 -m http.server 8000 &
FRONTEND_PID=$!

# Wait a bit more
sleep 1

echo ""
echo -e "${GREEN}✅ Серверы запущены!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:8000"
echo -e "${BLUE}🔧 Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}👤 Админка:${NC}  http://localhost:8000/admin-login.html"
echo ""
echo -e "${YELLOW}Нажмите Ctrl+C для остановки${NC}"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID