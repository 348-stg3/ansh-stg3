#!/usr/bin/env node
/**
 * Fix book ID mismatch for books that were created before the sanitization fix
 * This script updates the book_id in the database to match the sanitized format
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Sanitization function (matching the Node.js version)
function generateBookId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function fixBookIdMismatch() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
  const dbName = process.env.MONGO_DB_NAME || 'audiobooks_db';
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const booksCollection = db.collection('books');
    const segmentsCollection = db.collection('segments');
    const timingsCollection = db.collection('segment_timings');
    
    // Find all books
    const books = await booksCollection.find({}).toArray();
    
    console.log(`\n📚 Found ${books.length} books\n`);
    
    for (const book of books) {
      const currentBookId = book.book_id;
      const title = book.title;
      const correctBookId = generateBookId(title);
      
      if (currentBookId !== correctBookId) {
        console.log(`🔧 Fixing: "${title}"`);
        console.log(`   Old ID: ${currentBookId}`);
        console.log(`   New ID: ${correctBookId}`);
        
        // Check if correct book already exists
        const correctBookExists = await booksCollection.findOne({ book_id: correctBookId });
        
        if (correctBookExists) {
          console.log(`   ℹ️  Correct book already exists, deleting duplicate...`);
          
          // Delete the old book with incorrect ID
          await booksCollection.deleteOne({ book_id: currentBookId });
          console.log(`   ✓ Deleted old book entry`);
          
          // Delete segments with old ID
          const segmentsResult = await segmentsCollection.deleteMany({ book_id: currentBookId });
          console.log(`   ✓ Deleted ${segmentsResult.deletedCount} old segments`);
          
          // Delete timings with old ID
          const timingsResult = await timingsCollection.deleteMany({ book_id: currentBookId });
          console.log(`   ✓ Deleted ${timingsResult.deletedCount} old timings`);
        } else {
          // Update book document
          await booksCollection.updateOne(
            { book_id: currentBookId },
            { $set: { book_id: correctBookId } }
          );
          
          // Update segments
          const segmentsResult = await segmentsCollection.updateMany(
            { book_id: currentBookId },
            { $set: { book_id: correctBookId } }
          );
          console.log(`   ✓ Updated ${segmentsResult.modifiedCount} segments`);
          
          // Update timings
          const timingsResult = await timingsCollection.updateMany(
            { book_id: currentBookId },
            { $set: { book_id: correctBookId } }
          );
          console.log(`   ✓ Updated ${timingsResult.modifiedCount} timings`);
        }
        
        console.log('   ✅ Fixed!\n');
      } else {
        console.log(`✓ "${title}" - already correct (${currentBookId})\n`);
      }
    }
    
    console.log('✨ All books checked and fixed if needed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the script
fixBookIdMismatch();

