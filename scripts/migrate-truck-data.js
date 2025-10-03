import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract truck data from the entities.js file
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

async function migrateTruckData() {
  console.log('Starting truck data migration...');
  
  // Create data directory structure
  const dataDir = path.join(__dirname, '..', 'data', 'trucks');
  const imagesDir = path.join(dataDir, 'images');
  
  // Ensure directories exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Migrate each truck
  for (const truck of mockTrucks) {
    console.log(`Migrating truck ${truck.id}: ${truck.year} ${truck.make} ${truck.model}`);
    
    // Modify image paths to reference local files instead of placeholder URLs
    const modifiedTruck = {
      ...truck,
      images: truck.images.map((imageUrl, index) => {
        // Extract filename from placeholder URL or create local filename
        const localImageName = `truck_${truck.id}_${index}.jpg`;
        return `/data/trucks/images/${localImageName}`;
      })
    };
    
    // Create corresponding image files (convert placeholders to actual images)
    for (const [index, originalUrl] of truck.images.entries()) {
      const filename = `truck_${truck.id}_${index}.jpg`;
      const imagePath = path.join(imagesDir, filename);
      
      // For now, copy the placeholder URL (in real implementation, these would be actual images)
      const imageData = Buffer.from(originalUrl); // Placeholder data
      fs.writeFileSync(imagePath, imageData);
      
      console.log(`Created image: ${filename}`);
    }
    
    // Save truck data to JSON file
    const truckJsonPath = path.join(dataDir, `truck_${truck.id}.json`);
    fs.writeFileSync(truckJsonPath, JSON.stringify(modifiedTruck, null, 2));
    
    console.log(`Saved truck data: truck_${truck.id}.json`);
  }
  
  // Create an index file for quick lookup
  const indexData = {
    trucks: mockTrucks.map(truck => ({
      id: truck.id,
      make: truck.make,
      model: truck.model,
      year: truck.year,
      price: truck.price,
      mileage: truck.mileage,
      condition: truck.condition,
      created_date: truck.created_date
    })),
    lastUpdated: new Date().toISOString()
  };
  
  const indexPath = path.join(dataDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  
  console.log('Truck data migration completed!');
  console.log(`Files created:`);
  console.log(`- ${dataDir}/index.json`);
  mockTrucks.forEach(trek => {
    console.log(`- ${dataDir}/truck_${trek.id}.json`);
    console.log(`- ${imagesDir}/truck_${trek.id}_0.jpg`);
  });
}

migrateTruckData().catch(console.error);
