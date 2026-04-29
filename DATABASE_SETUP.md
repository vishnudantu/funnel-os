# Saleduct Database Setup

## Quick Setup (Choose One Method)

### Method 1: Automated PowerShell Script (Recommended)

1. **Right-click Start** → Search for "PowerShell"
2. **Right-click PowerShell** → "Run as Administrator"
3. Run the setup script:
   ```powershell
   cd C:\Users\vishn\funnelos
   .\setup-database.ps1
   ```

This script will:
- Stop MySQL80 service
- Reset the root password to: `Saleduct@Root123!`
- Create the `saleduct` database
- Restart MySQL service

### Method 2: Manual Setup

If you prefer to set the password manually:

1. Open Command Prompt as Administrator
2. Stop MySQL: `net stop MySQL80`
3. Start MySQL with skip-grant-tables:
   ```
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
   ```
4. Open another Command Prompt and run:
   ```
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root
   ```
5. In MySQL, run:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Saleduct@Root123!';
   FLUSH PRIVILEGES;
   EXIT;
   ```
6. Stop the mysqld process (Ctrl+C or Task Manager)
7. Start MySQL service: `net start MySQL80`
8. Create database:
   ```
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"Saleduct@Root123!" -e "CREATE DATABASE IF NOT EXISTS saleduct;"
   ```

---

## After Database Setup

### 1. Verify .env file has correct credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Saleduct@Root123!
DB_NAME=saleduct
```

### 2. Run migrations:
```bash
cd C:\Users\vishn\funnelos
pnpm run db:migrate
```

### 3. Initialize super admin:
```bash
node scripts/init-super-admin.js
```

### 4. Start development servers:
```bash
pnpm run dev
```

### 5. Access the application:
- Frontend: http://localhost:3001 (backend shows this in console)
- Login with:
  - Email: `admin@saleduct.com`
  - Password: `Saleduct@2026!SecureAdmin`

---

## Troubleshooting

### "Access denied" error
- Make sure you ran the PowerShell script as Administrator
- Verify the password in .env matches: `Saleduct@Root123!`

### "Cannot connect to database"
- Check MySQL80 service is running: `sc query MySQL80`
- Verify database exists: Run MySQL with password and check `SHOW DATABASES;`

### Migration errors
- Ensure the `saleduct` database was created
- Check that migrations folder exists: `apps/backend/src/db/migrations/`

---

## What's Already Working

✅ **Frontend (running on http://localhost:5176)**
- Login/Register pages
- Pipeline page with Add Lead modal
- Leads page with Add Lead, Filters, Export
- Analytics page
- Settings page
- Integrations page

✅ **Backend (running on http://localhost:3001)**
- All API endpoints ready
- Health check: http://localhost:3001/health

⏳ **Waiting for database**
- Migrations need to run
- Super admin user creation
- Full authentication flow
