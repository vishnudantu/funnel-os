# Saleduct Database Setup Script
# Run this script AS ADMINISTRATOR to set up the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Saleduct Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop MySQL service
Write-Host "Stopping MySQL80 service..." -ForegroundColor Yellow
Stop-Service -Name MySQL80 -Force

# Wait for service to stop
Start-Sleep -Seconds 3

# Start MySQL with skip-grant-tables
Write-Host "Starting MySQL with skip-grant-tables..." -ForegroundColor Yellow
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
Start-Process -FilePath "$mysqlPath\mysqld.exe" -ArgumentList "--skip-grant-tables" -WindowStyle Hidden

# Wait for MySQL to start
Write-Host "Waiting for MySQL to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Reset root password
Write-Host "Resetting root password..." -ForegroundColor Yellow
$resetPassword = "Saleduct@Root123!"
& "$mysqlPath\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '$resetPassword'; FLUSH PRIVILEGES;"

# Stop the skip-grant-tables instance
Write-Host "Stopping MySQL..." -ForegroundColor Yellow
Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue

# Wait for MySQL to stop
Start-Sleep -Seconds 3

# Start MySQL service normally
Write-Host "Starting MySQL80 service normally..." -ForegroundColor Yellow
Start-Service -Name MySQL80

# Wait for service to start
Start-Sleep -Seconds 5

# Create database
Write-Host "Creating saleduct database..." -ForegroundColor Yellow
& "$mysqlPath\mysql.exe" -u root -p"$resetPassword" -e "CREATE DATABASE IF NOT EXISTS saleduct;"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "MySQL Root Password: $resetPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now update your .env file:" -ForegroundColor Yellow
Write-Host "  DB_HOST=localhost" -ForegroundColor White
Write-Host "  DB_PORT=3306" -ForegroundColor White
Write-Host "  DB_USER=root" -ForegroundColor White
Write-Host "  DB_PASSWORD=$resetPassword" -ForegroundColor White
Write-Host "  DB_NAME=saleduct" -ForegroundColor White
Write-Host ""
Write-Host "Then run:" -ForegroundColor Yellow
Write-Host "  pnpm run db:migrate" -ForegroundColor White
Write-Host "  node scripts/init-super-admin.js" -ForegroundColor White
Write-Host ""
