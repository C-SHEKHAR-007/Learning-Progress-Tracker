# Backend UML Diagrams

This document contains UML diagrams for the Learning Progress Tracker backend architecture.

---

## 1. Class Diagram - Database Schema

```mermaid
classDiagram
    class collections {
        +int id PK
        +text name
        +text color
        +text icon
        +int order_index
        +timestamp created_at
    }
    
    class learning_items {
        +int id PK
        +text name
        +text type
        +text file_id
        +text file_path
        +int collection_id FK
        +int order_index
        +float progress
        +boolean is_completed
        +float last_position
        +float duration
        +int current_page
        +int total_pages
        +jsonb bookmarks
        +jsonb notes
        +int reading_time
        +text thumbnail
        +timestamp created_at
        +timestamp updated_at
    }
    
    class progress_history {
        +int id PK
        +int item_id FK
        +float progress
        +int time_spent
        +date session_date
        +timestamp recorded_at
    }
    
    collections "1" --> "*" learning_items : has
    learning_items "1" --> "*" progress_history : tracks
```

---

## 2. Class Diagram - Backend Architecture

```mermaid
classDiagram
    class Server {
        +Express app
        +int PORT
        +startServer()
    }
    
    class Database {
        -Pool pool
        -boolean isConnected
        +connect()
        +query(text, params)
        +getClient()
        +transaction(callback)
        +ping()
        +getStats()
        +close()
    }
    
    class ItemController {
        +createItems(req, res)
        +getAllItems(req, res)
        +getItem(req, res)
        +updateProgress(req, res)
        +markCompleted(req, res)
        +deleteItem(req, res)
        +serveFile(req, res)
    }
    
    class ItemService {
        +createItems(items, collectionId)
        +getAllItems()
        +getItemById(id)
        +updateProgress(id, progress, lastPosition)
        +markCompleted(id, isCompleted)
        +deleteItem(id)
    }
    
    class CollectionService {
        +createCollection(name, color, icon)
        +getAllCollections()
        +updateCollection(id, updates)
        +deleteCollection(id)
        +reorderCollections(collections)
    }
    
    class PdfController {
        +getReadingState(req, res)
        +updatePageProgress(req, res)
        +addBookmark(req, res)
        +removeBookmark(req, res)
        +addNote(req, res)
        +updateNote(req, res)
        +removeNote(req, res)
    }
    
    class PdfService {
        +updatePageProgress(itemId, currentPage, totalPages, readingTime)
        +getReadingState(itemId)
        +addBookmark(itemId, bookmark)
        +removeBookmark(itemId, bookmarkId)
        +addNote(itemId, note)
        +updateNote(itemId, noteId, updates)
        +removeNote(itemId, noteId)
    }
    
    class AnalyticsController {
        +getDashboard(req, res)
        +getHeatmap(req, res)
        +getStreak(req, res)
        +getTodayStats(req, res)
        +getWeeklySummary(req, res)
    }
    
    class AnalyticsService {
        +getHeatmapData(days)
        +calculateStreak()
        +getTodayStats()
        +getWeeklySummary()
        +getWeekdayPattern()
        +logProgress(itemId, progress, timeSpent)
    }
    
    Server --> Database : uses
    Server --> ItemController : routes
    Server --> PdfController : routes
    Server --> AnalyticsController : routes
    
    ItemController --> ItemService : calls
    ItemController --> CollectionService : calls
    PdfController --> PdfService : calls
    AnalyticsController --> AnalyticsService : calls
    
    ItemService --> Database : queries
    CollectionService --> Database : queries
    PdfService --> Database : queries
    AnalyticsService --> Database : queries
```

---

## 3. Sequence Diagram - PDF Page Progress Update

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Express Server
    participant PC as PdfController
    participant PS as PdfService
    participant DB as PostgreSQL
    
    FE->>API: PATCH /api/pdf/:id/page
    API->>PC: updatePageProgress(req, res)
    PC->>PC: Parse & validate request body
    PC->>PS: updatePageProgress(id, currentPage, totalPages, readingTime)
    PS->>PS: Calculate progress percentage
    PS->>DB: UPDATE learning_items SET current_page, progress...
    DB-->>PS: Return updated row
    PS-->>PC: Return item data
    PC-->>API: res.json(item)
    API-->>FE: 200 OK + item data
```

---

## 4. Sequence Diagram - Analytics Dashboard

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Express Server
    participant AC as AnalyticsController
    participant AS as AnalyticsService
    participant DB as PostgreSQL
    
    FE->>API: GET /api/analytics/dashboard
    API->>AC: getDashboard(req, res)
    
    par Parallel Queries
        AC->>AS: getHeatmapData(365)
        AS->>DB: SELECT date, count(*), sum(time_spent)...
        DB-->>AS: Heatmap data
        
        AC->>AS: calculateStreak()
        AS->>DB: SELECT DISTINCT session_date...
        DB-->>AS: Streak data
        
        AC->>AS: getTodayStats()
        AS->>DB: SELECT count(*), sum(time_spent)...
        DB-->>AS: Today stats
        
        AC->>AS: getWeeklySummary()
        AS->>DB: SELECT sum(time_spent), count(*)...
        DB-->>AS: Weekly summary
    end
    
    AC->>AC: Combine all results
    AC-->>API: res.json({ heatmap, streak, today, weekly })
    API-->>FE: 200 OK + dashboard data
```

---

## 5. Sequence Diagram - Item Creation with Progress History

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Express Server
    participant IC as ItemController
    participant IS as ItemService
    participant DB as PostgreSQL
    
    FE->>API: POST /api/items
    API->>IC: createItems(req, res)
    IC->>IC: Validate items array
    IC->>IS: createItems(items, collectionId)
    
    loop For each item
        IS->>DB: Check if file_id exists
        alt File exists
            DB-->>IS: Return existing item
        else File is new
            IS->>DB: INSERT INTO learning_items...
            DB-->>IS: Return new item
            IS->>DB: INSERT INTO progress_history (initial)
            DB-->>IS: Return history record
        end
    end
    
    IS-->>IC: Return created items
    IC-->>API: res.status(201).json(items)
    API-->>FE: 201 Created + items
```

---

## 6. Component Diagram - API Structure

```mermaid
flowchart TB
    subgraph Frontend
        React[React App]
    end
    
    subgraph Backend["Express Backend (Port 5000)"]
        subgraph Routes
            IR["/api/items"]
            PR["/api/pdf"]
            AR["/api/analytics"]
            HR["/health"]
            SR["/api-docs"]
        end
        
        subgraph Controllers
            IC[ItemController]
            PC[PdfController]
            AC[AnalyticsController]
        end
        
        subgraph Services
            IS[ItemService]
            CS[CollectionService]
            PS[PdfService]
            AS[AnalyticsService]
        end
        
        subgraph Config
            DB[(Database Singleton)]
            SW[Swagger Config]
        end
    end
    
    subgraph Database["PostgreSQL"]
        LI[(learning_items)]
        CO[(collections)]
        PH[(progress_history)]
    end
    
    React --> IR
    React --> PR
    React --> AR
    
    IR --> IC
    PR --> PC
    AR --> AC
    SR --> SW
    
    IC --> IS
    IC --> CS
    PC --> PS
    AC --> AS
    
    IS --> DB
    CS --> DB
    PS --> DB
    AS --> DB
    
    DB --> LI
    DB --> CO
    DB --> PH
```

---

## 7. Entity Relationship Diagram

```mermaid
erDiagram
    COLLECTIONS ||--o{ LEARNING_ITEMS : contains
    LEARNING_ITEMS ||--o{ PROGRESS_HISTORY : has
    
    COLLECTIONS {
        int id PK
        text name UK
        text color
        text icon
        int order_index
        timestamp created_at
    }
    
    LEARNING_ITEMS {
        int id PK
        text name
        text type
        text file_id UK
        text file_path
        int collection_id FK
        int order_index
        float progress
        boolean is_completed
        float last_position
        float duration
        int current_page
        int total_pages
        jsonb bookmarks
        jsonb notes
        int reading_time
        timestamp created_at
        timestamp updated_at
    }
    
    PROGRESS_HISTORY {
        int id PK
        int item_id FK
        float progress
        int time_spent
        date session_date
        timestamp recorded_at
    }
```

---

## 8. State Diagram - Learning Item Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Upload file
    Created --> InProgress: First access
    InProgress --> InProgress: Update progress
    InProgress --> Completed: Progress = 100%
    Completed --> InProgress: Revisit/Reset
    InProgress --> Deleted: Delete
    Completed --> Deleted: Delete
    Created --> Deleted: Delete
    Deleted --> [*]
    
    state InProgress {
        [*] --> Watching: Video
        [*] --> Reading: PDF
        Watching --> Watching: Seek/Pause/Play
        Reading --> Reading: Change page
        Reading --> Bookmarked: Add bookmark
        Bookmarked --> Reading: Continue
    }
```

---

## Notes

- All diagrams use Mermaid syntax for rendering
- View in VS Code with Mermaid preview extension or on GitHub
- The Database class implements the Singleton pattern
- Controllers handle HTTP request/response
- Services contain business logic
- All database operations go through the connection pool
