# 💰 MERN Expense Tracker

A production-ready, full-featured expense tracking web application built with the MERN stack (MongoDB, Express, React, Node.js).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-MERN-success.svg)

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login, password change
- 💸 **Income & Expense Tracking** — Add, edit, delete transactions with categories, payment methods, and notes
- 🏷️ **Custom Categories** — Color-coded categories with auto-seeded defaults for new users
- 📊 **Interactive Dashboard** — Real-time stats, savings rate, recent activity
- 📈 **Beautiful Charts** — Pie chart (spending by category), bar chart (monthly income vs expense), area chart (daily trend)
- 🎯 **Budget Management** — Monthly budgets per category with progress bars and overspend alerts
- 🔍 **Smart Filters** — Search by description, filter by type/category/date range
- 📥 **CSV Export** — Download all your transactions
- 🌓 **Dark Mode** — Toggle between light and dark themes
- 📱 **Fully Responsive** — Works beautifully on mobile, tablet, and desktop
- 🛡️ **Rate Limiting** — Built-in protection against API abuse
- ✅ **Input Validation** — Server-side validation with express-validator

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Recharts (data visualization)
- Axios
- Lucide React (icons)
- React Hot Toast

**Backend:**
- Node.js + Express 4
- MongoDB + Mongoose 8
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- express-validator
- express-rate-limit
- CORS, Morgan

## 📁 Project Structure

```
expense-tracker/
├── client/              # React + Vite frontend (deploys to Vercel)
│   ├── src/
│   │   ├── api/         # Axios instance with auth interceptor
│   │   ├── components/  # Reusable UI (Layout, Charts, Forms)
│   │   ├── context/     # Auth & Theme contexts
│   │   ├── pages/       # Route pages (Dashboard, Transactions, etc.)
│   │   ├── utils/       # Formatters
│   │   └── App.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
└── server/              # Express + MongoDB backend (deploys to Render)
    ├── src/
    │   ├── config/      # MongoDB connection
    │   ├── models/      # User, Transaction, Category, Budget
    │   ├── routes/      # auth, transactions, categories, budgets, dashboard
    │   ├── middleware/  # auth, error handlers
    │   ├── utils/       # generateToken, seedDefaults
    │   └── index.js
    ├── .env.example
    └── render.yaml
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (free tier works) — [sign up here](https://www.mongodb.com/cloud/atlas/register)

### Step 1: Get a MongoDB Connection String

1. Sign up free at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free **M0 cluster** (any region)
3. Go to **Database Access** → Add a new database user with username and password
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow access from anywhere)
5. Click **Connect** on your cluster → **Drivers** → Copy the connection string
6. Replace `<password>` with your actual password and add `/expense-tracker` before `?` like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```

### Step 2: Setup the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and fill in:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<your MongoDB connection string from step 1>
JWT_SECRET=<any long random string, e.g. abc123def456ghi789>
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```
Server runs at **http://localhost:5000**

### Step 3: Setup the Frontend

In a new terminal:
```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
App opens at **http://localhost:5173**

---

## 📦 Push to GitHub

### Step 1: Create a new repository on GitHub
Go to [github.com/new](https://github.com/new), create a repo named `expense-tracker` (do **not** initialize with README/license).

### Step 2: Push your code
From inside the `expense-tracker/` folder:

```bash
git init
git add .
git commit -m "Initial commit: MERN expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

> ⚠️ The `.gitignore` already excludes `.env` files so your secrets won't be uploaded.

---

## 🌐 Deploy the Backend to Render

### Step 1: Sign up
Go to [render.com](https://render.com) and sign up with your GitHub account.

### Step 2: Create a Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repo `expense-tracker`
3. Configure:
   - **Name:** `expense-tracker-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Add Environment Variables
Under **Environment** in Render, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (e.g. use a password generator) |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | `https://YOUR-FRONTEND.vercel.app` *(add this **after** deploying frontend)* |

### Step 4: Deploy
Click **Create Web Service**. Render will build and deploy your API.

Once live, copy your Render URL (e.g. `https://expense-tracker-api-xxxx.onrender.com`).

> 💡 **Free tier note:** Render free instances spin down after 15 min of inactivity. The first request after sleeping takes ~30s to wake.

---

## 🎨 Deploy the Frontend to Vercel

### Step 1: Sign up
Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.

### Step 2: Import the project
1. Click **Add New** → **Project**
2. Import your `expense-tracker` repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Add Environment Variable
Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |

(Use the URL from your Render deployment + `/api`)

### Step 4: Deploy
Click **Deploy**. Vercel will build and host your frontend.

### Step 5: Update CORS on Render
Go back to Render → your service → **Environment** and update:
- `CLIENT_URL` = `https://your-vercel-url.vercel.app`

Then click **Manual Deploy** → **Deploy latest commit** to apply the change.

---

## 🎉 Done!

Your full MERN expense tracker is now live!
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-app.onrender.com`

## 📡 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET  | `/api/auth/me` | Current user | ✅ |
| PUT  | `/api/auth/me` | Update profile | ✅ |
| PUT  | `/api/auth/password` | Change password | ✅ |
| GET  | `/api/transactions` | List transactions (with filters) | ✅ |
| POST | `/api/transactions` | Create transaction | ✅ |
| PUT  | `/api/transactions/:id` | Update transaction | ✅ |
| DELETE | `/api/transactions/:id` | Delete transaction | ✅ |
| GET  | `/api/transactions/export/csv` | Download CSV | ✅ |
| GET  | `/api/categories` | List categories | ✅ |
| POST | `/api/categories` | Create category | ✅ |
| PUT  | `/api/categories/:id` | Update category | ✅ |
| DELETE | `/api/categories/:id` | Delete category | ✅ |
| GET  | `/api/budgets` | List budgets with usage | ✅ |
| POST | `/api/budgets` | Create/update budget | ✅ |
| DELETE | `/api/budgets/:id` | Delete budget | ✅ |
| GET  | `/api/dashboard/summary` | Dashboard stats | ✅ |
| GET  | `/api/dashboard/monthly-trend` | Monthly trend data | ✅ |
| GET  | `/api/dashboard/daily-trend` | Daily trend data | ✅ |

## 🐛 Troubleshooting

**MongoDB connection error?**
- Confirm IP `0.0.0.0/0` is whitelisted in MongoDB Atlas → Network Access
- Make sure password in connection string is URL-encoded (no special chars unescaped)

**CORS errors after deploying?**
- Confirm `CLIENT_URL` in Render matches your Vercel URL exactly (no trailing slash)
- Re-deploy the Render service after updating env vars

**Frontend can't reach backend?**
- Confirm `VITE_API_URL` in Vercel ends with `/api`
- After changing env vars in Vercel, redeploy the project

**Render free tier slow first request?**
- Normal. Free instances sleep after 15 min idle. First request takes ~30s to wake.

## 📄 License

MIT
