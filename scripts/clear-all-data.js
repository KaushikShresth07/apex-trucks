import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRUCKS_DIR = path.resolve(__dirname, '../data/trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');
const INDEX_FILE = path.join(TRUCKS_DIR, 'index.json');

async function clearAllData() {
  try {
    console.log('🧹 Starting complete data cleanup...');
    
    // Clear index.json
    await fs.writeFile(INDEX_FILE, JSON.stringify({ 
      trucks: [], 
      lastUpdated: new Date().toISOString() 
    }, null, 2), 'utf-8');
    console.log('✅ Cleared all trucks from index.json');

    // Clear images directory
    try {
      const files = await fs.readdir(IMAGES_DIR);
      for (const file of files) {
        await fs.unlink(path.join(IMAGES_DIR, file));
        console.log(`🗑️  Deleted image: ${file}`);
      }
      console.log(`✅ Cleared ${files.length} images from data/trucks/images`);
    } catch (error) {
      console.log('ℹ️  Images directory is already empty or doesn\'t exist');
    }

    console.log('\n🎉 All server-side data has been cleared!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart the API server: pm2 restart apex-trucks-api');
    console.log('2. Clear browser cache/localStorage');
    console.log('3. Hard refresh the website (Ctrl+F5)');
    console.log('4. Check browser console for any cached data');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearAllData();
