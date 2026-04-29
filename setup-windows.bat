@echo off
REM ═══════════════════════════════════════════════════════════
REM Saleduct Windows Quick Setup Script
REM ═══════════════════════════════════════════════════════════
REM This script will:
REM   1. Reset MySQL root password to: Saleduct@Root123!
REM   2. Create the saleduct database
REM   3. Run migrations
REM   4. Create super admin user
REM ═══════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════
echo          Saleduct - Windows Quick Setup
echo ═══════════════════════════════════════════════════════════
echo.
echo This script will set up your database automatically.
echo.
echo MySQL Password will be set to: Saleduct@Root123!
echo Admin Login: admin@saleduct.com
echo Admin Password: Saleduct@2026!SecureAdmin
echo.
pause

REM Stop MySQL service
echo [1/6] Stopping MySQL service...
net stop MySQL80 2>nul
if %errorlevel% neq 0 (
    echo     Warning: Could not stop MySQL service. It may not be running.
)

REM Start MySQL without password check
echo [2/6] Starting MySQL in safe mode...
start /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
timeout /t 5 /nobreak >nul

REM Reset password
echo [3/6] Resetting MySQL root password...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Saleduct@Root123!'; FLUSH PRIVILEGES;"
if %errorlevel% neq 0 (
    echo     ERROR: Failed to reset password. MySQL may already be running with different settings.
)

REM Stop MySQL safe mode process
echo [4/6] Restarting MySQL service...
taskkill /F /IM mysqld.exe 2>nul
timeout /t 3 /nobreak >nul
net start MySQL80 2>nul
timeout /t 5 /nobreak >nul

REM Create database
echo [5/6] Creating saleduct database...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"Saleduct@Root123!" -e "CREATE DATABASE IF NOT EXISTS saleduct; SHOW DATABASES;"
if %errorlevel% neq 0 (
    echo     ERROR: Failed to create database. Check MySQL is running.
    pause
    exit /b 1
)

REM Run migrations
echo [6/6] Running database migrations...
pnpm run db:migrate
if %errorlevel% neq 0 (
    echo     ERROR: Migrations failed. Check .env file has correct credentials.
    pause
    exit /b 1
)

REM Create super admin
echo.
echo Creating super admin user...
node scripts/init-super-admin.js

echo.
echo ═══════════════════════════════════════════════════════════
echo          Setup Complete!
echo ═══════════════════════════════════════════════════════════
echo.
echo Database: saleduct
echo MySQL Password: Saleduct@Root123!
echo.
echo Admin Login Credentials:
echo   Email: admin@saleduct.com
echo   Password: Saleduct@2026!SecureAdmin
echo.
echo Next step: Run 'pnpm run dev' to start the application
echo.
pause
