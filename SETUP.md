# Saleduct Database Setup Guide

## Quick Setup (Choose one method)

### Method 1: Install MySQL Server (Recommended)

1. **Download MySQL Installer:**
   - Visit: https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows" (mysql-installer-community-*.msi)

2. **Install MySQL:**
   - Run the installer
   - Choose "Developer Default" or "Server only"
   - Set root password (leave blank for development or use a secure password)
   - Keep default port: 3306

3. **Create Database:**
   Open MySQL Command Line Client and run:
   ```sql
   CREATE DATABASE saleduct;
   ```

4. **Update .env file:**
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=saleduct
   ```

5. **Run Migrations:**
   ```bash
   pnpm run db:migrate
   ```

6. **Initialize Super Admin:**
   ```bash
   node scripts/init-super-admin.js
   ```

### Method 2: Use Docker Desktop (If available)

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/

2. Start database with Docker:
   ```bash
   docker run -d --name saleduct-db \
     -e MYSQL_ROOT_PASSWORD=saleduct_root \
     -e MYSQL_DATABASE=saleduct \
     -e MYSQL_USER=saleduct \
     -e MYSQL_PASSWORD=saleduct_pass \
     -p 3306:3306 \
     mariadb:10.11
   ```

3. Update .env:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=saleduct
   DB_PASSWORD=saleduct_pass
   DB_NAME=saleduct
   ```

4. Run migrations and init:
   ```bash
   pnpm run db:migrate
   node scripts/init-super-admin.js
   ```

### Method 3: Use WSL (Windows Subsystem for Linux)

If WSL is installed:
```bash
wsl sudo apt update
wsl sudo apt install mariadb-server -y
wsl sudo systemctl start mariadb
wsl sudo mysql -e "CREATE DATABASE saleduct;"
```

## After Database Setup

1. **Start Development Servers:**
   ```bash
   pnpm run dev
   ```

2. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

3. **Default Login:**
   - Email: `admin@saleduct.com`
   - Password: `Saleduct@2026!SecureAdmin`

## Troubleshooting

### Connection Refused
- Ensure MySQL/MariaDB service is running
- Check DB_HOST and DB_PORT in .env match your installation

### Access Denied
- Verify DB_USER and DB_PASSWORD in .env
- Try: `mysql -u root -p` to test connection

### Migration Errors
- Ensure database 'saleduct' exists: `CREATE DATABASE saleduct;`
- Check user has permissions: `GRANT ALL ON saleduct.* TO 'root'@'localhost';`
