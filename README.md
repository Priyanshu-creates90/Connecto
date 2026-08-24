# 🚀 Connecto

Connecto is a full-stack social media application that enables real-time messaging, post sharing, user authentication, and interactive engagement features. 

🌐 **Live Demo:** [https://connecto-1-psxd.onrender.com](https://connecto-1-psxd.onrender.com)

---

## ✨ Features

* **User Authentication:** Secure signup and login with JWT and password encryption.
* **Real-time Messaging:** Direct messaging powered by WebSockets (Socket.io) for instant delivery and online status tracking.
* **Posts & Media:** Share image posts, like, comment, and delete posts easily.
* **User Profiles:** Editable profile details, profile pictures, and personalized post feeds.
* **Interactive UI:** Responsive, modern user interface built using Tailwind CSS and Radix UI components.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite)
* **State Management:** Redux Toolkit
* **Styling:** Tailwind CSS, Shadcn UI
* **Icons:** Lucide React

### Backend
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB (mongoose)
* **Real-time Communications:** Socket.io
* **Image Hosting:** Cloudinary
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js

---

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the **backend** folder:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
URL=http://localhost:5173
