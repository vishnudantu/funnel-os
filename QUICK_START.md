# 🚀 Saleduct - Quick Start Guide

## One-Time Setup (5 minutes)

### Step 1: Setup Database

**Option A - If you know your MySQL password:**

1. Open Command Prompt
2. Run:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```
3. Enter your password when prompted
4. In MySQL, type:
```sql
CREATE DATABASE saleduct;
EXIT;
```

**Option B - If you DON'T know your MySQL password:**

1. Press `Windows + X` → Click "Terminal (Admin)" or "PowerShell (Admin)"
2. Copy and paste this entire block:
```powershell
Stop-Service MySQL80 -Force; Start-Process "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList "--skip-grant-tables" -WindowStyle Hidden; Start-Sleep 5; & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Saleduct@Root123!'; FLUSH PRIVILEGES;"; Stop-Process mysqld -Force; Start-Sleep 3; Start-Service MySQL80; Start-Sleep 5; & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"Saleduct@Root123!" -e "CREATE DATABASE IF NOT EXISTS saleduct;"
```
3. Wait for it to complete (~15 seconds)

---

### Step 2: Update .env File

Open `C:\Users\vishn\funnelos\.env` in a text editor and make sure these lines are correct:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=saleduct
```

Replace `YOUR_MYSQL_PASSWORD_HERE` with:
- Your existing MySQL password (if you used Option A)
- `Saleduct@Root123!` (if you used Option B)

---

### Step 3: Run Migrations & Create Admin

Open Command Prompt in the project folder:

```cmd
cd C:\Users\vishn\funnelos
pnpm run db:migrate
node scripts/init-super-admin.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║         Saleduct Super Admin Initialization              ║
╚═══════════════════════════════════════════════════════════╝

✅ Super admin user created successfully!
   Email: admin@saleduct.com
   Password: Saleduct@2026!SecureAdmin
```

---

### Step 4: Start the Application

```cmd
pnpm run dev
```

Wait for both servers to start. You'll see:
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
```

---

### Step 5: Login

1. Open browser: **http://localhost:5173**
2. Login with:
   - **Email:** `admin@saleduct.com`
   - **Password:** `Saleduct@2026!SecureAdmin`
3. Click "Sign in"

---

## ✅ You're Done!

You should now see the **Pipeline** page with:
- Empty pipeline columns (no leads yet)
- "Add Lead" buttons working
- All navigation menu items functional

---

## Quick Reference

| What | Where |
|------|-------|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3001/health |
| **Login** | admin@saleduct.com / Saleduct@2026!SecureAdmin |
| **MySQL Password** | Whatever you set (or Saleduct@Root123!) |

---

## Troubleshooting

### "Cannot connect to database"
- Check `.env` has correct `DB_PASSWORD`
- Verify MySQL is running: Open Task Manager → Details → Look for `mysqld.exe`

### "Migration failed"
- Make sure you ran `CREATE DATABASE saleduct;` in MySQL
- Check `.env` file is saved with correct password

### "Port already in use"
- Close any other apps using ports 3001 or 5173
- Or run: `netstat -ano | findstr :3001` then kill that process

### "pnpm not found"
- Run: `npm install -g pnpm`
- Then try again

---

## What Works Now

✅ Login / Register  
✅ Pipeline (Kanban board)  
✅ Leads (Table view)  
✅ Add Lead (Modal form)  
✅ Analytics (Charts)  
✅ Settings (All tabs)  
✅ Integrations (Add/Configure)  
✅ Filters & Search  
✅ CSV Export  

---

**Need help?** Check `DATABASE_SETUP.md` for detailed instructions.
