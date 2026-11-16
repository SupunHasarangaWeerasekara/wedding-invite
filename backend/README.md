# Wedding Invitation Backend API

RESTful API backend server for the Digital Wedding Invitation Web Application (Sanjaya & Gagani).

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
# or
npm start
```
The server will run on `http://localhost:5000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/invite/:code` | Get guest invitation details, event settings, and gallery |
| `POST` | `/api/rsvp` | Submit guest RSVP response, wishes, and dietary notes |
| `GET` | `/api/admin/guests` | Retrieve all guests with RSVP metrics |
| `POST` | `/api/admin/guests` | Add new guest and generate unique invite code |
| `GET` | `/api/admin/event` | Get event customization settings (names, fonts, images) |
| `POST` | `/api/admin/event` | Update wedding settings, content titles, and gallery photos |
| `GET` | `/api/calendar/:code` | Download `.ics` calendar file for Poruwa & Reception |

---

## 📁 Folder Structure
- `server.js` - Express API application and route handlers
- `data/` - JSON persistent storage (`event-settings.json`, `gallery-settings.json`, `guests.json`)
- `supabase_schema.sql` - Supabase PostgreSQL production schema and Row-Level Security policies
