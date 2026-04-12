# 📚 Learning Progress Tracker - System Design

A stunning, full-featured multi-page application to track your learning journey with videos and PDFs.

---

## 1. 🎯 Project Overview

A full-stack learning management system that allows users to:

- Upload and organize learning resources (videos + PDFs)
- Group content by collections with custom colors
- Track learning progress automatically
- Resume learning from where you left off
- Beautiful dark theme with modern UI

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Framer Motion |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Styling | CSS with CSS Variables (Dark Theme) |

---

## 2. 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     React Frontend                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Dashboard│ │ Library │ │ Manage  │ │ Player  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       └───────────┴───────────┴───────────┘                │
│                        │                                   │
│              ┌─────────┴─────────┐                         │
│              │   Sidebar Nav     │                         │
└──────────────┼───────────────────┼─────────────────────────┘
               │                   │
               ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│                  Express Backend (Port 5000)             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Controllers│──│  Services  │──│   Routes   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│     ┌──────────────┐      ┌──────────────────┐           │
│     │  collections │◄────►│  learning_items  │           │
│     └──────────────┘      └──────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

---

## 3. 📁 Project Structure

```
Progress-app/
├── backend/
│   ├── controllers/
│   │   ├── itemController.js    # Item request handlers
│   │   └── analyticsController.js # Analytics request handlers
│   ├── db/
│   │   ├── index.js             # Database connection pool
│   │   └── schema.js            # Table definitions
│   ├── routes/
│   │   ├── itemRoutes.js        # Item API routes
│   │   └── analyticsRoutes.js   # Analytics API routes
│   ├── services/
│   │   ├── itemService.js       # Item business logic
│   │   ├── analyticsService.js  # Analytics & progress history
│   │   └── collectionService.js # Collection business logic
│   ├── server.js                # Express entry point
│   ├── Dockerfile               # Backend Docker image
│   ├── .dockerignore
│   ├── .env                     # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Sidebar/
│   │   │   │   ├── index.js     # Navigation sidebar
│   │   │   │   └── styles.css
│   │   │   ├── VideoPlayer/
│   │   │   │   ├── index.js     # Custom video player
│   │   │   │   └── styles.css
│   │   │   ├── PDFViewer/
│   │   │   │   ├── index.js     # PDF viewer
│   │   │   │   └── styles.css
│   │   │   ├── CollectionManager/
│   │   │   │   ├── index.js     # Collection CRUD
│   │   │   │   └── styles.css
│   │   │   ├── LearningList/
│   │   │   │   └── index.js     # Item list display
│   │   │   ├── FileUploader/
│   │   │   │   └── index.js     # File upload logic
│   │   │   ├── EmptyState/
│   │   │   │   └── index.js     # Empty state display
│   │   │   ├── Header/
│   │   │   │   └── index.js     # App header
│   │   │   └── index.js         # Central exports
│   │   │
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard/
│   │   │   │   ├── index.js     # Stats & continue watching
│   │   │   │   └── styles.css
│   │   │   ├── Library/
│   │   │   │   ├── index.js     # Browse content
│   │   │   │   └── styles.css
│   │   │   ├── Manage/
│   │   │   │   ├── index.js     # Upload & organize
│   │   │   │   └── styles.css
│   │   │   ├── Player/
│   │   │   │   ├── index.js     # Video/PDF player
│   │   │   │   └── styles.css
│   │   │   ├── ProgressMap/
│   │   │   │   ├── index.js     # Learning analytics
│   │   │   │   └── styles.css
│   │   │   └── index.js         # Central exports
│   │   │
│   │   ├── hooks/
│   │   │   └── useItems.js      # Data management hook
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── App.js               # Router configuration
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   │
│   ├── Dockerfile               # Frontend Docker image
│   ├── nginx.conf               # Nginx config for SPA
│   └── .dockerignore
│
├── docs/
│   └── Full_System_Design.md    # This document
│
├── docker-compose.yml           # Docker orchestration
├── .gitignore
└── README.md
```

---

## 4. 🗄️ Database Schema

### Table: collections

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | Collection name (unique) |
| color | TEXT | Hex color code |
| icon | TEXT | Icon identifier |
| order_index | INT | Display order |
| created_at | TIMESTAMP | Creation time |

### Table: learning_items

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | File name |
| type | TEXT | 'video' or 'pdf' |
| file_id | TEXT | Unique file identifier |
| collection_id | INT | FK to collections |
| order_index | INT | User-defined order |
| progress | FLOAT | 0 to 100 |
| is_completed | BOOLEAN | Completion status |
| last_position | FLOAT | Video timestamp (seconds) |
| duration | FLOAT | Video duration (seconds) |
| current_page | INT | Current PDF page (default 1) |
| total_pages | INT | Total pages in PDF (default 0) |
| bookmarks | JSONB | PDF bookmarks array (default []) |
| notes | JSONB | PDF notes array (default []) |
| reading_time | INT | Total reading time in seconds (default 0) |
| thumbnail | TEXT | Thumbnail data (optional) |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Table: progress_history

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| item_id | INT | FK to learning_items |
| progress | FLOAT | Progress at time of logging |
| time_spent | INT | Seconds spent in session |
| session_date | DATE | Date of the learning session |
| recorded_at | TIMESTAMP | Exact timestamp |

### Indexes

- `idx_learning_items_order` - Order index
- `idx_learning_items_type` - Type filtering
- `idx_learning_items_collection` - Collection filtering
- `idx_collections_order` - Collection ordering
- `idx_progress_history_item` - Progress history by item
- `idx_progress_history_date` - Progress history by date
- `idx_progress_history_recorded` - Progress history by timestamp

---

## 5. 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Collections API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/items/collections` | Get all collections |
| `POST` | `/items/collections` | Create collection |
| `PATCH` | `/items/collections/:id` | Update collection |
| `DELETE` | `/items/collections/:id` | Delete collection |
| `PATCH` | `/items/collections/reorder` | Reorder collections |
| `GET` | `/items/by-collection/:id` | Get items by collection |

### Items API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/items` | Create new items |
| `GET` | `/items` | Get all items |
| `GET` | `/items/:id` | Get single item |
| `PATCH` | `/items/:id` | Update item metadata |
| `PATCH` | `/items/:id/progress` | Update progress |
| `PATCH` | `/items/:id/complete` | Toggle completion |
| `PATCH` | `/items/:id/collection` | Move to collection |
| `PATCH` | `/items/reorder` | Reorder items |
| `DELETE` | `/items/:id` | Delete item |

### Analytics API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard` | Combined dashboard analytics |
| `GET` | `/analytics/heatmap` | Activity heatmap data (365 days) |
| `GET` | `/analytics/streak` | Current and longest streak |
| `GET` | `/analytics/today` | Today's learning stats |
| `GET` | `/analytics/daily` | Daily stats for date range |
| `GET` | `/analytics/weekly` | Weekly summary |
| `GET` | `/analytics/monthly` | Monthly summary |
| `GET` | `/analytics/completions` | Recent completions |
| `GET` | `/analytics/weekday-pattern` | Learning pattern by weekday |
| `POST` | `/analytics/log` | Manually log progress |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API status check |

### PDF API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pdf/:id/state` | Get PDF reading state |
| `PATCH` | `/pdf/:id/page` | Update page progress |
| `GET` | `/pdf/:id/stats` | Get PDF statistics |
| `GET` | `/pdf/:id/bookmarks` | Get all bookmarks |
| `POST` | `/pdf/:id/bookmarks` | Add bookmark |
| `DELETE` | `/pdf/:id/bookmarks/:bookmarkId` | Remove bookmark |
| `GET` | `/pdf/:id/notes` | Get all notes |
| `POST` | `/pdf/:id/notes` | Add note |
| `PATCH` | `/pdf/:id/notes/:noteId` | Update note |
| `DELETE` | `/pdf/:id/notes/:noteId` | Remove note |

---

## 6. 🗺️ Frontend Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Learning stats, continue watching, quick actions |
| `/library` | Library | Browse all content with search/filter |
| `/collections` | Collections | View content organized by collection |
| `/progress-map` | Progress Map | Activity heatmap, streaks, learning analytics |
| `/manage` | Manage | Upload files, manage collections, organize content |
| `/player/:id` | Player | View video/PDF content |

---

## 7. 📦 Features

### 7.1 Dashboard
- **Learning Statistics** - Total items, completed, in progress, hours learned
- **Continue Watching** - Resume from last position
- **Recent Activity** - Track learning sessions
- **Collection Progress** - Visual progress bars per collection
- **Quick Actions** - Fast access to common tasks

### 7.2 Library
- **Grid/List Views** - Toggle between layouts
- **Search** - Find content by name
- **Filter** - By type (video/pdf), status, collection
- **Progress Indicators** - Visual completion status

### 7.3 Manage
- **File Upload** - Single file, multiple files, or folders
- **Drag & Drop** - Drop files to upload
- **Bulk Operations** - Select multiple, delete, move
- **Collection Management** - Create, edit, delete, reorder collections
- **Item Organization** - Drag to reorder, move between collections

### 7.4 Player
- **Video Player**
  - Custom controls with gradient design
  - Keyboard shortcuts (Space, K, J, L, F, M, arrows)
  - Playback speed control (0.5x - 2x)
  - Progress persistence (auto-save)
  - Seek preview on hover
- **PDF Viewer**
  - Page tracking with scroll-based progress (IntersectionObserver)
  - Resume reading from last page
  - Bookmarks with custom titles and colors
  - Notes per page with edit/delete
  - Reading time tracking
  - Zoom controls (+/- buttons or keyboard)
  - Dark mode toggle
  - Fullscreen support
  - Keyboard navigation (arrow keys, Home/End)
  - Debounced backend sync (saves after scroll stops)
  - sendBeacon for reliable unmount saves

### 7.5 Progress Map
- **Activity Heatmap**
  - GitHub-style contribution graph
  - Last 365 days of activity
  - Color intensity based on session count
  - Hover tooltips with date and count
- **Streak Tracking**
  - Current consecutive learning days
  - Longest streak record
  - Visual streak indicator
- **Learning Analytics**
  - Today's time spent and sessions
  - Weekly totals and daily averages
  - Weekday learning patterns chart
  - Recent completions list

### 7.6 Sidebar Navigation
- Collapsible navigation
- Quick stats display
- Active route highlighting
- Responsive (collapses on mobile)

---

## 8. 🎨 Tech Stack Details

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-router-dom | 7.13.2 | Client-side routing |
| framer-motion | 10.16.16 | Animations |
| @hello-pangea/dnd | 16.5.0 | Drag and drop |
| lucide-react | 0.303.0 | Icons |
| react-toastify | 9.1.3 | Toast notifications |
| axios | 1.6.2 | HTTP client |
| react-pdf | 7.7.0 | PDF rendering |
| react-app-rewired | 2.2.1 | Build customization |
| prettier | 3.2.4 | Code formatting |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web framework |
| pg | 8.11.3 | PostgreSQL client (connection pool singleton) |
| cors | 2.8.5 | CORS middleware |
| dotenv | 16.3.1 | Environment variables |
| uuid | 9.0.0 | Unique ID generation |
| nodemon | 3.0.1 | Dev hot reload |
| prettier | 3.2.4 | Code formatting |

---

## 9. 🎮 Keyboard Shortcuts (Video Player)

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

## 9.1 🎮 Keyboard Shortcuts (PDF Viewer)

| Key | Action |
|-----|--------|
| `→` / `PageDown` | Next page |
| `←` / `PageUp` | Previous page |
| `Home` | Go to first page |
| `End` | Go to last page |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `F` | Toggle fullscreen |
| `B` | Toggle bookmark |
| `D` | Toggle dark mode |

---

## 10. 🌟 Design System

### Color Palette

```css
/* Core Colors */
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-tertiary: #1a1a24;
--bg-card: #16161f;
--bg-elevated: #1e1e2a;

/* Accent Colors */
--accent-primary: #6366f1;
--accent-secondary: #8b5cf6;
--accent-tertiary: #a78bfa;

/* Gradient Colors */
--gradient-start: #6366f1;
--gradient-mid: #8b5cf6;
--gradient-end: #a855f7;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* Text Colors */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #64748b;
```

### Design Highlights

- **Multi-Page Architecture** - Clean separation with React Router
- **Collapsible Sidebar** - Persistent navigation with stats
- **Glassmorphism** - Subtle blur effects and transparency
- **Gradient Accents** - Purple to indigo color scheme
- **Smooth Animations** - Powered by Framer Motion
- **Responsive Design** - Mobile-first with sidebar adaptation

---

## 11. 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Progress-app
   ```

2. **Set up the database**
   ```bash
   createdb learning_tracker
   ```

3. **Configure backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   echo "DATABASE_URL=postgresql://user:password@localhost:5432/learning_tracker" > .env
   echo "PORT=5000" >> .env
   
   # Initialize database
   npm run db:init
   ```

   **Backend Environment Variables:**
   
   | Variable | Default | Description |
   |----------|---------|-------------|
   | `PORT` | 5000 | Server port |
   | `DATABASE_URL` | - | PostgreSQL connection string |
   | `DB_POOL_MAX` | 20 | Maximum connections in pool |
   | `DB_POOL_MIN` | 2 | Minimum connections to maintain |
   | `DB_IDLE_TIMEOUT` | 30000 | Close idle connections after (ms) |
   | `DB_CONNECT_TIMEOUT` | 5000 | Connection timeout (ms) |
   | `DB_STATEMENT_TIMEOUT` | 30000 | Query timeout (ms) |
   | `DEBUG_SQL` | false | Log all SQL queries (dev only) |

4. **Configure frontend**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

### Docker Installation (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v
```

**Docker services:**
| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React app (nginx) |
| backend | 5000 | Express API |
| postgres | 5432 | PostgreSQL database |

---

## 12. 🔄 Data Flow

```
1. User selects files (folder/multiple/single)
           │
           ▼
2. Frontend filters valid files (video/pdf)
           │
           ▼
3. File metadata extracted:
   - name, type, file_id, duration
           │
           ▼
4. POST /api/items → Backend stores metadata
           │
           ▼
5. Frontend maintains file objects in memory (fileMap)
           │
           ▼
6. User interacts (play, progress, complete)
           │
           ▼
7. PATCH /api/items/:id/* → Progress saved to DB
           │
           ▼
8. On refresh, metadata loaded from DB
   Files must be re-selected (browser security)
```

---

## 13. ⚠️ Important Constraints

### Browser File Access

Browsers cannot access arbitrary local file paths for security reasons.

**Solution**: Use file input with directory selection:
```html
<input type="file" webkitdirectory multiple />
```

Files are accessible only during the session. Users must re-select folders after page refresh.

### File Storage

- Files remain on the user's system
- Only metadata is stored in the database
- File objects kept in React state (fileMap)

---

## 14. 📈 Future Enhancements

- [ ] Tags / categories for items
- [ ] Full-text search
- [ ] Cloud sync (optional)
- [ ] Notes per item
- [ ] AI recommendations
- [ ] Export/Import data
- [ ] Multiple themes
- [ ] Keyboard navigation
- [ ] Mobile app

---

## 15. 🧪 Edge Cases Handled

- Duplicate file uploads (skip if file_id exists)
- Invalid file types (filter to video/pdf only)
- Missing collections (cascade to uncategorized)
- Large file uploads (50MB limit)
- Empty states (graceful UI)
- Network errors (toast notifications)

---

## 16. 📜 License

MIT License - feel free to use this project for learning!

---

Built with ❤️ for learners everywhere
