# Smart Placement Tracker

Smart Placement Tracker is a full-stack web application for managing job applications, interview experiences, and placement progress in one place.

## Features

- User authentication and profile management
- Track job applications with status updates
- Record interview experiences and notes
- Dashboard and analytics views for progress tracking
- Responsive UI built with React and Vite

## Tech Stack

- Frontend: React, Vite, React Router, Recharts
- Backend: Node.js, Express.js, MongoDB, JWT authentication

## Project Structure

- client/: React frontend
- server/: Express backend and MongoDB integration

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

### Backend setup

```bash
cd server
npm install
npm run dev
```

### Frontend setup

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the server folder with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-placement-tracker
JWT_SECRET=your_secret_key
```

## License

This project is for educational and personal use.
