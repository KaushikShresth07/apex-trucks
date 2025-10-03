
import React, { useState, useEffect } from "react";
import { Truck } from "@/api/entities";
import { User } from "@/api/entities";
import { AdminUtils } from "@/api/adminUtils";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, ShieldCheck, Lock, Loader2, List, BarChart2, Download, Upload, RefreshCw, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [adminStats, setAdminStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl("TruckGallery"));
          return;
        }
        setCurrentUser(user);
        await fetchTrucks();
        await loadAdminStats();
      } catch (e) {
        navigate(createPageUrl("TruckGallery"));
      } finally {
        setIsLoading(false);
      }
    };
    checkUserAndFetchData();
  }, [navigate]);

  const fetchTrucks = async () => {
    const allTrucks = await Truck.list("-created_date");
    setTrucks(allTrucks);
  };

  const loadAdminStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await AdminUtils.getStorageStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleExportAll = async () => {
    try {
      await AdminUtils.exportAllTrucks();
      alert('Truck data exported successfully!');
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await AdminUtils.importTrucks(file);
      alert(`Import successful! ${result.importedCount || 'Unknown'} trucks imported.`);
      await fetchTrucks(); // Refresh the truck list
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
    // Reset the input
    event.target.value = '';
  };

  const handleValidateData = async () => {
    try {
      const result = await AdminUtils.validateDataIntegrity();
      if (result.issuesCount === 0) {
        alert(`Data validation passed! ${result.truckCount} trucks validated successfully.`);
      } else {
        alert(`Data validation found ${result.issuesCount} issues:\n${result.issues.join('\n')}`);
      }
    } catch (error) {
      alert(`Validation failed: ${error.message}`);
    }
  };

  const handleEditClick = (truck) => {
    setEditingTruck(truck);
    setEditFormData({
      price: truck.price || "",
      mileage: truck.mileage || "",
      status: truck.status || "available",
      condition: truck.condition || "good",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!editingTruck) return;
    try {
      await Truck.update(editingTruck.id, {
        price: parseFloat(editFormData.price),
        mileage: parseInt(editFormData.mileage),
        status: editFormData.status,
        condition: editFormData.condition,
      });
      setIsEditDialogOpen(false);
      setEditingTruck(null);
      await fetchTrucks(); // Refresh data
    } catch (error) {
      console.error("Failed to update truck:", error);
      alert("Update failed. Please check your inputs and try again.");
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

  const statusColors = {
    available: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  if (!currentUser) {
    // This is a fallback, useEffect should already have navigated away
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                <Lock className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-gray-600">You must be an administrator to view this page.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage all truck listings</p>
        </div>
        <div className="flex gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <p className="text-sm text-gray-500">Total Listings</p>
                <p className="text-2xl font-bold text-blue-600">{trucks.length}</p>
            </div>
             <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-600">{trucks.filter(t => t.status === 'available').length}</p>
            </div>
        </div>
      </div>

      {/* Admin Utilities Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Health</p>
                  <p className="text-lg font-semibold text-green-600">Healthy</p>
                </div>
                <BarChart2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last Backup</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {adminStats?.lastBackup ? new Date(adminStats.lastBackup).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Size</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {adminStats?.storageSize ? `${Math.round(adminStats.storageSize / 1024)} KB` : 'Loading...'}
                  </p>
                </div>
                <List className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Data Integrity</p>
                  <p className="text-sm font-semibold text-orange-600">Check</p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button onClick={handleExportAll} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export All Trucks
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
            id="import-file"
          />
          <Button onClick={() => document.getElementById('import-file').click()} 
                  className="bg-green-600 hover:bg-green-700">
            <Upload className="w-4 h-4 mr-2" />
            Import Trucks
          </Button>
          
          <Button onClick={handleValidateData} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate Data
          </Button>
          
          <Button onClick={loadAdminStats} variant="outline" disabled={isLoadingStats}>
            {isLoadingStats ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Stats
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Truck</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Inspected</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.map((truck) => (
              <TableRow key={truck.id}>
                <TableCell>
                  <img 
                    src={truck.images?.[0] || 'https://via.placeholder.com/150x100?text=No+Image'} 
                    alt={`${truck.year} ${truck.make} ${truck.model}`}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                </TableCell>
                <TableCell className="font-medium">{truck.year} {truck.make} {truck.model}</TableCell>
                <TableCell>{formatPrice(truck.price)}</TableCell>
                <TableCell>{truck.mileage?.toLocaleString()} mi</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[truck.status]} capitalize`}>{truck.status}</Badge>
                </TableCell>
                <TableCell className="capitalize">{truck.condition}</TableCell>
                <TableCell>
                  {truck.company_inspected && <ShieldCheck className="w-5 h-5 text-blue-600" />}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(truck)}>
                      <Edit className="w-3 h-3 mr-1" /> Quick Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl(`TruckDetails?id=${truck.id}&from=dashboard`))}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTruck && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Edit: {editingTruck.year} {editingTruck.make} {editingTruck.model}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" type="number" value={editFormData.price} onChange={(e) => handleEditFormChange('price', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mileage" className="text-right">Mileage</Label>
                <Input id="mileage" type="number" value={editFormData.mileage} onChange={(e) => handleEditFormChange('mileage', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => handleEditFormChange('status', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="condition" className="text-right">Condition</Label>
                 <Select value={editFormData.condition} onValueChange={(value) => handleEditFormChange('condition', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
