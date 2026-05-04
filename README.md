# GitHub Manager

**Production URL:** https://dnrif6ny.insforge.site

---

## Description

GitHub Manager is a web application that allows you to manage GitHub repositories more efficiently. It lets you view, create, modify repository privacy, and edit your GitHub profile README from an intuitive interface.

---

## Features

### 1. Repository Management
- **List repositories** - View all your repositories with visibility, language, and description info
- **Search repositories** - Filter repositories by name or description
- **Create repositories** - Create new repositories (public or private)
- **Change privacy** - Modify visibility of repositories individually or in bulk (multi-select)

### 2. Profile Editor (README)
- **Word-like Editor** - Rich text editing interface with formatting options:
  - Bold, italic, headings (H1, H2, H3)
  - Lists (ordered and unordered)
  - Inline code
  - Text highlighting
  - Text colors
- **Real-time preview** - See changes as you edit
- **Auto-save** - Direct commit to your profile repository

### 3. Theme System
- **Dark/Light Mode** - Toggle between dark and light mode
- **Persistence** - Selected theme is saved and synced across tabs

### 4. Real-time Communication
- **Cross-tab sync** - State changes are instantly reflected in other open tabs
- **State persistence** - Local changes survive browser refresh

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Login   │  │Dashboard │  │  Repos   │  │  Editor │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │            │            │           │        │
│         └────────────┴────────────┴───────────┘        │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │ React Query │ (State + Cache)      │
│                   └──────┬──────┘                       │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                    GitHub API (REST)
```

### Key Components

| Component | Responsibility |
|------------|-----------------|
| `App.tsx` | Routing and global providers |
| `ThemeContext` | Theme management (dark/light) |
| `Repos.tsx` | Repository management with local state |
| `Editor.tsx` | README editor with TipTap |
| `github.ts` | GitHub API wrapper |
| `insforge.ts` | InsForge SDK client |

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State**: TanStack React Query + Context API
- **Styling**: Tailwind CSS
- **Editor**: TipTap (Rich Text Editor)
- **Deployment**: InsForge (Vercel-compatible)
- **API**: GitHub REST API v3

---

## Business Logic

### Repository Visibility State

The main challenge was maintaining correct visibility state considering GitHub API delay. The implemented solution:

1. **Local state `localChanges`**: Map storing user-made changes
2. **Function `getRepoVisibility()`**: Returns `localChanges` value if exists, otherwise uses server value
3. **localStorage persistence**: Changes survive browser refresh
4. **Storage Events**: Cross-tab synchronization

```typescript
const getRepoVisibility = (repo: GitHubRepo): boolean => {
  if (localChanges.has(repo.id)) {
    return localChanges.get(repo.id)!
  }
  return repo.private
}
```

### Authentication

- Uses **Personal Access Token** from GitHub
- Token is stored in localStorage
- Sent with every request to GitHub API

### Mutations

Changes are confirmed with GitHub and then local state is updated, avoiding conflicts with stale server data.

---

## Environment Variables

```env
VITE_GITHUB_CLIENT_ID=Ov23liCZGkZ1nO5pN9qX
VITE_INSFORGE_URL=https://dnrif6ny.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=eyJ...
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

---

## Production

The app is deployed on InsForge: https://dnrif6ny.insforge.site

---

## Required Token Permissions

To use the app, the Personal Access Token must have:
- `repo` - Repository access
- `read:user` - Read user information

---

## License

MIT