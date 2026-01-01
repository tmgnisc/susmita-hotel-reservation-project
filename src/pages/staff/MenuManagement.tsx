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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Camera,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function MenuManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "main",
    image: "",
    available: true,
    preparationTime: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFoodItems();
      setItems(response.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setIsEditing(true);
      setEditingId(item.id);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        category: item.category || "main",
        image: item.image || "",
        available: item.available !== false,
        preparationTime: item.preparation_time?.toString() || item.preparationTime?.toString() || "",
      });
      setImagePreview(item.image || null);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "main",
        image: "",
        available: true,
        preparationTime: "",
      });
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setImagePreview(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "main",
      image: "",
      available: true,
      preparationTime: "",
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
      setFormData({ ...formData, image: result.url });
      setImagePreview(result.url);
      toast({
        title: "Image uploaded!",
        description: "Menu item image uploaded successfully",
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

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingId) {
      try {
        await api.updateFoodItem(editingId, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          available: formData.available,
          preparationTime: parseInt(formData.preparationTime) || 0,
        });
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
        handleCloseDialog();
        loadItems();
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
        await api.createFoodItem({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          available: formData.available,
          preparationTime: parseInt(formData.preparationTime) || 0,
        });
        toast({
          title: "Success",
          description: "Menu item created successfully",
        });
        handleCloseDialog();
        loadItems();
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
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      await api.deleteFoodItem(id);
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      loadItems();
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

  const filteredItems = filterCategory === "all" 
    ? items 
    : items.filter(item => item.category === filterCategory);

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Menu Management
            </h1>
            <p className="text-muted-foreground">
              Manage food items and menu offerings
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Label>Filter by Category:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="appetizer">Appetizer</SelectItem>
              <SelectItem value="main">Main Course</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
            </SelectContent>
          </Select>
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
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No menu items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                              <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>{item.preparation_time || item.preparationTime || 0} min</TableCell>
                      <TableCell>
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update menu item information"
                  : "Create a new menu item with details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="main">Main Course</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
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
                  <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="available">Available</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle item availability
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="item-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : imagePreview ? (
                        "Change Image"
                      ) : (
                        "Upload Image"
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update" : "Create"} Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}



