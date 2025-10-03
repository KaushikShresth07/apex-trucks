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
    shop_name: truck.shop_name || 'Truck Sales Co',
    contact_phone: truck.contact_phone || '',
    contact_email: truck.contact_email || '',
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

// Load initial truck data from JSON files (migrated data)
function loadInitialData() {
  const data = getStorageData();
  
  // Check if we already have data loaded
  if (Object.keys(data.trucks).length > 0) {
    return data;
  }
  
  // Load initial truck data (the migrated data from our JSON files)
  const initialTrucks = [
    {
      id: "1",
      make: "Peterbilt",
      model: "579",
      year: 2019,
      price: 85000,
      mileage: 450000,
      condition: "excellent",
      fuel_type: "diesel",
      transmission: "manual",
      engine: "Cummins X15",
      horsepower: 450,
      torque: 1650,
      axle_configuration: "6x4",
      cab_type: "sleeper_cab",
      sleeper_size: "72 inch",
      wheelbase: 244,
      gvwr: 80000,
      exterior_color: "Bright Red",
      interior_color: "Gray",
      company_inspected: false,
      inspection_date: null,
      inspection_notes: "",
      features: ["APU", "Custom Exhaust", "Navigation System"],
      description: "Well-maintained Peterbilt 579 with excellent fuel economy and comfortable sleeper.",
      shop_name: "Truck Sales Co",
      contact_phone: "(555) 123-4567",
      contact_email: "sales@trucksales.com",
      location: "Sacramento, CA",
      latitude: 38.5816,
      longitude: -121.4944,
      vin: "1FTFW1CT5DFC12345",
      status: "available",
      images: ["/data/trucks/images/truck_1_0.jpg"],
      created_date: new Date().toISOString()
    },
    {
      id: "2",
      make: "Freightliner",
      model: "Cascadia",
      year: 2020,
      price: 95000,
      mileage: 380000,
      condition: "excellent",
      fuel_type: "diesel",
      transmission: "automatic",
      engine: "Detroit DD16",
      horsepower: 500,
      torque: 1850,
      axle_configuration: "6x4",
      cab_type: "sleeper_cab",
      sleeper_size: "63 inch",
      wheelbase: 252,
      gvwr: 80000,
      exterior_color: "Arctic White",
      interior_color: "Black",
      company_inspected: true,
      inspection_date: "2024:01-15T00:00:00Z",
      inspection_notes: "Recently inspected and approved. All systems working perfectly.",
      features: ["LED Headlights", "Bluetooth", "Cruise Control"],
      description: "Low mileage Freightliner Cascadia with automatic transmission for easier driving.",
      shop_name: "Truck Sales Co",
      contact_phone: "(555) 123-4567",
      contact_email: "sales@trucksales.com",
      location: "Fresno, CA",
      latitude: 36.7378,
      longitude: -119.7871,
      vin: "1FTFW1ET5DFC67890",
      status: "available",
      images: ["/data/trucks/images/truck_2_0.jpg"],
      created_date: new Date().toISOString()
    }
  ];
  
  // Store initial data
  data.trucks = {};
  initialTrucks.forEach(truck => {
    data.trucks[truck.id] = truckToStorage(truck);
  });
  data.sequence = 2;
  
  saveStorageData(data);
  return data;
}

// Local truck storage service
export const LocalTruckStorage = {
  // Initialize storage
  init() {
    return loadInitialData();
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
      created_date: new Date().toISOString()
    };
    
    const storageTruck = truckToStorage(newTruck);
    data.trucks[newTruck.id] = storageTruck;
    
    saveStorageData(data);
    return newTruck;
  },

  // Update an existing truck
  async update(id, updateData) {
    const data = getStorageData();
    const existingTruck = data.trucks[id];
    
    if (!existingTruck) {
      throw new Error(`Truck not found: ${id}`);
    }
    
    const updatedTruck = {
      ...storageToTruck(existingTruck),
      ...updateData,
      id, // Ensure ID doesn't change
      updated_date: new Date().toISOString()
    };
    
    data.trucks[id] = truckToStorage(updatedTruck);
    saveStorageData(data);
    
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
