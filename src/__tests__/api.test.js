// Mock API tests
import { User, Truck } from '../api/entities';

describe('Mock API Tests', () => {
  describe('User Authentication', () => {
    beforeEach(() => {
      // Clear localStorage for each test
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
      User.initAuth();
    });

    test('should authenticate with correct credentials', async () => {
      const user = await User.login('admin', 'Password@123');
      
      expect(user).toEqual({
        id: 'admin',
        full_name: 'Administrator',
        email: 'admin@trucksales.com',
        role: 'admin'
      });
      
      expect(localStorage.getItem('authenticated')).toBe('true');
    });

    test('should reject incorrect credentials', async () => {
      await expect(User.login('wrong', 'password')).rejects.toThrow('Invalid credentials');
      await expect(User.login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
      await expect(User.login('', '')).rejects.toThrow('Invalid credentials');
    });

    test('should logout correctly', async () => {
      // Login first
      await User.login('admin', 'Password@123');
      expect(localStorage.getItem('authenticated')).toBe('true');
      
      // Logout
      await User.logout();
      expect(localStorage.getItem('authenticated')).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
    });

    test('should throw error when accessing me() without authentication', async () => {
      await expect(User.me()).rejects.toThrow('Not authenticated');
    });

    test('should return user when accessing me() with authentication', async () => {
      await User.login('admin', 'Password@123');
      const user = await User.me();
      
      expect(user.role).toBe('admin');
      expect(user.full_name).toBe('Administrator');
    });

    test('should initialize auth from localStorage', () => {
      const mockUser = {
        id: 'admin',
        full_name: 'Administrator',
        role: 'admin'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authenticated', 'true');
      
      User.initAuth();
      
      // The user should be authenticated now
      expect(User.me()).resolves.toEqual(mockUser);
    });
  });

  describe('Truck API', () => {
    test('should list all trucks', async () => {
      const trucks = await Truck.list();
      
      expect(Array.isArray(trucks)).toBe(true);
      expect(trucks.length).toBeGreaterThan(0);
      expect(trucks[0]).toHaveProperty('id');
      expect(trucks[0]).toHaveProperty('make');
      expect(trucks[0]).toHaveProperty('model');
    });

    test('should filter trucks correctly', async () => {
      const availableTrucks = await Truck.filter({ status: 'available' });
      
      expect(Array.isArray(availableTrucks)).toBe(true);
      availableTrucks.forEach(truck => {
        expect(truck.status).toBe('available');
      });
    });

    test('should get specific truck by ID', async () => {
      const trucks = await Truck.list();
      const firstTruck = trucks[0];
      
      const truck = await Truck.get(firstTruck.id);
      
      expect(truck).toEqual(firstTruck);
    });

    test('should create new truck', async () => {
      const newTruckData = {
        make: 'Test',
        model: 'Test Model',
        year: 2023,
        price: 50000,
        mileage: 100000,
        condition: 'good',
        fuel_type: 'diesel',
        shop_name: 'Truck Sales Co',
        status: 'available'
      };
      
      const createdTruck = await Truck.create(newTruckData);
      
      expect(createdTruck).toMatchObject(newTruckData);
      expect(createdTruck).toHaveProperty('id');
      expect(createdTruck).toHaveProperty('created_date');
    });

    test('should update existing truck', async () => {
      const trucks = await Truck.list();
      const firstTruck = trucks[0];
      
      const updateData = {
        price: 60000,
        status: 'pending'
      };
      
      const updatedTruck = await Truck.update(firstTruck.id, updateData);
      
      expect(updatedTruck.price).toBe(60000);
      expect(updatedTruck.status).toBe('pending');
      expect(updatedTruck.id).toBe(firstTruck.id);
    });

    test('should delete truck', async () => {
      const trucks = await Truck.list();
      const truckCount = trucks.length;
      
      const result = await Truck.delete(trucks[0].id);
      
      expect(result.success).toBe(true);
      
      // Verify truck was deleted
      expect(() => Truck.get(trucks[0].id)).rejects.toThrow('Truck not found');
    });

    test('should handle non-existent truck operations', async () => {
      await expect(Truck.get('non-existent-id')).rejects.toThrow('Truck not found');
      await expect(Truck.update('non-existent-id', { price: 50000 })).rejects.toThrow('Truck not found');
      await expect(Truck.delete('non-existent-id')).rejects.toThrow('Truck not found');
    });

    test('should sort trucks by created_date', async () => {
      const trucks = await Truck.list('-created_date');
      
      for (let i = 0; i < trucks.length - 1; i++) {
        const date1 = new Date(trucks[i].created_date);
        const date2 = new Date(trucks[i + 1].created_date);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });

  describe('Data Consistency', () => {
    test('should maintain consistent truck data', async () => {
      const trucks = await Truck.list();
      
      trucks.forEach(truck => {
        expect(truck).toHaveProperty('id');
        expect(truck).toHaveProperty('make');
        expect(truck).toHaveProperty('model');
        expect(truck).toHaveProperty('year');
        expect(truck).toHaveProperty('price');
        expect(truck).toHaveProperty('status');
        expect(truck).toHaveProperty('shop_name');
        expect(truck.shop_name).toBe('Truck Sales Co'); // Should be updated branding
      });
    });
  });
});
