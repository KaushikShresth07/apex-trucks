import { LocalTruckStorage } from './localTruckStorage';

// Initialize local storage
LocalTruckStorage.init();

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

// Truck entity using LocalTruckStorage (replaces hard-coded mock data)
export const Truck = LocalTruckStorage;

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