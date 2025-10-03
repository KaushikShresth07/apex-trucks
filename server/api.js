// Simple HTTP server for truck file operations
// This server handles real filesystem operations for truck management

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Convert project root relative path to absolute path
const DATA_DIR = path.resolve(__dirname, '../data');
const TRUCKS_DIR = path.join(DATA_DIR, 'trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');

app.use(cors());
app.use(express.json());
app.use('/data', express.static(path.join(__dirname, '../data')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDirectories();
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `upload_${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(TRUCKS_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Get list of all truck IDs from the filesystem
async function getAllTruckIds() {
  await ensureDirectories();
  
  try {
    const indexFilePath = path.join(TRUCKS_DIR, 'index.json');
    const data = await fs.readFile(indexFilePath, 'utf-8');
    const indexData = JSON.parse(data);
    return indexData.trucks.map(truck => truck.id);
  } catch (error) {
    console.error('Error reading truck index:', error);
    return [];
  }
}

// Read a single truck file
async function readTruckFile(id) {
  try {
    const indexFilePath = path.join(TRUCKS_DIR, 'index.json');
    const data = await fs.readFile(indexFilePath, 'utf-8');
    const indexData = JSON.parse(data);
    const truck = indexData.trucks.find(t => t.id === id);
    if (!truck) {
      throw new Error(`Truck not found: ${id}`);
    }
    return truck;
  } catch (error) {
    throw new Error(`Truck not found: ${id}`);
  }
}

// Write a single truck file
async function writeTruckFile(truck) {
  await ensureDirectories();
  
  try {
    const indexFilePath = path.join(TRUCKS_DIR, 'index.json');
    let indexData;
    
    try {
      const data = await fs.readFile(indexFilePath, 'utf-8');
      indexData = JSON.parse(data);
    } catch (error) {
      // Create new index.json if it doesn't exist
      indexData = { trucks: [], lastUpdated: new Date().toISOString() };
    }
    
    // Update or add truck
    const existingIndex = indexData.trucks.findIndex(t => t.id === truck.id);
    if (existingIndex >= 0) {
      indexData.trucks[existingIndex] = truck;
    } else {
      indexData.trucks.push(truck);
    }
    
    indexData.lastUpdated = new Date().toISOString();
    await fs.writeFile(indexFilePath, JSON.stringify(indexData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing truck file:', error);
    throw error;
  }
}

// Delete a truck file and its images
async function deleteTruckFile(id) {
  try {
    const indexFilePath = path.join(TRUCKS_DIR, 'index.json');
    const data = await fs.readFile(indexFilePath, 'utf-8');
    const indexData = JSON.parse(data);
    
    // Remove truck from index
    indexData.trucks = indexData.trucks.filter(t => t.id !== id);
    indexData.lastUpdated = new Date().toISOString();
    await fs.writeFile(indexFilePath, JSON.stringify(indexData, null, 2), 'utf-8');
    
    console.log(`✅ DELETED: truck ${id} from index.json`);
    
    // Also remove associated images
    try {
      const files = await fs.readdir(IMAGES_DIR);
      const imageFiles = files.filter(file => file.startsWith(`truck_${id}_`));
      
      for (const imageFile of imageFiles) {
        const imagePath = path.join(IMAGES_DIR, imageFile);
        await fs.unlink(imagePath);
        console.log(`✅ DELETED: /data/trucks/images/${imageFile}`);
      }
    } catch (error) {
      console.log('No images found to delete');
    }
  } catch (error) {
    throw new Error(`Error deleting truck files: ${error.message}`);
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API Routes

// Get all trucks
app.get('/api/trucks', async (req, res) => {
  try {
    await ensureDirectories();
    const ids = await getAllTruckIds();
    const trucks = [];
    
    for (const id of ids) {
      const truck = await readTruckFile(id);
      trucks.push(truck);
    }
    
    // Sort trucks
    const sortBy = req.query.sortBy || "-created_date";
    if (sortBy.startsWith('-')) {
      const field = sortBy.slice(1);
      trucks.sort((a, b) => {
        if (field === 'created_date') {
          return new Date(b[field]) - new Date(a[field]);
        }
        return String(b[field]).localeCompare(String(a[field]));
      });
    } else {
      const field = sortBy;
      trucks.sort((a, b) => {
        if (field === 'created_date') {
          return new Date(a[field]) - new Date(b[field]);
        }
        return String(a[field]).localeCompare(String(b[field]));
      });
    }
    
    res.json(trucks);
  } catch (error) {
    console.error('Error listing trucks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single truck
app.get('/api/trucks/:id', async (req, res) => {
  try {
    const truck = await readTruckFile(req.params.id);
    res.json(truck);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete truck
app.delete('/api/trucks/:id', async (req, res) => {
  try {
    // Check if truck exists first
    await readTruckFile(req.params.id);
    
    // Delete the truck file and associated images
    await deleteTruckFile(req.params.id);
    
    res.json({ success: true, message: `Truck ${req.params.id} deleted from filesystem` });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create truck
app.post('/api/trucks', async (req, res) => {
  try {
    await ensureDirectories();
    
    const newTruck = {
      id: generateId(),
      status: "available",
      images: [],
      features: [],
      imperial_inspected: false,
      ...req.body,
      created_date: new Date().toISOString(),
      source: "admin_created"
    };
    
    await writeTruckFile(newTruck);
    
    res.json(newTruck);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update truck
app.put('/api/trucks/:id', async (req, res) => {
  try {
    const existingTruck = await readTruckFile(req.params.id);
    
    const updatedTruck = {
      ...existingTruck,
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updated_date: new Date().toISOString(),
      source: existingTruck.source || "admin_updated"
    };
    
    await writeTruckFile(updatedTruck);
    
    res.json(updatedTruck);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Server status
app.get('/api/status', async (req, res) => {
  try {
    await ensureDirectories();
    const ids = await getAllTruckIds();
    
    res.json({
      status: 'healthy',
      truckCount: ids.length,
      dataDir: DATA_DIR,
      imagesDir: IMAGES_DIR,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    });
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileName = req.file.filename;
    const truckId = req.body.truckId || 'temp';
    
    console.log(`✅ Image uploaded: ${fileName} for truck ${truckId}`);
    console.log(`📁 Saved to: ${IMAGES_DIR}/${fileName}`);
    
    res.json({
      success: true,
      fileName: fileName,
      filePath: `/data/trucks/images/${fileName}`,
      truckId: truckId,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update image truck ID endpoint
app.put('/api/images/update-truck-id', async (req, res) => {
  try {
    const { truckId, imageUrls } = req.body;
    
    // Rename uploaded images to include truck ID and collect new URLs
    const updatedImageUrls = [];
    
    for (const imageUrl of imageUrls) {
      if (imageUrl.includes('upload_') && imageUrl.includes('localhost:3001')) {
        const fileName = path.basename(imageUrl);
        const newFileName = fileName.replace('upload_', `truck_${truckId}_`);
        
        const oldPath = path.join(IMAGES_DIR, fileName);
        const newPath = path.join(IMAGES_DIR, newFileName);
        
        try {
          await fs.rename(oldPath, newPath);
          console.log(`✅ Renamed image: ${fileName} → ${newFileName}`);
          
          // Add the new URL to the list
          const newUrl = `http://localhost:3001/data/trucks/images/${newFileName}`;
          updatedImageUrls.push(newUrl);
        } catch (error) {
          console.error(`❌ Failed to rename image ${fileName}:`, error);
          updatedImageUrls.push(imageUrl); // Keep original if rename fails
        }
      } else {
        updatedImageUrls.push(imageUrl); // Keep non-upload URLs as-is
      }
    }
    
    // Update the truck's JSON file with the new image URLs
    if (updatedImageUrls.length > 0) {
      try {
        const truckFilePath = path.join(TRUCKS_DIR, `truck_${truckId}.json`);
        const truckData = await fs.readFile(truckFilePath, 'utf-8');
        const truck = JSON.parse(truckData);
        
        truck.images = updatedImageUrls;
        
        await fs.writeFile(truckFilePath, JSON.stringify(truck, null, 2), 'utf-8');
        console.log(`✅ Updated truck ${truckId} with new image URLs`);
      } catch (error) {
        console.error(`❌ Failed to update truck ${truckId} image URLs:`, error);
      }
    }
    
    res.json({ success: true, updatedUrls: updatedImageUrls });
  } catch (error) {
    console.error('❌ Error updating image truck ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Truck API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${DATA_DIR}`);
  console.log(`📂 Trucks directory: ${TRUCKS_DIR}`);
  console.log(`🖼️ Images directory: ${IMAGES_DIR}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  
  if (NODE_ENV === 'production') {
    console.log('\n✅ Production mode - API endpoints available:');
  } else {
    console.log('\n🔧 Development mode - Available endpoints:');
  }
  
  console.log(`GET    /api/trucks          # List all trucks`);
  console.log(`GET    /api/trucks/:id     # Get single truck`);
  console.log(`POST   /api/trucks         # Create new truck`);
  console.log(`PUT    /api/trucks/:id     # Update truck`);
  console.log(`DELETE /api/trucks/:id     # Delete truck (REAL FILE DELETION)`);
  console.log(`POST   /api/upload         # Upload image file`);
  console.log(`PUT    /api/images/update-truck-id # Update image truck ID`);
  console.log(`GET    /api/status         # Server status`);
});

export default app;
