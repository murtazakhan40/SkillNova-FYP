# SkillNova Academy 🎓
> **Modern Web-Based Learning Management Platform**  
> **GitHub Repository:** [https://github.com/murtazakhan40/SkillNova-FYP](https://github.com/murtazakhan40/SkillNova-FYP)  
> **Target Domain:** [https://skillnovaacademy.com](https://skillnovaacademy.com)  
> **Lead Instructor & Architect:** Murtaza Wazir (03029983146 | murtazwazir.edu@gmail.com)  
> **Academic Project:** BS Computer Science Final Year Project (FYP)

---

## 🚀 Live Domain & Architecture
- **Official Production Domain:** `https://skillnovaacademy.com`
- **Dynamic Sitemap:** `https://skillnovaacademy.com/sitemap.xml`
- **Robots Policy:** `https://skillnovaacademy.com/robots.txt`
- **Stack:** Next.js 16 (Turbopack, App Router), React 19, Tailwind CSS v4, Prisma ORM, SQLite / PostgreSQL ready.

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/murtazakhan40/SkillNova-FYP.git
cd SkillNova-FYP
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Run Database Migrations & Seeds
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev -- -p 3001
```

---

## 🌐 Testing `skillnovaacademy.com` on Localhost
To open the platform using **`http://skillnovaacademy.com:3001`** directly in your browser instead of typing `localhost`:

Open **PowerShell as Administrator** and run:
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 skillnovaacademy.com"
```
Now navigate to:
👉 **[http://skillnovaacademy.com:3001](http://skillnovaacademy.com:3001)**

---

## 🚢 Production Deployment to `skillnovaacademy.com`

### 1. Deploy on Vercel
1. Push this repository to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. Under **Settings > Domains**, add:
   - `skillnovaacademy.com`
   - `www.skillnovaacademy.com`

### 2. Configure DNS Records (at your domain registrar e.g. Namecheap, GoDaddy):
| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (Vercel IP) | Auto |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto |

Vercel automatically provisions free SSL/TLS certificates and activates HTTPS.

---

## 🔑 Demo Seed Accounts (Credentials)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@skillnova.edu` | `Admin@123` |
| **Trainer** | `trainer@skillnova.edu` | `Trainer@123` |
| **Student** | `student@skillnova.edu` | `Student@123` |
| **Lead Trainer (Murtaza Wazir)** | `murtazwazir.edu@gmail.com` | `Trainer@123` |
