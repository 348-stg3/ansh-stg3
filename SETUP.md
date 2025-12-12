# 🚀 Complete Setup Guide

Step-by-step instructions to get the audiobook application running.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] Python 3.10+ (already in venv)
- [ ] Gemini API key
- [ ] Cartesia API key

## Step 1: Clone & Navigate

```bash
cd /Users/ansh_is_g/Documents/cs348-project
```

## Step 2: Start MongoDB

### Option A: Homebrew (macOS)

```bash
brew services start mongodb-community
```

Verify it's running:
```bash
brew services list | grep mongodb
# Should show "started"
```

### Option B: Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Verify Connection

```bash
mongosh
# Should connect to mongodb://127.0.0.1:27017
```

## Step 3: Configure API Keys

The Python scripts need API keys. Check if `.env` exists:

```bash
cd audio_reader_standalone
ls -la .env
```

If it doesn't exist, create it:

```bash
cat > .env << 'EOF'
GOOGLE_API_KEY=your_gemini_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=audiobooks_db
LOG_LEVEL=INFO
EOF
```

**Replace the API keys with your actual keys!**

- Get Gemini key: https://aistudio.google.com/app/apikey
- Get Cartesia key: https://play.cartesia.ai/console

## Step 4: Backend Setup

Open a new terminal tab:

```bash
cd /Users/ansh_is_g/Documents/cs348-project/backend

# Install dependencies
npm install

# Create .env file (if doesn't exist)
cat > .env << 'EOF'
PORT=5000
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=audiobooks_db
NODE_ENV=development
EOF

# Start the server
npm run dev
```

You should see:
```
✅ Connected to MongoDB: audiobooks_db
📚 Checking for existing audiobooks...
✅ Imported 2 existing audiobook(s)
🚀 Server running on http://localhost:5000
```

## Step 5: Frontend Setup

Open another terminal tab:

```bash
cd /Users/ansh_is_g/Documents/cs348-project/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

## Step 6: Open Browser

Navigate to: http://localhost:3000

You should see:
- Upload zone at the top
- Two existing books below:
  - The Tortoise and the Hare
  - Three Little Pigs

## Step 7: Test the App

### Test 1: Play Existing Book

1. Click "The Tortoise and the Hare"
2. You should see:
   - List of sentences on the left
   - Player controls on the right
3. Click the play button
4. Watch the active sentence highlight in yellow
5. Click any sentence to jump to that part

### Test 2: Upload New PDF

1. Go back to home (click back arrow)
2. Drag a PDF onto the upload zone
3. Watch the progress updates:
   - "Step 1/4: Analyzing text..."
   - "Step 2/4: Storing segments..."
   - "Step 3/4: Generating audio..."
   - "Step 4/4: Creating timing data..."
4. When complete, the book appears in the grid
5. Click it to play

## Troubleshooting

### Backend won't start

**Error:** `EADDRINUSE: address already in use :::5000`

Solution:
```bash
lsof -ti:5000 | xargs kill -9
npm run dev
```

**Error:** `MongoDB connection error`

Solution:
```bash
# Check MongoDB is running
brew services list | grep mongodb

# If not, start it
brew services start mongodb-community
```

### Frontend won't start

**Error:** `EADDRINUSE: address already in use :::3000`

Solution:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Python scripts fail

**Error:** `CARTESIA_API_KEY environment variable is not set`

Solution:
```bash
cd audio_reader_standalone
cat .env
# Verify API keys are present

# If not, add them:
echo "CARTESIA_API_KEY=your_key_here" >> .env
echo "GOOGLE_API_KEY=your_key_here" >> .env
```

### Books not showing up

Solution:
```bash
# Check MongoDB has data
mongosh audiobooks_db
db.books.find().pretty()
db.segment_timings.countDocuments()

# If empty, reimport existing books by restarting backend
```

### Audio won't play

1. Check browser console for errors
2. Verify audio file exists:
   ```bash
   ls -lh audio_reader_standalone/output/the_tortoise_and_the_hare/book_continuous.wav
   ```
3. Try opening the audio URL directly:
   http://localhost:5000/audio/the_tortoise_and_the_hare/book_continuous.wav

## Directory Structure After Setup

```
cs348-project/
├── backend/
│   ├── node_modules/      ✓ Installed
│   ├── .env               ✓ Created
│   └── server.js          ✓ Running on :5000
├── frontend/
│   ├── node_modules/      ✓ Installed
│   └── ...                ✓ Running on :3000
└── audio_reader_standalone/
    ├── .env               ✓ API keys configured
    ├── venv/              ✓ Python env exists
    └── output/
        ├── the_tortoise_and_the_hare/
        │   └── book_continuous.wav   ✓ Exists
        └── three_little_pigs/
            └── book_continuous.wav   ✓ Exists
```

## All Set! 🎉

You should now have:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Existing books loaded
- ✅ Ready to upload and play audiobooks!

## Next Steps

1. Try uploading a short PDF (1-2 pages) first
2. Processing takes 3-5 minutes for short documents
3. Explore keyboard shortcuts (Space, Arrow keys)
4. Adjust playback speed
5. Click sentences to jump around

## Common Commands

```bash
# Start everything (easy way)
./start-dev.sh

# Start with clean database
./start-dev.sh --clean

# Clean database separately
./clean.sh

# Stop everything
Press Ctrl+C in the terminal running start-dev.sh

# Manual start (3 terminals)
Terminal 1: brew services start mongodb-community
Terminal 2: cd backend && npm run dev
Terminal 3: cd frontend && npm run dev
```

## Cleanup Commands

```bash
# Remove all books and generated files
./clean.sh

# Or do it manually:
docker exec mongodb mongosh audiobooks_db --eval "db.books.deleteMany({}); db.segments.deleteMany({}); db.segment_timings.deleteMany({});"
rm -rf audio_reader_standalone/output/*
find backend/uploads -name "*.pdf" -delete
```

---

**Need help?** Check the main README.md or console logs!

