// Mock data for trucks
const mockTrucks = [
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
    images: ["https://via.placeholder.com/800x600?text=Peterbilt+579"],
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
    inspection_date: "2024-01-15T00:00:00Z",
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
    images: ["https://via.placeholder.com/800x600?text=Freightliner+Cascadia"],
    created_date: new Date().toISOString()
  }
];

// Mock user data
const mockUser = {
  id: "admin",
  full_name: "Administrator",
  email: "admin@trucksales.com",
  role: "admin"
};

// Mock authentication state
let currentUser = null;
let isAuthenticated = false;

// Mock Truck entity
export const Truck = {
  async list(orderBy = "-created_date") {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sort trucks based on orderBy
    const sortedTrucks = [...mockTrucks];
    if (orderBy.startsWith('-')) {
      const field = orderBy.slice(1);
      sortedTrucks.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }
    
    return sortedTrucks;
  },

  async filter(criteria, orderBy = "-created_date") {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredTrucks = mockTrucks.filter(truck => {
      return Object.entries(criteria).every(([key, value]) => {
        if (value === "all" || value === null || value === undefined) return true;
        return truck[key] === value;
      });
    });

    // Sort trucks based on orderBy
    if (orderBy.startsWith('-')) {
      const field = orderBy.slice(1);
      filteredTrucks.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }
    
    return filteredTrucks;
  },

  async get(id) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const truck = mockTrucks.find(t => t.id === id);
    if (!truck) {
      throw new Error("Truck not found");
    }
    return truck;
  },

  async create(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTruck = {
      id: Date.now().toString(),
      ...data,
      status: data.status || "available",
      created_date: new Date().toISOString()
    };
    
    mockTrucks.push(newTruck);
    return newTruck;
  },

  async update(id, data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockTrucks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Truck not found");
    }
    
    mockTrucks[index] = { ...mockTrucks[index], ...data };
    return mockTrucks[index];
  },

  async delete(id) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockTrucks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Truck not found");
    }
    
    mockTrucks.splice(index, 1);
    return { success: true };
  }
};

// Mock User authentication
export const User = {
  async me() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!isAuthenticated || !currentUser) {
      throw new Error("Not authenticated");
    }
    return currentUser;
  },

  async login(username, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check hard-coded credentials
    if (username === "admin" && password === "Password@123") {
      currentUser = { ...mockUser };
      isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(currentUser));
      localStorage.setItem("authenticated", "true");
      return currentUser;
    } else {
      throw new Error("Invalid credentials");
    }
  },

  async logout() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem("user");
    localStorage.removeItem("authenticated");
  },

  // Initialize user from localStorage on app start
  initAuth() {
    const savedUser = localStorage.getItem("user");
    const authStatus = localStorage.getItem("authenticated");
    
    if (savedUser && authStatus === "true") {
      currentUser = JSON.parse(savedUser);
      isAuthenticated = true;
    }
  },

  async loginWithRedirect(redirectUrl) {
    // This method is kept for compatibility but redirects to login page
    window.location.href = "/login";
  }
};