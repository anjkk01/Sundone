# Sundone

Sundone is a full-stack web application designed for **task management and productivity tracking**. The project is divided into two main components:

- **Sundone (Frontend):** Built using Next.js and Tailwind CSS for a modern and responsive user interface.
- **Backend:** Developed with Express.js, Node.js, and PostgreSQL to provide a robust API and efficient data handling.

## Features

- **User Authentication** - Secure login and registration using JWT.
- **Task Management** - Create, update, delete, and organize tasks.
- **Real-time Updates** - Uses WebSockets for instant synchronization.
- **Responsive UI** - Mobile-friendly interface with Tailwind CSS.
- **Data Persistence** - PostgreSQL database for structured storage.

## Tech Stack

### Frontend (Sundone)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Calls:** Axios

### Backend
- **Framework:** Express.js (Node.js)
- **Database:** PostgreSQL
- **Authentication:** JWT-based
- **Caching:** Redis
- **Real-time Communication:** Socket.IO

## Setup & Installation

### Prerequisites
- Node.js (Latest LTS version)
- PostgreSQL Database
- Redis (if used)

### Installation

#### Clone the Repository
```sh
git clone https://github.com/anjkk01/Sundone.git
cd Sundone
```

#### Frontend Setup
```sh
cd sundone
npm install  # or yarn install
npm run dev  # Starts the development server
```

#### Backend Setup
```sh
cd backend
npm install  # or yarn install
npm run dev  # Starts the backend server
```

## Environment Variables

Create a `.env` file in both `sundone` and `backend` directories and add the following environment variables:

### Backend `.env`
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url (if applicable)
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000  # Adjust as needed
```

