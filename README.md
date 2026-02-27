# MicroHustle

🔗 **Live Demo:** [microhustle.onrender.com](https://microhustle.onrender.com)

A full-stack micro-task marketplace where **Posters** publish small jobs and **Hustlers** earn money by completing them. Built with a React frontend and a Spring Boot REST API backed by PostgreSQL, with real-time messaging over WebSocket.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Contributing](#contributing)

---

## Features

- **Task Marketplace** – Browse open tasks filtered by tags, budget, and deadline
- **Post Tasks** – Posters create tasks with title, description, budget, deadline, tags, and an optional image
- **Accept & Complete** – Hustlers accept tasks, submit work, and mark tasks complete
- **Real-time Chat** – In-app messaging between Poster and Hustler via WebSocket (STOMP over SockJS)
- **Notifications** – Live bell-icon notifications for task updates and messages
- **Offer System** – Hustlers can send offers on tasks before acceptance
- **Ratings & Reviews** – Posters rate Hustlers after task completion
- **User Profiles** – Avatar, bio, rating history, and task history per user
- **File Uploads** – Attach images to tasks (up to 10 MB)
- **JWT Authentication** – Stateless token-based auth with Spring Security

---

## 📸 Screenshots



---

<img width="1887" height="901" alt="Screenshot 2026-02-27 183625" src="https://github.com/user-attachments/assets/2ce8716f-826a-40f0-b814-15fe8b5c7f99" />

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v7 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible headless components |
| Framer Motion | Animations |
| `@stomp/stompjs` + `sockjs-client` | WebSocket real-time messaging |
| React Hook Form + Zod | Form handling & validation |
| lucide-react / @tabler/icons | Icon sets |

### Backend

| Technology | Purpose |
|---|---|
| Spring Boot 2.7.18 | Application framework |
| Java 11 | Runtime |
| Spring Security | Authentication & authorisation |
| Spring Data JPA (Hibernate) | ORM / database access |
| PostgreSQL | Relational database |
| JWT (`jjwt 0.9.1`) | Stateless token auth |
| Spring WebSocket (STOMP) | Real-time messaging |
| Lombok | Boilerplate reduction |

---

## Project Structure

```
MicroHustle/
├── backend/                  # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/microhustle/
│       ├── config/           # Security, CORS, WebSocket config
│       ├── controller/       # REST endpoints
│       │   ├── TaskController.java
│       │   ├── UserController.java
│       │   ├── MessageController.java
│       │   ├── NotificationController.java
│       │   ├── HustlerRatingController.java
│       │   ├── UserProfileController.java
│       │   └── FileUploadController.java
│       ├── model/            # JPA entities
│       │   ├── Task.java
│       │   ├── User.java
│       │   ├── Message.java
│       │   ├── Notification.java
│       │   ├── Offer.java
│       │   └── HustlerRating.java
│       ├── repository/       # Spring Data repositories
│       └── service/          # Business logic
│
├── frontend/                 # React SPA
│   ├── public/
│   └── src/
│       ├── pages/            # Route-level page components
│       ├── components/       # Reusable UI components
│       │   └── ui/           # Shadcn-style primitives
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # API client, utilities
│       ├── contexts/         # React context providers
│       └── styles/           # Component-level CSS
│
└── render.yaml               # Render.com deployment blueprint
```

---

## Getting Started

### Prerequisites

- **Java 11+** and **Maven 3.8+**
- **Node.js 18+** and **npm**
- **PostgreSQL 14+** running locally

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/namann06/MicroHustle.git
   cd MicroHustle/backend
   ```

2. **Create a local PostgreSQL database**
   ```sql
   CREATE DATABASE microhustle;
   ```

3. **Configure environment variables** (or rely on the defaults in `application.properties`)
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=microhustle
   export DB_USERNAME=postgres
   export DB_PASSWORD=postgres
   export JWT_SECRET=your_256bit_secret_here
   ```

4. **Build and run**
   ```bash
   mvn spring-boot:run
   ```

   The API will be available at `http://localhost:8080`.

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set the API base URL** – create a `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`.

---

## Environment Variables

### Backend (`application.properties` / env)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `microhustle` | Database name |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `JWT_SECRET` | *(dev key)* | HS256 signing secret (min 256 bits) |
| `JWT_EXPIRATION` | `86400000` | Token TTL in milliseconds (24 h) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed frontend origin |
| `PORT` | `8080` | Server port |
| `FILE_UPLOAD_DIR` | `uploads` | Directory for uploaded files |

### Frontend

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the Spring Boot API |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT |
| `GET` | `/api/tasks` | List all open tasks |
| `POST` | `/api/tasks` | Create a new task (Poster) |
| `GET` | `/api/tasks/{id}` | Get task details |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `POST` | `/api/tasks/{id}/accept` | Accept a task (Hustler) |
| `POST` | `/api/tasks/{id}/complete` | Mark task complete |
| `GET` | `/api/messages/{taskId}` | Get messages for a task |
| `POST` | `/api/messages` | Send a message |
| `GET` | `/api/notifications` | Get user notifications |
| `POST` | `/api/ratings` | Rate a Hustler |
| `GET` | `/api/users/{id}/profile` | Get user profile |
| `POST` | `/api/upload` | Upload a file |

WebSocket endpoint: `ws://<host>/ws` — subscribe to `/topic/messages/{taskId}` and `/user/queue/notifications`.

---



## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is open-source. See [LICENSE](LICENSE) for details.
