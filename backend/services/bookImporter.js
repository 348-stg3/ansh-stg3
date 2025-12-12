const fs = require('fs').promises;
const path = require('path');

/**
 * Import existing audiobooks from the output directory
 * Scans for books that have been fully processed and ensures they're in MongoDB
 */
async function importExistingBooks(db) {
  try {
    const outputDir = path.join(__dirname, '../../audio_reader_standalone/output');
    
    // Check if output directory exists
    try {
      await fs.access(outputDir);
    } catch {
      console.log('📁 No output directory found, skipping existing books import');
      return;
    }
    
    // Read all subdirectories
    const entries = await fs.readdir(outputDir, { withFileTypes: true });
    const bookDirs = entries.filter(entry => entry.isDirectory());
    
    if (bookDirs.length === 0) {
      console.log('📚 No existing audiobooks found');
      return;
    }
    
    console.log(`📚 Found ${bookDirs.length} potential audiobook(s)`);
    
    const booksCollection = db.collection('books');
    const segmentTimingsCollection = db.collection('segment_timings');
    let importedCount = 0;
    
    for (const dir of bookDirs) {
      const bookId = dir.name;
      const bookPath = path.join(outputDir, bookId);
      
      // Check if this book has the required files
      const audioFile = path.join(bookPath, 'book_continuous.wav');
      const timingsFile = path.join(bookPath, 'segment_timings.json');
      
      try {
        await fs.access(audioFile);
        await fs.access(timingsFile);
      } catch {
        console.log(`  ⏭️  Skipping ${bookId} (incomplete files)`);
        continue;
      }
      
      // Check if timing data exists
      const timingCount = await segmentTimingsCollection.countDocuments({ book_id: bookId });
      
      if (timingCount === 0) {
        console.log(`  ⚠️  ${bookId} has files but no timing data in DB (may need re-import)`);
        continue;
      }
      
      // Get timing data to calculate duration and segments count
      const timings = await segmentTimingsCollection
        .find({ book_id: bookId })
        .sort({ segment_index: 1 })
        .toArray();
      
      const totalSegments = timings.length;
      const lastSegment = timings[timings.length - 1];
      const duration = lastSegment ? lastSegment.end_time : 0;
      
      // Get book title (convert book_id to readable format)
      const title = bookId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Check if book already exists in MongoDB
      const existingBook = await booksCollection.findOne({ book_id: bookId });
      
      if (existingBook) {
        // Update existing book with latest duration and segment count
        await booksCollection.updateOne(
          { book_id: bookId },
          { 
            $set: { 
              duration: duration,
              total_segments: totalSegments,
              updated_at: new Date()
            } 
          }
        );
        console.log(`  ✓ ${bookId} updated (${totalSegments} segments, ${Math.round(duration)}s)`);
        continue;
      }
      
      // Create new book record
      await booksCollection.insertOne({
        book_id: bookId,
        title: title,
        total_segments: totalSegments,
        duration: duration,
        created_at: new Date(),
        source: 'existing'
      });
      
      console.log(`  ✅ Imported ${bookId} (${totalSegments} segments, ${Math.round(duration)}s)`);
      importedCount++;
    }
    
    if (importedCount > 0) {
      console.log(`✨ Imported ${importedCount} existing audiobook(s)`);
    } else {
      console.log('✓ All existing audiobooks already in database');
    }
    
  } catch (error) {
    console.error('❌ Error importing existing books:', error);
    // Don't throw - allow server to start even if import fails
  }
}

module.exports = {
  importExistingBooks
};

