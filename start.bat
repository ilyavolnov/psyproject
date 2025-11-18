@echo off
chcp 65001 >nul
cls

echo ╔════════════════════════════════════════╗
echo ║   Запуск Frontend + Backend           ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Папка backend не найдена
    pause
    exit /b 1
)

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo ⚠️  node_modules не найден, устанавливаем зависимости...
    cd backend
    call npm install
    cd ..
)

echo 🚀 Запуск Backend (порт 3001)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo 🌐 Запуск Frontend (порт 8000)...
start "Frontend Server" cmd /k "python -m http.server 8000"

timeout /t 1 /nobreak >nul

echo.
echo ✅ Серверы запущены!
echo.
echo 📱 Frontend: http://localhost:8000
echo 🔧 Backend:  http://localhost:3001
echo 👤 Админка:  http://localhost:8000/admin-login.html
echo.
echo Закройте окна серверов для остановки
echo.

REM Open browser
start http://localhost:8000

pause
