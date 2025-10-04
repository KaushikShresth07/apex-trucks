#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const TRUCKS_DIR = path.join(DATA_DIR, 'trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');

console.log('🚨 CLEARING ALL TRUCKS AND IMAGES...');

async function clearAllTrucksAndImages() {
  try {
    // Clear trucks from index.json
    const indexPath = path.join(TRUCKS_DIR, 'index.json');
    const emptyData = {
      trucks: [],
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(indexPath, JSON.stringify(emptyData, null, 2), 'utf-8');
    console.log('✅ Cleared all trucks from index.json');

    // Clear all images
    const imageFiles = await fs.readdir(IMAGES_DIR).catch(() => []);
    
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imagePath = path.join(IMAGES_DIR, imageFile);
        await fs.unlink(imagePath);
        console.log(`🗑️ Deleted image: ${imageFile}`);
      }
      console.log(`✅ Deleted ${imageFiles.length} images`);
    } else {
      console.log('ℹ️ No images to delete');
    }

    console.log('🎉 All trucks and images cleared successfully!');
    console.log('📊 Summary:');
    console.log(`   - Trucks cleared: All trucks removed`);
    console.log(`   - Images deleted: ${imageFiles.length}`);
    
  } catch (error) {
    console.error('❌ Error clearing trucks:', error.message);
    process.exit(1);
  }
}

clearAllTrucksAndImages();
