# Blog Project

A full-stack blog application built with React (Vite) frontend and Express.js backend with PostgreSQL database.

## Features

- Create, read, update, and delete blog posts
- Upload images and videos with posts
- Like posts
- Comment on posts
- Edit and delete your own posts and comments
- Responsive design with Material-UI

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd blog-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db
PORT=5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your backend server URL.

## Running the Application

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```
