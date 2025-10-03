import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert project root relative path to absolute path
const DATA_DIR = path.resolve('data');
const TRUCKS_DIR = path.join(DATA_DIR, 'trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  
  try {
    await fs.access(TRUCKS_DIR);
  } catch {
    await fs.mkdir(TRUCKS_DIR, { recursive: true });
  }
  
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
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
    
    // Also remove associated images
    const files = await fs.readdir(IMAGES_DIR);
    const imageFiles = files.filter(file => file.startsWith(`truck_${id}_`));
    
    for (const imageFile of imageFiles) {
      const imagePath = path.join(IMAGES_DIR, imageFile);
      await fs.unlink(imagePath);
    }
  } catch (error) {
    throw new Error(`Error deleting truck files: ${error.message}`);
  }
}

// Handle image upload and storage
async function handleImageUpload(truck, images) {
  const storedImages = [];
  
  for (const [index, imageUrl] of images.entries()) {
    // Generate filename
    const filename = `truck_${truck.id}_${index}.jpg`;
    const imagePath = path.join(IMAGES_DIR, filename);
    
    try {
      // Convert image URL to local path
      const localImagePath = `/data/trucks/images/${filename}`;
      storedImages.push(localImagePath);
      
      // In a real implementation, you would save the actual image file here
      // For this demo, we'll create a placeholder file
      const placeholderData = Buffer.from(`Placeholder image for ${truck.make} ${truck.model}`);
      await fs.writeFile(imagePath, placeholderData);
    } catch (error) {
      console.error(`Error saving image ${filename}:`, error);
    }
  }
  
  return storedImages;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Truck service implementation
export const TruckService = {
  // List all trucks with optional sorting
  async list(sortBy = "-created_date") {
    await ensureDirectories();
    
    try {
      const ids = await getAllTruckIds();
      const trucks = [];
      
      for (const id of ids) {
        const truck = await readTruckFile(id);
        trucks.push(truck);
      }
      
      // Sort trucks
      if (sortBy.startsWith('-')) {
        const field = sortBy.slice(1);
        trucks.sort((a, b) => {
          if (field === 'created_date') {
            return new Date(b[field]) - new Date(a[field]);
          }
          return String(b[field]).localeCompare(String(a[field]));
        });
      } else {
        trucks.sort((a, b) => {
          if (field === 'created_date') {
            return new Date(a[field]) - new Date(b[field]);
          }
          return String(a[field]).localeCompare(String(b[field]));
        });
      }
      
      return trucks;
    } catch (error) {
      console.error('Error listing trucks:', error);
      return [];
    }
  },

  // Filter trucks based on criteria
  async filter(criteria, sortBy = "-created_date") {
    const allTrucks = await this.list(sortBy);
    
    return allTrucks.filter(truck => {
      return Object.entries(criteria).every(([key, value]) => {
        if (value === "all" || value === null || value === undefined) return true;
        return truck[key] === value;
      });
    });
  },

  // Get a single truck by ID
  async get(id) {
    return await readTruckFile(id);
  },

  // Create a new truck
  async create(data) {
    await ensureDirectories();
    
    const newTruck = {
      id: generateId(),
      ...data,
      status: data.status || "available",
      created_date: new Date().toISOString(),
      images: data.images || []
    };
    
    // Handle image uploads
    if (data.images && data.images.length > 0) {
      newTruck.images = await handleImageUpload(newTruck, data.images);
    }
    
    await writeTruckFile(newTruck);
    return newTruck;
  },

  // Update an existing truck
  async update(id, data) {
    const existingTruck = await readTruckFile(id);
    
    const updatedTruck = {
      ...existingTruck,
      ...data,
      id, // Ensure ID doesn't change
      updated_date: new Date().toISOString()
    };
    
    // Handle image uploads if provided
    if (data.images && data.images.length > 0) {
      updatedTruck.images = await handleImageUpload(updatedTruck, data.images);
    }
    
    await writeTruckFile(updatedTruck);
    return updatedTruck;
  },

  // Delete a truck and its images
  async delete(id) {
    await deleteTruckFile(id);
    return { success: true };
  },

  // Verify filesystem integrity
  async verify() {
    try {
      await ensureDirectories();
      const ids = await getAllTruckIds();
      
      return {
        status: 'healthy',
        truckCount: ids.length,
        dataDir: DATA_DIR,
        imagesDir: IMAGES_DIR,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
};

export default TruckService;
