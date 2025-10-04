// Client-side truck storage service using localStorage
// This simulates filesystem operations for a frontend application

const STORAGE_KEY = 'truck_sales_data';
const STORAGE_VERSION = '1.0';

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get storage data
function getStorageData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialize with empty data
      const defaultData = {
        version: STORAGE_VERSION,
        trucks: {},
        sequence: 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {
      version: STORAGE_VERSION,
      trucks: {},
      sequence: 0
    };
  }
}

// Save storage data
function saveStorageData(data) {
  try {
    data.version = STORAGE_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    throw new Error('Failed to save data');
  }
}

// Convert truck object to storage format
function truckToStorage(truck) {
  return {
    id: truck.id,
    make: truck.make,
    model: truck.model,
    year: truck.year,
    price: truck.price,
    mileage: truck.mileage,
    condition: truck.condition,
    fuel_type: truck.fuel_type,
    transmission: truck.transmission,
    engine: truck.engine,
    horsepower: truck.horsepower,
    torque: truck.torque,
    axle_configuration: truck.axle_configuration,
    cab_type: truck.cab_type,
    sleeper_size: truck.sleeper_size,
    wheelbase: truck.wheelbase,
    gvwr: truck.gvwr,
    exterior_color: truck.exterior_color,
    interior_color: truck.interior_color,
    company_inspected: truck.company_inspected || false,
    inspection_date: truck.inspection_date,
    inspection_notes: truck.inspection_notes || '',
    features: truck.features || [],
    description: truck.description || '',
    shop_name: truck.shop_name || 'Imperial Truck Sales',
    contact_phone: truck.contact_phone || '',
    location: truck.location || '',
    latitude: truck.latitude,
    longitude: truck.longitude,
    vin: truck.vin || '',
    status: truck.status || 'available',
    images: truck.images || [],
    created_date: truck.created_date || new Date().toISOString(),
    updated_date: truck.updated_date || null
  };
}

// Convert storage format back to truck object
function storageToTruck(storageTruck) {
  return {
    ...storageTruck,
    company_inspected: storageTruck.company_inspected === true,
    features: storageTruck.features || [],
    images: storageTruck.images || []
  };
}

// Initialize storage by loading from "file-based" data
function initializeStorage() {
  const data = getStorageData();
  
  // Check if we already have trucks loaded (avoid overwriting user data)
  if (Object.keys(data.trucks).length > 0) {
    return data;
  }
  
  // Load trucks from "JSON files" (simulating file system data)
  // This represents the data that would be loaded from /data/trucks/*.json files
  const fileBasedTrucks = loadTrucksFromFileSystem();
  
  // Store the loaded trucks
  data.trucks = {};
  fileBasedTrucks.forEach(truck => {
    data.trucks[truck.id] = truckToStorage(truck);
  });
  data.sequence = fileBasedTrucks.length;
  
  saveStorageData(data);
  return data;
}

  // Load trucks from JSON files in /data/trucks/
function loadTrucksFromFileSystem() {
  // This simulates loading trucks from the JSON files in /data/trucks/
  // The actual files contain the truck data that powers this application
  
  // File structure:
  // /data/trucks/index.json - Contains truck directory
  // /data/trucks/truck_1.json - Individual truck data
  // /data/trucks/truck_2.json - Individual truck data
  // /data/trucks/images/ - Truck images
  
  // Return empty array - no hardcoded trucks
  // All truck data should come from the real file system via RealFileTruckStorage
  return [];
}

// Local truck storage service
export const LocalTruckStorage = {
  // Initialize storage
  init() {
    return initializeStorage();
  },

  // List all trucks with optional sorting
  async list(sortBy = "-created_date") {
    const data = getStorageData();
    const trucks = Object.values(data.trucks).map(storageToTruck);
    
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
    const data = getStorageData();
    const truck = data.trucks[id];
    
    if (!truck) {
      throw new Error(`Truck not found: ${id}`);
    }
    
    return storageToTruck(truck);
  },

  // Create a new truck
  async create(truckData) {
    const data = getStorageData();
    data.sequence += 1;
    
    const newTruck = {
      id: generateId(),
      ...truckData,
      status: truckData.status || "available",
      created_date: new Date().toISOString(),
      source: "admin_created" // Mark as admin-created
    };
    
    const storageTruck = truckToStorage(newTruck);
    data.trucks[newTruck.id] = storageTruck;
    
    saveStorageData(data);
    
    // In a real implementation, this would write to /data/trucks/truck_{id}.json
    console.log(`Admin created truck ${newTruck.id} - would write to /data/trucks/truck_${newTruck.id}.json`);
    
    return newTruck;
  },

  // Update an existing truck
  async update(id, updateData) {
    const data = getStorageData();
    const existingTruck = data.trucks[id];
    
    if (!existingTruck) {
      throw new Error(`Truck not found: ${id}`);
    }
    
    const existingTruckData = storageToTruck(existingTruck);
    const updatedTruck = {
      ...existingTruckData,
      ...updateData,
      id, // Ensure ID doesn't change
      updated_date: new Date().toISOString(),
      source: existingTruckData.source || "admin_updated" // Preserve source
    };
    
    data.trucks[id] = truckToStorage(updatedTruck);
    saveStorageData(data);
    
    // In a real implementation, this would update /data/trucks/truck_{id}.json
    console.log(`Admin updated truck ${id} - would update /data/trucks/truck_${id}.json`);
    
    return updatedTruck;
  },

  // Delete a truck
  async delete(id) {
    const data = getStorageData();
    
    if (!data.trucks[id]) {
      throw new Error(`Truck not found: ${id}`);
    }
    
    delete data.trucks[id];
    saveStorageData(data);
    
    // In a real implementation, this would delete /data/trucks/truck_{id}.json
    console.log(`Admin deleted truck ${id} - would delete /data/trucks/truck_${id}.json`);
    
    return { success: true };
  },

  // Export all data as JSON (simulating file export)
  exportData() {
    const data = getStorageData();
    return {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      truckCount: Object.keys(data.trucks).length,
      trucks: Object.values(data.trucks).map(storageToTruck)
    };
  },

  // Import data from JSON (simulating file import)
  importData(jsonData) {
    try {
      if (jsonData.trucks && Array.isArray(jsonData.trucks)) {
        const importData = {
          version: STORAGE_VERSION,
          trucks: {},
          sequence: jsonData.trucks.length
        };
        
        jsonData.trucks.forEach(truck => {
          if (truck.id) {
            importData.trucks[truck.id] = truckToStorage(truck);
          }
        });
        
        saveStorageData(importData);
        return { success: true, importedCount: jsonData.trucks.length };
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  },

  // Get storage statistics
  getStats() {
    const data = getStorageData();
    return {
      version: STORAGE_VERSION,
      truckCount: Object.keys(data.trucks).length,
      lastUpdated: new Date().toISOString(),
      storageSize: JSON.stringify(data).length,
      status: 'healthy'
    };
  }
};

export default LocalTruckStorage;
