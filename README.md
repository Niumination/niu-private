# Niu Private — Secure Document Vault 🔐

![Status](https://img.shields.io/badge/status-completed-success?style=flat)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000?style=flat&logo=vercel)
![GitHub Pages](https://img.shields.io/badge/Kanban-GitHub%20Pages-222?style=flat&logo=github)

> **🚀 Project Complete** — A private document management system with dark theme, single-user authentication, GitHub-backed storage, and Supabase-powered full-text search in Bahasa Indonesia.

**🌐 Live App:** [niu-private.vercel.app](https://niu-private.vercel.app)  
**🎮 Kanban Board:** [niumination.github.io/niu-private](https://niumination.github.io/niu-private/)  
**📦 Storage Repo:** [github.com/Niumination/niu-storage](https://github.com/Niumination/niu-storage) (private)

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔒 **Password Auth** | Single-user login with iron-session (encrypted cookies) |
| 📤 **Drag & Drop Upload** | Support PDF, images, Word, Excel, archives, text, code — **100MB limit** |
| ☁️ **GitHub Storage** | All files stored in your **private** GitHub repo via Octokit API |
| 🔍 **Full-text Search** | Powered by PostgreSQL **Indonesian** text search config via Supabase |
| 📁 **Auto-categorization** | PDF, Image, Word, Excel, Archive, Other — auto-tagged by MIME type |
| 👁️ **Embedded Preview** | **Images** inline, **Text/Code** in styled `<pre>`, **PDF/Office** via Google Docs Viewer |
| 🔄 **Real-time Stats** | Dashboard shows live document count, storage usage, categories, recent uploads |
| 🌙 **Dark Theme** | Premium modern dark UI |
| 📱 **Responsive** | Works on mobile & desktop |
| 🔄 **View Modes** | Grid & List views for documents |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 + clsx + tailwind-merge |
| **Auth** | iron-session (encrypted cookies) |
| **File Storage** | GitHub Private Repo via Octokit (REST API) |
| **Metadata DB** | Supabase (PostgreSQL 15+) |
| **Search** | PostgreSQL Full-Text Search (Indonesian config, trigger-based) |
| **Deploy** | Vercel (frontend + API routes) |
| **Kanban** | Static HTML + CSS + JS on GitHub Pages |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Niumination/niu-private.git
cd niu-private
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local` and fill in:

```env
# Auth (change this!)
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_random_secret_at_least_32_chars

# GitHub (create a private repo named "niu-storage")
GITHUB_TOKEN=github_pat_your_fine_grained_token

# Supabase (create a free project at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Supabase Database

Run this SQL in your [Supabase SQL Editor](https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new):

```sql
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sha TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_search_idx ON documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);

-- Trigger function for Indonesian full-text search
CREATE OR REPLACE FUNCTION documents_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_documents_search ON documents;
CREATE TRIGGER trg_documents_search
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION documents_search_update();
```

### 4. Create GitHub Storage Repo

1. Create a **private** repo on GitHub named `niu-storage`
2. Generate a fine-grained token with **Contents: Read & Write** permission
3. Add the token to `.env.local` as `GITHUB_TOKEN`

### 5. Run Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` — login with your `ADMIN_PASSWORD`.

## 📦 Deploy

### Vercel (App)

1. Push to GitHub: `git push origin main`
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add all environment variables in Vercel dashboard (**plain text** for `NEXT_PUBLIC_` vars — do not click "Make Safe")
4. Deploy! 🎉

### GitHub Pages (Kanban Board)

The Kanban board at `/docs/index.html` auto-deploys to GitHub Pages:
1. Go to repo **Settings → Pages**
2. Source: **Deploy from branch**
3. Branch: `main`, folder: `/docs`
4. Board lives at: `https://niumination.github.io/niu-private/`

## 📁 Project Structure

```
niu-private/
├── app/
│   ├── api/
│   │   ├── auth/                  # Login/logout API
│   │   ├── documents/             # Document CRUD API
│   │   ├── documents/[id]/        # Single document API
│   │   ├── documents/upload/      # File upload to GitHub + Supabase
│   │   └── search/                # Full-text search API
│   ├── dashboard/
│   │   ├── documents/             # Document listing & detail
│   │   ├── search/                # Search page
│   │   └── upload/                # Upload page (drag & drop)
│   ├── login/                     # Login page
│   ├── globals.css                # Global styles (Tailwind v4)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Sidebar.tsx                # Navigation sidebar
├── lib/
│   ├── github.ts                  # GitHub Octokit client
│   ├── session.ts                 # Auth session config
│   ├── supabase.ts                # Supabase client + queries
│   └── utils.ts                   # Utility functions
├── docs/
│   └── index.html                 # Kanban board (GitHub Pages)
├── kanban/
│   └── README.md                  # Kanban documentation
├── middleware.ts                  # Auth middleware
├── supabase-migration.sql         # Database setup SQL
└── .env.local                     # Local env vars (not committed)
```

## 🔒 Security

- Passwords hashed and stored in encrypted cookies (iron-session)
- GitHub token is server-side only — never exposed to client
- All API routes require authentication (except login)
- Files stored in **private** GitHub repo
- Session expires after 1 week (configurable)
- `NEXT_PUBLIC_` env vars are the only client-exposed values

## 📊 Project Status

All core features are **complete and deployed**:

| Feature | Status | Link |
|---------|--------|------|
| Auth with iron-session | ✅ Done | `app/api/auth/` |
| Dashboard with live stats | ✅ Done | `/dashboard` |
| Upload with drag & drop | ✅ Done | `/dashboard/upload` |
| Document listing (grid/list) | ✅ Done | `/dashboard/documents` |
| Document detail & preview | ✅ Done | `/dashboard/documents/[id]` |
| Full-text search (Indonesian) | ✅ Done | `/dashboard/search` |
| GitHub private storage | ✅ Done | `niumination/niu-storage` |
| Supabase metadata DB | ✅ Done | `ipvjzxdiczkluuofdfht` |
| Responsive dark theme | ✅ Done | Tailwind CSS v4 |
| Kanban project board | ✅ Done | GitHub Pages |

## 📄 License

MIT — Built for personal use. Feel free to fork and customize.
