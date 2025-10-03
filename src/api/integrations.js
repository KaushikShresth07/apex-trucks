// Mock integrations for core functionality

// Mock file upload functionality
export const UploadFile = async ({ file }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock URL (in real app, this would upload to cloud storage)
  const mockUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(file.name)}`;
  
  return {
    file_url: mockUrl,
    file_name: file.name,
    file_size: file.size,
    upload_date: new Date().toISOString()
 h2
};

// Mock LLM functionality for geocoding
export const InvokeLLM = async ({ prompt, add_context_from_internet = false, response_json_schema }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock geocoding responses for common locations
  const mockGeocodingResponses = {
    "Sacramento, CA": { latitude: 38.5816, longitude: -121.4944 },
    "Fresno, CA": { latitude: 36.7378, longitude: -119.7871 },
    "Los Angeles, CA": { latitude: 34.0522, longitude: -118.2437 },
    "San Francisco, CA": { latitude: 37.7749, longitude: -122.4194 },
    "San Diego, CA": { latitude: 32.7157, longitude: -117.1611 },
    "Oakland, CA": { latitude: 37.8044, longitude: -122.2712 }
  };
  
  // Extract location from prompt
  const locationMatch = prompt.match(/^[^(]*\(([^)]+)\)/);
  const location = locationMatch ? locationMatch[1].replace(/"/g, '') : "";
  
  // Return mock coordinates if we have them, otherwise random coordinates in California
  if (mockGeocodingResponses[location]) {
    return mockGeocodingResponses[location];
  }
  
  // Return random coordinates in California area
  return {
    latitude: 36.7783 + (Math.random() - 0.5) * 4,
    longitude: -119.4179 + (Math.random() - 0.5) * 6
  };
};

// Mock email functionality
export const SendEmail = async ({ to, subject, body }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log("Mock email sent:", { to, subject, body });
  
  return {
    message_id: Date.now().toString(),
    status: "sent",
    sent_date: new Date().toISOString()
  };
};

// Mock image generation
export const GenerateImage = async ({ prompt }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    image_url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(prompt)}`,
    prompt: prompt,
    generated_date: new Date().toISOString()
  };
};

// Mock data extraction
export const ExtractDataFromUploadedFile = async ({ file_url, extraction_type }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    extracted_data: {
      vin: "1FTFW1CT5DFC12345",
      make: "Peterbilt",
      model: "579",
      year: 2019,
      mileage: 450000
    },
    confidence: 0.95,
    extracted_date: new Date().toISOString()
  };
};

// Mock signed URL creation
export const CreateFileSignedUrl = async ({ file_id, access_type = "read" }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    signed_url: `https://mock-storage.com/files/${file_id}?signature=mock_signature`,
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    access_type: access_type
  };
};

// Mock private file upload
export const UploadPrivateFile = async ({ file, access_level = "private" }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    file_url: `https://mock-private-storage.com/files/${Date.now()}`,
    file_id: Date.now().toString(),
    access_level: access_level,
    upload_date: new Date().toISOString()
  };
};

// Export all as Core namespace for compatibility
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile
};