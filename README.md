# Studio OS

An internal company management system for game development studios. Built as a full-stack web application with a VS Code-style workspace, team communication, feedback system, and resource library.

---

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Ant Design (UI components)
- Monaco Editor (VS Code-style code editor)
- React Router DOM

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM + SQLite (prototype)
- JWT Authentication
- bcryptjs (password hashing)

---

## Features

### Workspace (Dashboard)
- VS Code-style file tree with folder support
- Monaco editor for code files
- Image, PDF, and document preview
- File drag-and-drop between folders
- Create, upload, rename, and delete files
- Commit system — every save creates a commit record with a message

### Feedback
- Company-wide commit feed across all projects
- Filter by project and file type
- Click any commit to view file content (code, image, PDF)
- Threaded comments with replies on each commit

### Group Chat
- Slack-style messaging interface
- Group rooms and direct messages
- 300 character message limit
- Polling-based real-time updates (every 3 seconds)

### Resources
- Company knowledge base organized by topic categories
- Folder navigation within categories
- Supports files (PDF, image, video, doc) and external links
- Search with filter
- Grid and list view toggle
- Admin-managed (upload/edit/delete)

### User Management (Admin)
- View all company members
- Edit job roles with track hierarchy (Developer → Lead Developer → Dev Director)
- Switch job tracks with required reason
- Assign users to multiple game projects
- Promote to Admin or Founder

### Project Management (Admin)
- Create and manage game projects
- Assign members to projects
- Track file counts per project

### Settings / Profile
- Avatar with initials and color based on user ID
- Edit name, email, phone number
- View participating projects
- Save button appears only when changes are detected

---

## Project Structure

```
SystemDesign/
├── frontend/                  # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── chat/          # Chat sidebar, window, header
│       │   ├── feedback/      # Commit detail and comments
│       │   ├── resources/     # Category grid, folder grid, resource grid
│       │   └── workspace/     # File tree, editor, modals
│       ├── layouts/           # Main layout, sidebar, header
│       ├── pages/             # Route-level page components
│       │   └── admin/         # Admin-only pages
│       └── types.ts
│
└── backend/                   # Node.js + Express + TypeScript
    └── src/
        ├── controllers/       # Business logic
        ├── middleware/        # Auth, validation
        ├── routes/            # API route definitions
        └── utils/             # ID generator, helpers
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd SystemDesign

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Running the App

```bash
# Terminal 1 — Backend (port 5001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Create `backend/.env`:

```env
JWT_SECRET=your-secret-key
DATABASE_URL=file:./dev.db
```

---

## Test Accounts

| Role    | Public ID  | Password          |
|---------|------------|-------------------|
| Admin   | `ejk0522`  | `CompanyOwner12!` |
| User    | `lvk5123`  | `LunaKim12!`      |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login |
| GET | `/me` | Get current user |
| PATCH | `/me` | Update profile |
| GET | `/projects` | Get user's projects |
| GET | `/files/project/:id` | Get project files |
| POST | `/files/code` | Create code file |
| PUT | `/files/:id` | Update file content |
| PATCH | `/files/:id/move` | Move file to folder |
| DELETE | `/files/:id` | Delete file |
| GET | `/commits` | Get all commits |
| POST | `/commits` | Create commit |
| POST | `/commits/:id/comments` | Add comment |
| GET | `/resources` | Get resources |
| GET | `/resources/categories` | Get categories |
| GET | `/chat/rooms` | Get chat rooms |
| POST | `/chat/rooms` | Create group room |
| POST | `/chat/rooms/dm` | Create DM |
| POST | `/chat/rooms/:id/messages` | Send message |
| GET | `/admin/users` | Get all users (admin) |
| POST | `/admin/assign-game` | Assign games to user |

---

## Roadmap

- [ ] Forgot password email flow
- [ ] Announcements / dashboard board
- [ ] Real-time chat with Socket.io
- [ ] File storage migration (SQLite → PostgreSQL + S3)
- [ ] Diff view for code commits

---

## Author

Yoojun Kim — Penn State CS + Mathematics
