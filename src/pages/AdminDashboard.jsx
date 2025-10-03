
import React, { useState, useEffect } from "react";
import { Truck } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, ShieldCheck, Lock, Loader2, List, BarChart2 } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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
