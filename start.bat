@echo off
echo Starting Password Manager...
echo.
echo This will start the development server and Electron app.
echo Press Ctrl+C to stop the application.
echo.
cd /d "%~dp0"
npm run electron:dev
