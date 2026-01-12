import { useState, useEffect } from "react";
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
  UtensilsCrossed,
  Users,
  MapPin,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function AdminTables() {
  const { toast } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
    status: "available",
    description: "",
    location: "",
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTables();
      setTables(response.tables || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to load tables",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (table?: any) => {
    if (table) {
      setIsEditing(true);
      setEditingId(table.id);
      setFormData({
        tableNumber: table.table_number?.toString() || "",
        capacity: table.capacity?.toString() || "",
        status: table.status || "available",
        description: table.description || "",
        location: table.location || "",
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        tableNumber: "",
        capacity: "",
        status: "available",
        description: "",
        location: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tableData = {
        tableNumber: formData.tableNumber,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        description: formData.description,
        location: formData.location,
      };

      if (isEditing && editingId) {
        await api.updateTable(editingId, tableData);
        toast({
          title: "Success",
          description: "Table updated successfully",
        });
      } else {
        await api.createTable(tableData);
        toast({
          title: "Success",
          description: "Table created successfully",
        });
      }

      setIsDialogOpen(false);
      loadTables();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to save table",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      await api.deleteTable(id);
      toast({
        title: "Success",
        description: "Table deleted successfully",
      });
      loadTables();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete table",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: "bg-success/20 text-success border-0",
      occupied: "bg-warning/20 text-warning border-0",
      reserved: "bg-info/20 text-info border-0",
      maintenance: "bg-destructive/20 text-destructive border-0",
    };
    
    return (
      <Badge className={variants[status] || variants.available}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Tables Management</h1>
            <p className="text-muted-foreground">Manage your restaurant tables</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Tables</p>
            <p className="text-2xl font-bold text-foreground">{tables.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-success">{availableTables}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-warning">{occupiedTables}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Reserved</p>
            <p className="text-2xl font-bold text-info">{reservedTables}</p>
          </div>
        </div>

        {/* Tables Table */}
        <div className="bg-card rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table #</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tables found</p>
                    <Button variant="link" onClick={() => handleOpenDialog()}>
                      Add your first table
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <span className="font-semibold text-accent">
                            {table.table_number}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{table.capacity} guests</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {table.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{table.location}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(table.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {table.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(table)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(table.id)}
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
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Table" : "Add New Table"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the table information below"
                  : "Fill in the details to add a new table"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={formData.tableNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, tableNumber: e.target.value })
                    }
                    placeholder="e.g., 1, A1, VIP-1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="Number of guests"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Window side, Patio, Indoor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Additional details about the table"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Update Table"
                  ) : (
                    "Add Table"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

