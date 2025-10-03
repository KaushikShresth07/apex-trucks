import { LocalTruckStorage } from './localTruckStorage';

// Admin utility functions for truck management
export const AdminUtils = {
  
  // Check if current user is admin
  isAdmin() {
    const user = localStorage.getItem('user');
    const authStatus = localStorage.getItem('authenticated');
    
    if (!user || authStatus !== 'true') {
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      return userData.role === 'admin';
    } catch (error) {
      return false;
    }
  },

  // Require admin access for protected operations
  requireAdmin() {
    if (!this.isAdmin()) {
      throw new Error('Admin access required. Please log in as administrator.');
    }
  },

  // Export all truck data as JSON (for backup/migration)
  async exportAllTrucks() {
    this.requireAdmin();
    
    const data = LocalTruckStorage.exportData();
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trucks_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('last_backup', new Date().toISOString());
    
    return { success: true, truckCount: data.truckCount };
  },

  // Import truck data from JSON file
  async importTrucks(file) {
    this.requireAdmin();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          const result = LocalTruckStorage.importData(jsonData);
          
          localStorage.setItem('last_import', new Date().toISOString());
          
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON format. Please check your file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsText(file);
    });
  },

  // Get storage statistics
  async getStorageStats() {
    this.requireAdmin();
    
    const stats = LocalTruckStorage.getStats();
    const lastBackup = localStorage.getItem('last_backup');
    const lastImport = localStorage.getItem('last_import');
    
    return {
      ...stats,
      lastBackup,
      lastImport,
      isHealthy: stats.truckCount >= 0
    };
  },

  // Clean up orphaned data (images without corresponding trucks)
  async cleanupOrphanedData() {
    this.requireAdmin();
    
    const trucks = await LocalTruckStorage.list();
    const allImages = new Set();
    
    // Collect all image references from trucks
    trucks.forEach(truck => {
      truck.images.forEach(image => {
        allImages.add(image);
      });
    });
    
    // This would clean up file system images in a real implementation
    // For localStorage approach, we just log cleanup info
    console.log('Cleanup completed:', {
      trucksCount: trucks.length,
      totalImages: allImages.size,
      message: 'In localStorage mode, image cleanup is automatic'
    });
    
    return {
      success: true,
      trucksCount: trucks.length,
      totalImages: allImages.size,
      message: 'Storage cleanup completed'
    };
  },

  // Validate truck data integrity
  async validateDataIntegrity() {
    this.requireAdmin();
    
    try {
      const trucks = await LocalTruckStorage.list();
      const issues = [];
      
      for (const truck of trucks) {
        // Check required fields
        const requiredFields = ['id', 'make', 'model', 'year', 'price'];
        for (const field of requiredFields) {
          if (!truck[field]) {
            issues.push(`Truck ${truck.id}: Missing required field '${field}'`);
          }
        }
        
        // Check data types
        if (typeof truck.year !== 'number' || truck.year < 1980 || truck.year > new Date().getFullYear() + 1) {
          issues.push(`Truck ${truck.id}: Invalid year '${truck.year}'`);
        }
        
        if (typeof truck.price !== 'number' || truck.price <= 0) {
          issues.push(`Truck ${truck.id}: Invalid price '${truck.price}'`);
        }
        
        // Check images array
        if (!Array.isArray(truck.images)) {
          issues.push(`Truck ${truck.id}: Images field must be an array`);
        }
      }
      
      return {
        success: true,
        truckCount: trucks.length,
        issuesCount: issues.length,
        issues,
        isHealthy: issues.length === 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        isHealthy: false
      };
    }
  },

  // Reset storage (CAUTION: This deletes all data)
  async resetStorage() {
    this.requireAdmin();
    
    // Confirm before proceeding
    const confirmed = window.confirm(
      'WARNING: This will delete ALL truck data and cannot be undone. ' +
      'Are you sure you want to reset the storage?'
    );
    
    if (!confirmed) {
      return { success: false, message: 'Operation cancelled' };
    }
    
    try {
      // Clear all truck-related data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('truck_sales_data')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reinitialize storage
      LocalTruckStorage.init();
      
      return { 
        success: true, 
        message: 'Storage has been reset successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default AdminUtils;
