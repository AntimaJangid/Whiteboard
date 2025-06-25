# 🖍️ Real-Time Collaborative Whiteboard App

A web-based collaborative whiteboard that allows multiple users to draw on a shared canvas in real time. Built using `Node.js`, `Express`, and `Socket.IO`,
the application provides an interactive drawing environment with multiple predefined rooms.

---

## 📌 Project Description

This is a real-time whiteboard application where users can:
- Join predefined whiteboard "rooms"
- Draw simultaneously with others in the same room
- Clear the entire canvas
- Add basic shapes
- Access a gallery view of previously saved images (with placeholders for MongoDB integration)

---

## ✨ Features

- 🎨 Real-time collaborative drawing with multiple users
- 📁 Multiple rooms (General, Server2–Server7)
- 🔄 Canvas sync across all connected clients
- ⬛ Add shapes like rectangles and circles (basic shape support)
- 🧼 Clear canvas for everyone
- 🖼️ Gallery mode to preview saved drawings (requires MongoDB integration)

---

## 💻 Tech Stack Used

### Backend
- **Node.js**
- **Express.js**
- **Socket.IO**

### Frontend
- **HTML, CSS, JavaScript**
- **EJS (Embedded JavaScript templates)**

---

## 🚀 How to Run the Project Locally

### 1. Clone or Download the Repository


git clone https://github.com/AntimaJangid/your-repo-name.git
cd your-repo-name

 Install Dependencies
npm install

 Run the Server
node app.js

## 🌐 Live Demo
🚀 Render Deployment:(https://whiteboard-3jgm.onrender.com)


📁 Project Structure

.
├── app.js               # Main server file
├── Users.js             # Socket user management
├── image.js             # MongoDB image path placeholder
├── /views               # EJS template files
│   ├── login.ejs
│   ├── draw.ejs
│   └── gallery.ejs
├── /views/style2.css    # CSS styles
├── /public              # (Optional) public static files
└── package.json         # Project metadata and dependencies
