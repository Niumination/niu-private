# Niu Private — Secure Document Vault 🔐

A private document management system with dark theme, authentication, file upload to GitHub, and Supabase-powered search.

## ✨ Features

- 🔒 **Password-protected** — single-user login with iron-session
- 📤 **File Upload** — drag & drop, supports PDF, images, Word, Excel, archives
- ☁️ **GitHub Storage** — all files stored in your private GitHub repo
- 🔍 **Full-text Search** — powered by PostgreSQL via Supabase
- 📁 **Category Organization** — auto-tagging by file type
- 👁️ **File Preview** — image preview inline, download for other types
- 🌙 **Dark Theme** — modern, premium dark UI
- 📱 **Responsive** — works on mobile & desktop

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16 (App Router) |
| **CSS** | Tailwind CSS v4 |
| **Auth** | iron-session (encrypted cookies) |
| **File Storage** | GitHub Private Repo (via API) |
| **Metadata DB** | Supabase (PostgreSQL) |
| **Search** | PostgreSQL Full-Text Search |
| **Deploy** | Vercel |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
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
GITHUB_TOKEN=ghp_your_github_token

# Supabase (create a free project at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sha TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable full-text search
ALTER TABLE documents ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''))) STORED;

CREATE INDEX documents_search_idx ON documents USING GIN(search_vector);

-- Create index for category filtering
CREATE INDEX documents_category_idx ON documents(category);
CREATE INDEX documents_created_at_idx ON documents(created_at DESC);
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

## 📦 Deploy to Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy! 🎉

## 📁 Project Structure

```
niu-private/
├── app/
│   ├── api/
│   │   ├── auth/           # Login/logout API
│   │   ├── documents/      # Document CRUD API
│   │   ├── documents/[id]/ # Single document API
│   │   ├── documents/upload/ # File upload API
│   │   └── search/         # Search API
│   ├── dashboard/
│   │   ├── documents/      # Document listing & detail
│   │   ├── search/         # Search page
│   │   └── upload/         # Upload page
│   ├── login/              # Login page
│   ├── globals.css         # Global styles (Tailwind v4)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   ├── github.ts           # GitHub API client
│   ├── session.ts          # Auth session config
│   ├── supabase.ts         # Supabase client + queries
│   └── utils.ts            # Utility functions
├── middleware.ts
└── .env.local
```

## 🔒 Security

- Passwords are hashed and stored in encrypted cookies
- GitHub token is server-side only
- All API routes require authentication (except login)
- Files stored in private GitHub repo
- Session expires after 1 week

## 📄 License

MIT
