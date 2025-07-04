# 🧠 Real-Time Collaborative To-Do Board

A minimal Trello-style Kanban board with real-time collaboration, smart task assignment, and conflict resolution.

---

## 🔧 Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, TypeScript  
**Frontend**: React (TypeScript), Socket.IO-client, React DnD, Custom CSS (no UI libraries)

---

## 🚀 Live Demo

🌐 [Live App](https://todo-7u66.onrender.com/)  
🎥 [Demo Video](https://drive.google.com/file/d/1XyddzKVupM9cxccx3rsMZnsfCL4u5EeZ/view?usp=drive_link)
[logic doc](https://drive.google.com/file/d/131nF7dxAh_jS06QdHK4IRffxHECtm5at/view?usp=drive_link)

---

## 📦 Setup & Installation

### 🔙 Backend

```bash
git clone https://github.com/your-username/todo-board.git
cd todo-board/backend
npm install
```

Create a `.env` file:
```
PORT=PORT
MONGO_URI=YOUR_URL
JWT_SECRET=yourSecretKey
```

Run backend:
```bash
npm run dev
```

### 🎨 Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## ✅ Features

- Secure JWT auth (register/login)
- Real-time task sync via Socket.IO
- Drag & drop Kanban (Todo, In Progress, Done)
- Smart task assignment
- Conflict handling for edits
- Activity log (last 20 actions)
- Responsive & mobile-friendly
- Custom animations, no UI libraries

---

## 🧠 Smart Assign Logic

- Counts active tasks per user.
- Finds the user with the fewest active tasks.
- Assigns selected task to them.
- Broadcasts update via Socket.IO to all clients.

---

## ⚔️ Conflict Handling Logic

- Task versions are tracked with timestamps.
- If two users edit the same task:
  - Backend detects mismatch.
  - Sends both versions to the frontend.
  - User chooses to **merge** or **overwrite**.
- Final task version is saved and synced live.

---

## 📘 Usage Guide

1. Register or Login.
2. Create boards and tasks.
3. Drag tasks between columns.
4. Assign tasks to users.
5. Click **Smart Assign** to auto-assign.
6. Watch updates happen live with others!
7. View recent actions in the activity panel.

---

