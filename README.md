# Truck Sales App

A modern React application for browsing and managing truck sales listings with a filesystem-based data storage system.

## Features

- Browse available trucks with filtering and search
- Admin dashboard for managing truck listings
- Responsive design with modern UI components
- Local authentication system
- **Filesystem-based data storage** - All truck data persists locally
- **Admin-only management** - Only administrators can create/edit/delete listings
- **Data backup and import/export** functionality
- **Data integrity validation** tools
- Truck mapping with location data

## Data Storage

### Filesystem Approach
This application uses localStorage to simulate filesystem storage for truck data. All truck listings are stored persistently and can be managed through the admin interface.

### Data Structure
- **Trucks**: Stored as JSON objects with complete truck specifications
- **Images**: Placeholder images (in production, these would be actual truck photos)
- **Admin Operations**: Data export, import, validation, and cleanup utilities

### Admin Features
- **Create/Edit/Delete**: Full CRUD operations for truck listings
- **Data Export**: Download all truck data as JSON backup files
- **Data Import**: Upload JSON files to restore truck data
- **Data Validation**: Check data integrity and validate truck information
- **Storage Statistics**: Monitor storage usage and health

## Running the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is occupied).

## Building the App

```bash
npm run build
```

## Demo Credentials

**⚠️ WARNING: These credentials are for demo purposes only. Do NOT use in production!**

- **Username**: `admin`
- **Password**: `Password@123`

## Admin Access

Only users with admin credentials can:

1. **Create new truck listings** via the Add Truck page (`/AddTruck`)
2. **Edit existing trucks** via the Admin Dashboard (`/AdminDashboard`)
3. **Delete truck listings** from the admin interface
4. **Manage data** through export/import/validation tools
5. **View storage statistics** and data health metrics

### Admin Dashboard Features

- **Truck Management**: View, edit, and delete all truck listings
- **Data Export**: Download complete truck database as JSON file
- **Data Import**: Upload JSON files to restore/merge truck data  
- **Data Validation**: Check for data integrity issues
- **Storage Monitor**: View storage statistics and health status

## Development Notes

This application uses:

- **React 18** with Vite for modern development
- **Tailwind CSS** for styling
- **Shadcn/ui** component library for UI components
- **React Router** for navigation
- **localStorage** for persistent data storage
- **Jest** for testing

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Data Migration

The application includes migration tools to convert from hard-coded data to filesystem storage:

```bash
# Run data migration (extracts hard-coded data to localStorage)
node scripts/migrate-truck-data.js
```

## File Structure

```
src/
├── api/
│   ├── entities.js          # Main API layer
│   ├── localTruckStorage.js # Filesystem storage implementation
│   ├── adminUtils.js        # Admin management utilities
│   └── integrations.js      # Mock integrations
├── components/
│   └── ui/                  # UI component library
├── pages/
│   ├── TruckGallery.jsx     # Browse trucks
│   ├── AddTruck.jsx         # Create/edit trucks (admin only)
│   ├── AdminDashboard.jsx   # Admin management interface
│   └── Login.jsx           # Authentication
└── __tests__/
    └── api.test.js         # Test suite
```

## Production Considerations

### Security
- Replace hard-coded admin credentials with proper authentication
- Implement HTTPS for secure data transmission
- Add input validation and sanitization
- Implement rate limiting for admin operations

### Data Storage
- For production deployment, consider:
  - Real database integration (PostgreSQL, MongoDB, etc.)
  - File storage service (AWS S3, Azure Blob, etc.)
  - Backup and disaster recovery procedures
  - Data encryption for sensitive information

### Scalability
- Implement proper caching strategies
- Add pagination for large truck datasets
- Consider CDN for image delivery
- Database connection pooling

## Admin Data Management

### Exporting Data
1. Log in as admin
2. Navigate to Admin Dashboard
3. Click "Export All Trucks" button
4. JSON file downloads automatically with timestamp

### Importing Data
1. Prepare JSON file in correct format
2. Click "Import Trucks" button in Admin Dashboard
3. Select JSON file from file picker
4. Data imports and merges with existing trucks

### Data Validation
1. Click "Validate Data" button
2. System checks all truck records for:
   - Required field completeness
   - Data type validation
   - Business rule compliance
   - Image file references

### Backup Strategy
- Regularly export truck data using Admin Dashboard
- Store backups in multiple locations
- Test backup restoration process
- Document data migration procedures

## License

This project is for demonstration purposes. Please ensure proper licensing for production use.