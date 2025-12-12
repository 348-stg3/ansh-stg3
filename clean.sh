#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning audiobook database and files...${NC}\n"

# Clean MongoDB
echo "📊 Cleaning MongoDB collections..."
docker exec mongodb mongosh audiobooks_db --quiet --eval "
  db.books.deleteMany({});
  db.segments.deleteMany({});
  db.segment_timings.deleteMany({});
  print('  ✓ Books: ' + db.books.countDocuments({}));
  print('  ✓ Segments: ' + db.segments.countDocuments({}));
  print('  ✓ Timings: ' + db.segment_timings.countDocuments({}));
"

# Clean output directory
echo ""
echo "📁 Cleaning output directory..."
rm -rf audio_reader_standalone/output/*
echo "  ✓ Removed all output files"

# Clean uploads
echo ""
echo "📤 Cleaning uploads..."
find backend/uploads -name "*.pdf" -delete 2>/dev/null
echo "  ✓ Removed uploaded PDFs"

echo ""
echo -e "${GREEN}✅ Cleanup complete! Everything is fresh and clean.${NC}"
echo ""
echo "Run ./start-dev.sh to start the app"

