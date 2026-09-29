# VideoTube Fullstack Application

A complete fullstack video sharing application with an Express/MongoDB backend and a Next.js (Turbopack) frontend.

## Project Structure

```
├── backend/          # Express.js REST API with MongoDB & Cloudinary
├── frontend/         # Next.js 16 (App Router, Tailwind CSS, HeroUI)
├── package.json      # Monorepo root runner
└── .gitignore        # Monorepo gitignore
```

## Getting Started

### 1. Install dependencies
```bash
npm run install:all
```
*(or run `npm install` inside both `backend/` and `frontend/`)*

### 2. Configure Environment Variables
- In `backend/`: configure `.env` (refer to `backend/.env.sample`)
- In `frontend/`: configure `.env.local`

### 3. Run Development Servers
To start both backend and frontend together with a single command:
```bash
npm run dev
```

You can also run them independently if needed:
```bash
npm run dev:backend    # Starts backend server (Port 8000)
npm run dev:frontend   # Starts Next.js dev server (Port 3000)
```

## Pushing to a New GitHub Repository

1. Create a new empty repository on [GitHub](https://github.com/new).
2. Link the repository and push:
```bash
git remote add origin <YOUR_NEW_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```
