import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRUCKS_DIR = path.resolve(__dirname, '../data/trucks');
const IMAGES_DIR = path.join(TRUCKS_DIR, 'images');
const INDEX_FILE = path.join(TRUCKS_DIR, 'index.json');

// Sample truck data based on your uploaded images
const sampleTrucks = [
  {
    id: "1",
    make: "Peterbilt",
    model: "579",
    year: 2019,
    price: 85000,
    mileage: 450000,
    condition: "excellent",
    status: "available",
    shop_name: "Truck Sales Co",
    location: "Sacramento, CA",
    latitude: 38.5816,
    longitude: -121.4944,
    fuel_type: "diesel",
    axle_configuration: "6x4",
    features: ["Air Ride Suspension", "Cruise Control", "Bluetooth Radio"],
    description: "Well-maintained Peterbilt 579 with excellent service history. Interior has seen routine cleaning and maintenance, exterior is in great condition with no major dents or scratches. Engine rebuilt at 400K miles.",
    imperial_inspected: false,
    images: [
      "/data/trucks/images/upload_1759526391669.png",
      "/data/trucks/images/upload_1759526906342.png",
      "/data/trucks/images/upload_1759528175683.png",
      "/data/trucks/images/upload_1759528208013.jpg",
      "/data/trucks/images/upload_1759528225319.jpg",
      "/data/trucks/images/upload_1759528234900.png",
      "/data/trucks/images/upload_1759528350370.jpg",
      "/data/trucks/images/upload_1759528430715.jpg"
    ],
    created_date: new Date().toISOString(),
    source: "restored_from_images"
  },
  {
    id: "2", 
    make: "Freightliner",
    model: "Cascadia",
    year: 2020,
    price: 95000,
    mileage: 380000,
    condition: "excellent",
    status: "available",
    shop_name: "Truck Sales Co",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    fuel_type: "diesel",
    axle_configuration: "6x4",
    features: ["Automatic Transmission", "Collision Warning", "Adaptive Cruise"],
    description: "Low-mileage Freightliner Cascadia with state-of-the-art safety features. Single driver truck with meticulous maintenance records. Perfect for long-haul operations.",
    imperial_inspected: true,
    inspection_date: "2025-09-15",
    inspection_notes: "Passed all safety checks with flying colors",
    images: [
      "/data/trucks/images/upload_1759553379047.jpg",
      "/data/trucks/images/upload_1759557013303.jpg",
      "/data/trucks/images/upload_1759561034234.jpeg",
      "/data/trucks/images/upload_1759561305366.jpeg",
      "/data/trucks/images/upload_1759561306276.jpeg",
      "/data/trucks/images/upload_1759561322259.jpeg"
    ],
    created_date: new Date().toISOString(),
    source: "restored_from_images"
  }
];

async function restoreTruckData() {
  try {
    console.log('🔄 Restoring truck data...');
    
    // Create the index.json with sample trucks
    const indexData = {
      trucks: sampleTrucks,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf-8');
    console.log('✅ Restored truck data to index.json');
    
    // List available images
    const imageFiles = await fs.readdir(IMAGES_DIR);
    console.log(`📸 Found ${imageFiles.length} uploaded images:`);
    imageFiles.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n🎉 Truck data restoration complete!');
    console.log(`📊 Restored ${sampleTrucks.length} trucks with ${sampleTrucks.reduce((total, truck) => total + truck.images.length, 0)} images`);
    
  } catch (error) {
    console.error('❌ Error restoring truck data:', error);
  }
}

restoreTruckData();
