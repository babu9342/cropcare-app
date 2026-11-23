# 🌾 CropCare Community - Deployment Guide

Comprehensive guide to deploy the CropCare Full-Stack Application on **Render** (Backend API & Database) and **Vercel** (Frontend UI).

---

## 📁 Project Structure

```
crop (3)/
├── backend/                       # Java 21 & Spring Boot 4 REST API
│   ├── Dockerfile                 # Multi-stage production container build
│   ├── pom.xml                    # Maven dependencies (Web, Security, JPA, MySQL, H2)
│   ├── render.yaml                # Sub-folder Render blueprint
│   └── src/
│       ├── main/
│       │   ├── java/              # Spring Boot Application & REST Controllers
│       │   └── resources/
│       │       └── application.properties # Dynamic cloud env config + local defaults
│       └── test/
├── frontend/                      # Pure HTML5, CSS3 & JavaScript Web UI
│   ├── index.html                 # Login page
│   ├── register.html              # Farmer registration
│   ├── admin/                     # Admin portal pages
│   ├── farmer/                    # Farmer portal pages
│   ├── css/                       # Modular stylesheets
│   ├── js/                        # App state, layout, location, API helpers
│   │   ├── app.js                 # API handler with dynamic baseURL support
│   │   └── config.js              # Environment configuration for Render URL
│   └── vercel.json                # Vercel routing, headers & API proxy rewrites
├── render.yaml                    # Root Render blueprint specification
├── .gitignore                     # Git ignore rules for build artifacts & IDE files
└── README.md                      # This guide
```

---

## 🚀 Part 1: Backend Deployment on Render

### Step 1: Push your project to GitHub
1. Open PowerShell or Terminal in the project root:
   ```bash
   git add .
   git commit -m "Configure production deployment for Render and Vercel"
   ```
2. Create a new repository on your GitHub account (e.g., `cropcare-app`).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cropcare-app.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Database Setup (Cloud MySQL)
Since Render's free tier does not include managed MySQL, you can use any free MySQL cloud provider:
* **TiDB Cloud (Recommended - 100% Free)**:
  1. Go to [https://tidbcloud.com](https://tidbcloud.com) and create a free account.
  2. Create a free **Serverless Cluster**.
  3. Click **Connect** and get your JDBC Connection URL, Username, and Password.
* **Alternative (Instant H2 In-Memory for testing/demo)**:
  - If you want to test without creating an external database first, you can use H2:
    - `SPRING_DATASOURCE_URL`: `jdbc:h2:mem:cropcare_db;DB_CLOSE_DELAY=-1;MODE=MySQL`
    - `SPRING_DATASOURCE_DRIVER`: `org.h2.Driver`
    - `SPRING_DATASOURCE_USERNAME`: `sa`
    - `SPRING_DATASOURCE_PASSWORD`: (leave blank)

---

### Step 3: Deploy Backend on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`cropcare-app`).
4. Configure the service:
   - **Name**: `cropcare-backend`
   - **Region**: Singapore or nearest
   - **Root Directory**: `backend` (or leave blank if using root `render.yaml`)
   - **Runtime**: `Docker`
   - **Plan**: `Free`
5. In **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `PORT` | `8080` |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<host>:<port>/<db>?useSSL=true` |
   | `SPRING_DATASOURCE_USERNAME` | `<your-db-username>` |
   | `SPRING_DATASOURCE_PASSWORD` | `<your-db-password>` |
   | `JWT_SECRET` | `cropcare_super_secret_key_2026_minimum_32_characters_long` |
6. Click **Create Web Service**.
7. Render will build the Docker container and start your service!
   Your live backend URL will look like:
   `https://cropcare-backend.onrender.com`

---

## 🌐 Part 2: Frontend Deployment on Vercel

### Step 1: Set your Render Backend URL in Frontend
1. Open `frontend/js/config.js` and update your backend URL:
   ```javascript
   window.API_BASE_URL = "https://cropcare-backend.onrender.com";
   ```
2. Open `frontend/vercel.json` and replace `cropcare-backend.onrender.com` with your actual Render URL in the rewrite rule:
   ```json
   {
     "source": "/api/:path*",
     "destination": "https://YOUR_ACTUAL_RENDER_NAME.onrender.com/api/:path*"
   }
   ```
3. Commit and push the changes:
   ```bash
   git add frontend/
   git commit -m "Set production Render backend URL"
   git push
   ```

---

### Step 2: Deploy Frontend on Vercel Dashboard
1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`cropcare-app`).
4. In the Project Configuration:
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build & Development Settings**: Leave default (No build command needed for static HTML/JS)
5. Click **Deploy**.
6. Within seconds, your frontend will be live on Vercel with HTTPS!
   Example URL: `https://cropcare-app.vercel.app`

---

## ⚡ தமிழ் விளக்கம் (Tamil Summary & Steps)

1. **Backend Render-ல் Deploy செய்வது**:
   - Spring Boot Backend-ஐ Docker image ஆக Render Web Service-ல் இயக்க `backend/Dockerfile` தயார் செய்யப்பட்டுள்ளது.
   - Render Dashboard-ல் GitHub repo-வை இணைத்து, `backend` root directory மற்றும் Environment Variables (DB URL, User, Password, JWT_SECRET) கொடுத்தால் Render தானாகவே build செய்து இயக்கும்.
   - Render உங்களுக்கு ஒரு live backend URL தரும் (எ.கா: `https://cropcare-backend.onrender.com`).

2. **Frontend Vercel-ல் Deploy செய்வது**:
   - `frontend/js/config.js` மற்றும் `frontend/vercel.json` கோப்புகளில் உங்கள் Render backend URL-ஐ சேர்க்கவும்.
   - Vercel Dashboard-ல் GitHub repo-வை இணைத்து, Root Directory-யாக `frontend` என்பதை தேர்வு செய்து **Deploy** பட்டனை அழுத்தவும்.
   - Vercel உங்கள் Frontend-ஐ உடனே live செய்யும் (எ.கா: `https://cropcare-app.vercel.app`).

3. **CORS மற்றும் API வசதி**:
   - Vercel frontend-ல் இருந்து Render backend-க்கு API calls செல்ல Spring Security-ல் CORS முழுமையாக configure செய்யப்பட்டுள்ளது.
   - Proxy rewrite வசதியும் `vercel.json`-ல் சேர்க்கப்பட்டுள்ளது.
