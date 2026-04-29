# 🚀 Saleduct - Complete Setup Guide

## ⚠️ IMPORTANT: Read This First

The application **requires a database** to work. Without it, you'll see "Failed to fetch" errors everywhere.

---

## 🔧 Database Setup (REQUIRED - 5 minutes)

### Option 1: Quick Password Reset (Recommended)

Open **PowerShell as Administrator** and run:

```powershell
# Stop MySQL
Stop-Service MySQL80 -Force

# Start MySQL without password check
Start-Process "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList "--skip-grant-tables" -WindowStyle Hidden
Start-Sleep -Seconds 5

# Reset password
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Saleduct@Root123!'; FLUSH PRIVILEGES;"

# Stop MySQL
Stop-Process mysqld -Force
Start-Sleep -Seconds 3

# Start MySQL normally
Start-Service MySQL80
Start-Sleep -Seconds 5

# Create database
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"Saleduct@Root123!" -e "CREATE DATABASE IF NOT EXISTS saleduct; SHOW DATABASES;"
```

### Option 2: If You Know Your MySQL Password

Open Command Prompt:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pYOUR_PASSWORD -e "CREATE DATABASE saleduct;"
```

---

## 📝 Update .env File

Open `C:\Users\vishn\funnelos\.env` and set:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Saleduct@Root123!
DB_NAME=saleduct
```

---

## 🏗️ Run Migrations & Create Admin

```bash
cd C:\Users\vishn\funnelos
pnpm run db:migrate
node scripts/init-super-admin.js
```

You should see:
```
✅ Super admin user created!
Email: admin@saleduct.com
Password: Saleduct@2026!SecureAdmin
```

---

## ▶️ Start the Application

```bash
pnpm run dev
```

Wait for:
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
```

---

## ✅ Login

1. Open: **http://localhost:5173**
2. Login:
   - **Email:** `admin@saleduct.com`
   - **Password:** `Saleduct@2026!SecureAdmin`

---

## 🎯 What Works After Setup

| Feature | Status |
|---------|--------|
| Login/Register | ✅ Full authentication |
| Pipeline (Kanban) | ✅ Drag & drop leads |
| Leads (Table) | ✅ Add, Edit, Delete, Export |
| Add Lead Modal | ✅ Create leads with AI scoring |
| Analytics | ✅ Real-time charts |
| Settings | ✅ Company, AI, Notifications |
| Integrations | ✅ Meta, Google, WhatsApp, etc. |
| Search & Filters | ✅ Working |
| AI Lead Scoring | ✅ Automatic scoring |

---

## ❓ Troubleshooting

### "Failed to fetch" errors
→ Database not set up. Follow Option 1 above.

### "Access denied for user root"
→ Update `.env` with correct MySQL password

### "Cannot connect to database"
→ Check MySQL is running: `sc query MySQL80`

### "Migration failed"
→ Ensure `saleduct` database exists

### Port already in use
→ Kill process: `netstat -ano | findstr :3001` then `taskkill /PID <number>`

---

## 📞 Quick Help

**MySQL Password:** `Saleduct@Root123!`  
**Admin Login:** `admin@saleduct.com` / `Saleduct@2026!SecureAdmin`  
**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3001/health  

---

## 📋 Next Steps After Setup

1. **Add your first lead** - Click "Add Lead" in Pipeline or Leads page
2. **Configure AI** - Go to Settings → AI Provider
3. **Set up integrations** - Go to Integrations → Add Meta/Google/WhatsApp
4. **Customize pipeline** - Settings → Pipeline Stages
