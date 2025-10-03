// Simple HTTP server for truck file operations
// This server handles real filesystem operations for truck management

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Convert project root relative path to absolute path
const DATA_DIR = path.resolve(__dirname, '../data');
const TRUCKS_DIR = path.join(DATA_DIR, 'trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');

app.use(cors());
app.use(express.json());
app.use('/data', express.static(path.join(__dirname, '../data')));

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
    const files = await fs.readdir(TRUCKS_DIR);
    return files
      .filter(file => file.startsWith('truck_') && file.endsWith('.json'))
      .map(file => file.replace(/^truck_/, '').replace(/\.json$/, ''));
  } catch (error) {
    console.error('Error reading trucks directory:', error);
    return [];
  }
}

// Read a single truck file
async function readTruckFile(id) {
  try {
    const filePath = path.join(TRUCKS_DIR, `truck_${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Truck not found: ${id}`);
  }
}

// Write a single truck file
async function writeTruckFile(truck) {
  await ensureDirectories();
  
  const filePath = path.join(TRUCKS_DIR, `truck_${truck.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(truck, null, 2), 'utf-8');
}

// Delete a truck file and its images
async function deleteTruckFile(id) {
  const filePath = path.join(TRUCKS_DIR, `truck_${id}.json`);
  
  try {
    await fs.unlink(filePath);
    console.log(`✅ DELETED: /data/trucks/truck_${id}.json`);
    
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
      ...req.body,
      status: req.body.status || "available",
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Truck API Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${DATA_DIR}`);
  console.log(`📂 Trucks directory: ${TRUCKS_DIR}`);
  console.log(`🖼️ Images directory: ${IMAGES_DIR}`);
  console.log('\nAvailable endpoints:');
  console.log(`GET    /api/trucks          # List all trucks`);
  console.log(`GET    /api/trucks/:id     # Get single truck`);
  console.log(`POST   /api/trucks         # Create new truck`);
  console.log(`PUT    /api/trucks/:id     # Update truck`);
  console.log(`DELETE /api/trucks/:id     # Delete truck (REAL FILE DELETION)`);
  console.log(`GET    /api/status         # Server status`);
});

export default app;
