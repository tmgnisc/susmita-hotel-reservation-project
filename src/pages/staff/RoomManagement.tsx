import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Camera,
  X,
  Bed,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function RoomManagement() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "standard",
    price: "",
    capacity: "",
    status: "available",
    description: "",
    floor: "",
    roomNumber: "",
    amenities: [] as string[],
    images: [] as string[],
  });

  const [currentAmenity, setCurrentAmenity] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.getRooms();
      setRooms(response.rooms || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setIsEditing(true);
      setEditingId(room.id);
      setFormData({
        name: room.name || "",
        type: room.type || "standard",
        price: room.price?.toString() || "",
        capacity: room.capacity?.toString() || "",
        status: room.status || "available",
        description: room.description || "",
        floor: room.floor?.toString() || "",
        roomNumber: room.room_number || "",
        amenities: room.amenities || [],
        images: room.images || [],
      });
      setImagePreviews(room.images || []);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: "",
        type: "standard",
        price: "",
        capacity: "",
        status: "available",
        description: "",
        floor: "",
        roomNumber: "",
        amenities: [],
        images: [],
      });
      setImagePreviews([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setImagePreviews([]);
    setFormData({
      name: "",
      type: "standard",
      price: "",
      capacity: "",
      status: "available",
      description: "",
      floor: "",
      roomNumber: "",
      amenities: [],
      images: [],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await api.uploadImage(file);
      const newImages = [...formData.images, result.url];
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newImages);
      toast({
        title: "Image uploaded!",
        description: "Room image uploaded successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newImages);
  };

  const handleAddAmenity = () => {
    if (currentAmenity.trim() && !formData.amenities.includes(currentAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, currentAmenity.trim()],
      });
      setCurrentAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingId) {
      try {
        await api.updateRoom(editingId, {
          name: formData.name,
          type: formData.type,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity),
          status: formData.status,
          description: formData.description,
          floor: parseInt(formData.floor),
          roomNumber: formData.roomNumber,
          amenities: formData.amenities,
          images: formData.images,
        });
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
        handleCloseDialog();
        loadRooms();
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        await api.createRoom({
          name: formData.name,
          type: formData.type,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity),
          status: formData.status,
          description: formData.description,
          floor: parseInt(formData.floor),
          roomNumber: formData.roomNumber,
          amenities: formData.amenities,
          images: formData.images,
        });
        toast({
          title: "Success",
          description: "Room created successfully",
        });
        handleCloseDialog();
        loadRooms();
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await api.deleteRoom(id);
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      loadRooms();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Room Management
            </h1>
            <p className="text-muted-foreground">
              Manage hotel rooms and their availability
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <Bed className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">{room.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Room {room.room_number} - Floor {room.floor}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>${room.price}</TableCell>
                      <TableCell>{room.capacity} guests</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.status === "available"
                              ? "default"
                              : room.status === "booked"
                              ? "secondary"
                              : room.status === "occupied"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(room)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(room.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Room" : "Add New Room"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update room information"
                  : "Create a new room with all details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Room Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentAmenity}
                    onChange={(e) => setCurrentAmenity(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="Add amenity (e.g., WiFi, TV, Mini Bar)"
                  />
                  <Button type="button" onClick={handleAddAmenity}>
                    Add
                  </Button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.amenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveAmenity(amenity)}
                      >
                        {amenity} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Room Images</Label>
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Room image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="room-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update" : "Create"} Room
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}



