@echo off
echo ========================================
echo CT5 Pride Project Setup
echo ========================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version for best compatibility.
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Run: npm run setup
echo 2. Enter your GitHub token when prompted
echo 3. Run: npm start
echo 4. Open http://localhost:3000 in your browser
echo.
pause 