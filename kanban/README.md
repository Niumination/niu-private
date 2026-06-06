# Niu Kanban 🎯

Project Kanban board for **Niu Private** development — static, dark-themed, with drag & drop, persistence, and deployable to GitHub Pages.

## ✨ Features

- **4 columns**: Backlog → To Do → In Progress → Done
- **Drag & drop** tasks between columns
- **Add / Edit / Delete** tasks
- **Priority levels**: Low 🟢, Medium 🟡, High 🔴
- **Tags**: feature, bug, docs, design, devops, research
- **Auto-save** to browser localStorage
- **Dark theme** matching Niu Private design
- **Fully responsive** (mobile, tablet, desktop)
- **Zero dependencies** — pure HTML + CSS + JS

## 🚀 Deploy to GitHub Pages

### Option 1: Root repo (subfolder)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from branch**
4. Branch: `main`, folder: `/kanban`
5. Your board will be at:
   `https://niumination.github.io/niu-private/kanban/`

### Option 2: Custom domain / root

Copy all files from `/kanban/` to a separate repo's root and enable Pages there.

## 🎮 Usage

- **Click +** on any column header to add a task
- **Drag cards** between columns to update status
- **Click ✏️** on a card to edit
- **Click 🗑️** to delete
- **↻ Reset** button restores default tasks
- Data is stored in your browser — no backend needed

## 🎨 Design

| Element | Style |
|---------|-------|
| Background | `#0a0a0f` |
| Cards | `#12121a` with blur effects |
| Accent | Niu Blue `#748ffc` |
| Typography | Inter, premium dark UI |
| Animations | Smooth slide & fade |

---

> Built for Niu Private project management. Track features, bugs, and tasks visually.
