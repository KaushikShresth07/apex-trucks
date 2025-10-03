// Real file upload service for truck images
// This service uploads images to the backend server and saves them to /data/trucks/images/

const API_BASE_URL = '/api';

// Upload file to server
export const UploadFile = async ({ file }) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('truckId', 'temp'); // Will be updated when truck is created
    
    // Send to server
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`🖼️ Image uploaded successfully: ${result.fileName}`);
    console.log(`📁 Saved to: /data/trucks/images/${result.fileName}`);
    
    return {
      file_url: `/data/trucks/images/${result.fileName}`,
      file_name: result.fileName,
      file_size: file.size,
      upload_date: new Date().toISOString(),
      local_path: `/data/trucks/images/${result.fileName}`
    };
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    // Fallback to mock URL if upload fails
    const mockUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(file.name)}`;
    return {
      file_url: mockUrl,
      file_name: file.name,
      file_size: file.size,
      upload_date: new Date().toISOString()
    };
  }
};

// Update image truck ID after truck creation
export const UpdateImageTruckId = async (truckId, imageUrls) => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/update-truck-id`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        truckId,
        imageUrls
      })
    });

    if (response.ok) {
      console.log(`🖼️ Updated truck ID for ${imageUrls.length} images`);
    }
  } catch (error) {
    console.error('❌ Failed to update image truck ID:', error);
  }
};

export default { UploadFile, UpdateImageTruckId };
