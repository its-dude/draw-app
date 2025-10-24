
# doodly

A real-time collaborative drawing web application built using MERN stack.It features an infinite, pannable canvas with tools like pencil, rectangle, circle, line, eraser, undo/redo, zoom and more.



## Tech Stack

**Client:** React, TailwindCSS

**Server:** Node, Express, MongoDB, WebSockets

## Manual Installation
1. clone the Repository
```bash
git clone https://github.com/its-dude/doodly.git
cd doodly
```
2. Install Dependencies
```bash
cd frontend
npm install
npm run dev
```
```bash
cd backend
npm install
npm run dev
```
3. Set Up Environment Variables
```bash
Rename .env.example to .env
```
## Using Docker Compose (Recommeded)

1. Build & Start Service
```bash
docker-compose up --build
```
2. Build & stop Service
```bash
docker-compose down
```