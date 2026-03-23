# 📚 Learning Progress Tracker

A stunning, full-featured multi-page application to track your learning journey with videos and PDFs.

![Learning Progress Tracker](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue) ![React Router](https://img.shields.io/badge/React_Router-6-red) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

### 🏠 Dashboard
- **Learning Statistics** - Total items, completed, in progress, and hours learned
- **Continue Watching** - Resume where you left off with one click
- **Recent Activity** - Track your recent learning sessions
- **Collection Progress** - Visual progress bars for each collection
- **Quick Actions** - Fast access to common tasks

### 📖 Library
- **Grid/List Views** - Switch between visual layouts
- **Search & Filter** - Find content by name, type, or collection
- **Progress Indicators** - See completion status at a glance
- **Responsive Cards** - Beautiful content cards with hover effects

### ⚙️ Manage
- **Drag & Drop Upload** - Upload videos and PDFs with ease
- **Bulk Operations** - Select multiple items for batch actions
- **Reorder Items** - Drag and drop to customize order
- **Edit Metadata** - Rename items and change collections
- **Collection Management** - Create, edit, and delete collections

### 🎬 Player
- **Stunning Video Player** - Custom-built with keyboard shortcuts
- **PDF Viewer** - Clean viewing with zoom controls
- **Progress Persistence** - Auto-saves as you learn
- **Fullscreen Support** - Immersive learning experience

### Core Features
- 📁 **Collections/Categories** - Organize content by collection with custom colors
- 📊 **Progress Tracking** - Automatically saves your progress
- 🖱️ **Drag & Drop** - Reorder your learning materials
- 🎯 **Resume Learning** - Pick up exactly where you left off
- 🌙 **Dark Theme** - Beautiful dark UI with glowing accents
- 📱 **Responsive** - Works on all screen sizes
- 🧭 **Sidebar Navigation** - Collapsible navigation with quick stats

## 🖼️ Screenshots

### Dashboard
- Learning statistics overview
- Continue watching section
- Collection progress tracking
- Recent activity feed
- Quick action buttons

### Library
- Grid and list view options
- Search and filter functionality
- Collection filtering
- Progress indicators on cards
- Responsive design

### Manage
- Drag & drop file upload zone
- Bulk selection mode
- Item reordering with drag & drop
- Edit item and collection modals
- Collection management panel

### Video Player
- Custom controls with gradient design
- Hover tooltips for seek preview
- Keyboard shortcuts (Space, K, J, L, F, M)
- Playback speed control
- Progress persistence

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Progress-app
   ```

2. **Set up the database**
   ```bash
   # Create a PostgreSQL database named 'learning_tracker'
   createdb learning_tracker
   ```

3. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Update .env with your database credentials
   # DATABASE_URL=postgresql://user:password@localhost:5432/learning_tracker
   
   # Initialize database schema (for new installations)
   npm run db:init
   
   # Or migrate existing database (adds collections support)
   npm run db:migrate
   
   # Start the server
   npm run dev
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### 🐳 Docker Setup (Recommended)

Run the entire stack with Docker Compose:

1. **Build and start all services**
   ```bash
   docker-compose up -d --build
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services**
   ```bash
   docker-compose down
   ```

4. **Stop and remove data**
   ```bash
   docker-compose down -v
   ```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## 🎮 Keyboard Shortcuts (Video Player)

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `J` | Skip back 10s |
| `L` | Skip forward 10s |
| `←` | Skip back 10s |
| `→` | Skip forward 10s |
| `↑` | Volume up |
| `↓` | Volume down |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |
| `0-9` | Seek to 0-90% |

## 📁 Project Structure

```
Progress-app/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── db/             # Database connection & schema
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── server.js       # Entry point
│
├── frontend/
│   ├── public/         # Static files
│   └── src/
│       ├── components/          # Reusable components
│       │   ├── Sidebar/
│       │   │   ├── index.js     # Navigation sidebar
│       │   │   └── styles.css
│       │   ├── VideoPlayer/
│       │   │   ├── index.js     # Custom video player
│       │   │   └── styles.css
│       │   ├── PDFViewer/
│       │   │   ├── index.js     # PDF viewer
│       │   │   └── styles.css
│       │   ├── CollectionManager/
│       │   │   ├── index.js
│       │   │   └── styles.css
│       │   └── index.js         # Central exports
│       │
│       ├── pages/               # Page components
│       │   ├── Dashboard/
│       │   │   ├── index.js     # Home dashboard
│       │   │   └── styles.css
│       │   ├── Library/
│       │   │   ├── index.js     # Content library
│       │   │   └── styles.css
│       │   ├── Manage/
│       │   │   ├── index.js     # Upload & manage
│       │   │   └── styles.css
│       │   ├── Player/
│       │   │   ├── index.js     # Media player
│       │   │   └── styles.css
│       │   └── index.js         # Central exports
│       │
│       ├── hooks/               # Custom React hooks
│       ├── services/            # API services
│       └── App.js               # Router configuration
│
└── docs/                        # Documentation
```

## 🗺️ Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Learning stats and continue watching |
| `/library` | Library | Browse all content with search/filter |
| `/manage` | Manage | Upload and manage files & collections |
| `/player/:id` | Player | View video/PDF content |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/items` | Create new items |
| `GET` | `/api/items` | Get all items |
| `GET` | `/api/items/:id` | Get single item |
| `PATCH` | `/api/items/:id` | Update item metadata |
| `PATCH` | `/api/items/:id/progress` | Update progress |
| `PATCH` | `/api/items/:id/complete` | Mark as completed |
| `PATCH` | `/api/items/reorder` | Reorder items |
| `DELETE` | `/api/items/:id` | Delete item |
| `POST` | `/api/collections` | Create collection |
| `GET` | `/api/collections` | Get all collections |
| `PUT` | `/api/collections/:id` | Update collection |
| `DELETE` | `/api/collections/:id` | Delete collection |

## 🎨 Tech Stack

### Frontend
- React 18
- React Router 6 (multi-page routing)
- Framer Motion (animations)
- @hello-pangea/dnd (drag & drop)
- Lucide React (icons)
- React Toastify (notifications)
- Axios (HTTP client)

### Backend
- Node.js + Express
- PostgreSQL
- pg (PostgreSQL client)
- UUID (unique identifiers)

## 🌟 Design Highlights

- **Multi-Page Architecture** - Clean separation of concerns with dedicated pages
- **Collapsible Sidebar** - Persistent navigation with quick stats
- **Glassmorphism** - Subtle blur effects and transparency
- **Gradient Accents** - Purple to indigo color scheme
- **Smooth Animations** - Powered by Framer Motion
- **Responsive Design** - Mobile-first approach with sidebar adaptation
- **Accessibility** - Keyboard navigation support

## 📝 License

MIT License - feel free to use this project for learning!

---

Built with ❤️ for learners everywhere
