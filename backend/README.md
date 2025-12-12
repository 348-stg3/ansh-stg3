# Audiobook Backend API

Backend server for the MERN audiobook application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Ensure MongoDB is running:
```bash
# If using Homebrew:
brew services start mongodb-community

# Or with Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Books

- `GET /api/books` - List all books
- `GET /api/books/:bookId` - Get book metadata
- `POST /api/books/upload` - Upload PDF (multipart/form-data)
- `GET /api/books/:bookId/status` - SSE stream for processing status
- `GET /api/books/:bookId/segments` - Get all segments with timing
- `GET /api/books/:bookId/audio` - Stream audio file
- `DELETE /api/books/:bookId` - Delete book and all data

### Health

- `GET /api/health` - Server health check

## Architecture

- **Express.js** - Web framework
- **MongoDB** - Database (using existing `audiobooks_db`)
- **Multer** - File upload handling
- **Python Integration** - Calls existing Python scripts via child_process
- **SSE** - Server-Sent Events for real-time progress updates

