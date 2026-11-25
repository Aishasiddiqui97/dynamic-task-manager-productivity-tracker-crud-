# TaskFlow – Dynamic Task Manager & Productivity Tracker (CRUD)

## Project Overview
TaskFlow is a fully frontend, single-page productivity dashboard built with HTML5, CSS3, and Vanilla JavaScript (ES6+). It lets users create, view, edit, delete, categorize, search, filter, and complete daily tasks. All data persists in the browser via localStorage, so nothing is lost on refresh.

## Main Features
- CRUD operations for tasks (Create, Read, Update, Delete)
- Categories: Work, Personal, Study, Other
- Priority levels: Low, Medium, High
- Due dates with overdue highlighting
- Status filters: All, Active, Completed
- Category & priority filters
- Overdue tasks filter
- Instant search by title, description, category
- Drag-and-drop reordering
- Task completion animations
- Clear all completed tasks
- Toast notifications
- Dark/Light theme toggle
- Responsive layout (mobile, tablet, desktop)
- Productivity statistics dashboard
- localStorage persistence

## Technology Stack
- HTML5 (semantic markup)
- CSS3 (Flexbox, Grid, animations, 3D transforms)
- Vanilla JavaScript (ES6+)
- Browser localStorage API

## CRUD Functionality
- **Create**: Add new tasks via form; unique IDs generated.
- **Read**: Render all saved tasks dynamically on load.
- **Update**: Edit title, description, category, due date, priority; toggle completion.
- **Delete**: Remove individual tasks with confirmation; clear all completed.

## localStorage Implementation
- Dedicated key: `taskflow_tasks`
- `saveToLocalStorage()` writes JSON-stringified tasks after every change.
- `loadFromLocalStorage()` parses safely, handling missing/invalid data.
- Task IDs, title, description, category, due date, priority, and completion status are stored.

## Folder Structure
```
taskflow/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   └── icons/
└── README.md
```

## Run Locally
1. Clone the repository.
2. Open `index.html` in any modern browser.
   Or serve with: `python -m http.server 8080` then visit http://localhost:8080

## Screenshots
_Add screenshots here._

## Deployment
Deploy to any static host (GitHub Pages, Netlify, Vercel). No backend required.
