/**
 * Script to fix books with missing duration field
 * Calculates duration from segment_timings and updates books collection
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'audiobooks_db';

async function fixBookDurations() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const booksCollection = db.collection('books');
    const timingsCollection = db.collection('segment_timings');

    // Find all books
    const books = await booksCollection.find({}).toArray();
    console.log(`\n📚 Found ${books.length} book(s) to check\n`);

    for (const book of books) {
      const bookId = book.book_id;
      const currentDuration = book.duration || 0;

      console.log(`📖 Checking: ${book.title} (${bookId})`);
      console.log(`   Current duration: ${currentDuration}s`);

      // Find the segment with the highest end_time for this book
      const lastSegment = await timingsCollection.findOne(
        { book_id: bookId },
        { 
          sort: { end_time: -1 },
          projection: { end_time: 1, _id: 0 }
        }
      );

      if (!lastSegment) {
        console.log(`   ⚠️  No timing data found - skipping\n`);
        continue;
      }

      const calculatedDuration = lastSegment.end_time;
      console.log(`   Calculated duration: ${calculatedDuration}s (${(calculatedDuration/60).toFixed(2)} minutes)`);

      // Update if duration is missing or different
      if (currentDuration !== calculatedDuration) {
        const result = await booksCollection.updateOne(
          { book_id: bookId },
          { 
            $set: { 
              duration: calculatedDuration,
              updated_at: new Date()
            } 
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`   ✅ Updated duration to ${calculatedDuration}s\n`);
        } else {
          console.log(`   ⚠️  Failed to update\n`);
        }
      } else {
        console.log(`   ✓ Duration already correct\n`);
      }
    }

    console.log('✅ All books processed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
fixBookDurations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
