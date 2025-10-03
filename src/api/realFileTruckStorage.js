// Real filesystem-based truck storage using HTTP API
// This service performs actual file operations on the /data/trucks/ folder

const API_BASE_URL = 'http://localhost:3001/api';

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Real filesystem truck storage service
export const RealFileTruckStorage = {
  // Initialize storage (no-op for API-based)
  init() {
    console.log('🔧 Initializing real filesystem-based truck storage...');
    return Promise.resolve();
  },

  // List all trucks by reading from JSON files
  async list(sortBy = "-created_date") {
    try {
      console.log('📁 Loading trucks from filesystem...');
      const trucks = await apiRequest(`/trucks?sortBy=${encodeURIComponent(sortBy)}`);
      console.log(`✅ Loaded ${trucks.length} trucks from /data/trucks/`);
      return trucks;
    } catch (error) {
      console.error('❌ Error loading trucks from filesystem:', error);
      // Fallback to empty array if server is not running
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

  // Get a single truck from JSON file
  async get(id) {
    try {
      console.log(`📄 Reading truck ${id} from filesystem...`);
      const truck = await apiRequest(`/trucks/${id}`);
      console.log(`✅ Loaded truck ${id} from /data/trucks/truck_${id}.json`);
      return truck;
    } catch (error) {
      console.error(`❌ Error loading truck ${id}:`, error.message);
      throw error;
    }
  },

  // Create a new truck (writes to JSON file)
  async create(truckData) {
    try {
      const newTruck = {
        id: generateId(),
        ...truckData,
        status: truckData.status || "available",
        created_date: new Date().toISOString(),
        source: "admin_created"
      };
      
      console.log(`💾 Creating truck ${newTruck.id} in filesystem...`);
      const createdTruck = await apiRequest('/trucks', {
        method: 'POST',
        body: JSON.stringify(newTruck)
      });
      
      console.log(`✅ CREATED: /data/trucks/truck_${newTruck.id}.json`);
      return createdTruck;
    } catch (error) {
      console.error('❌ Error creating truck:', error.message);
      throw error;
    }
  },

  // Update an existing truck (modifies JSON file)
  async update(id, updateData) {
    try {
      console.log(`📝 Updating truck ${id} in filesystem...`);
      const updatedTruck = await apiRequest(`/trucks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      console.log(`✅ UPDATED: /data/trucks/truck_${id}.json`);
      return updatedTruck;
    } catch (error) {
      console.error(`❌ Error updating truck ${id}:`, error.message);
      throw error;
    }
  },

  // Delete a truck (DELETES JSON FILE AND IMAGES)
  async delete(id) {
    try {
      console.log(`🗑️ DELETING truck ${id} from filesystem (REAL FILE DELETION)...`);
      const result = await apiRequest(`/trucks/${id}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ DELETED: /data/trucks/truck_${id}.json (FILE REMOVED)`);
      console.log(`✅ DELETED: Associated images in /data/trucks/images/`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error deleting truck ${id}:`, error.message);
      throw error;
    }
  },

  // Export all data as JSON
  async exportData() {
    const trucks = await this.list();
    return {
      version: "1.0",
      exportDate: new Date().toISOString(),
      truckCount: trucks.length,
      trucks: trucks
    };
  },

  // Import data from JSON
  async importData(jsonData) {
    if (jsonData.trucks && Array.isArray(jsonData.trucks)) {
      let successCount = 0;
      
      for (const truck of jsonData.trucks) {
        try {
          await this.create(truck);
          successCount++;
        } catch (error) {
          console.error(`Failed to import truck ${truck.id}:`, error.message);
        }
      }
      
      return { success: true, importedCount: successCount };
    } else {
      throw new Error('Invalid data format');
    }
  },

  // Get storage statistics
  async getStats() {
    try {
      const status = await apiRequest('/status');
      return {
        ...status,
        lastUpdated: new Date().toISOString(),
        storageType: 'real_filesystem',
        apiEndpoint: API_BASE_URL
      };
    } catch (error) {
      return {
        version: "1.0",
        truckCount: 0,
        lastUpdated: new Date().toISOString(),
        storageType: 'real_filesystem',
        apiEndpoint: API_BASE_URL,
        status: 'offline'
      };
    }
  }
};

export default RealFileTruckStorage;
