import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react"; // Import ArrowLeft and Trash2 icons
// import { supabase } from "@/integrations/supabase/client"; // Not used for now as data is local
// import { useAuth } from "@/hooks/useAuth"; // Not used for now
import { useToast } from "@/hooks/use-toast";

interface EditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logToEdit: any; // Type will be more specific based on actual log structure
  onLogUpdated: (updatedLog: any) => void;
}

const EditLogModal = ({ isOpen, onClose, logToEdit, onLogUpdated }: EditLogModalProps) => {
  const [formData, setFormData] = useState<any>({});
  const [selectedRats, setSelectedRats] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Hardcoded rats for now, similar to LogsPage
  const availableRats = ["Pepper", "Salt", "Sugar", "Spice"]; // Example, adjust as needed

  useEffect(() => {
    if (logToEdit) {
      // Pre-fill form data based on the log being edited
      setFormData({
        notes: logToEdit.notes || "",
        behavior: logToEdit.behavior || "",
        weight: logToEdit.weight || "",
        temperature: logToEdit.temperature || "",
        humidity: logToEdit.humidity || "",
        // Add other fields as necessary based on log structure
      });
      setSelectedRats(logToEdit.rats || []);
      setHashtags(logToEdit.hashtags || []);
    }
  }, [logToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string | string[]) => {
    if (field === "rats") {
      setSelectedRats(Array.isArray(value) ? value : [value]); // Assuming single rat selection for now, adjust if multi-select
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };
  
  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedLogData = {
      ...logToEdit,
      ...formData,
      rats: selectedRats,
      hashtags: hashtags,
      // Ensure timestamp is preserved or updated as needed
      timestamp: logToEdit.timestamp, // Or new Date().toISOString() if you want to update it
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onLogUpdated(updatedLogData);
    toast({
      title: "Success",
      description: "Log entry updated successfully!",
    });
    setLoading(false);
    onClose(); // Close modal after successful update
  };

  if (!logToEdit) return null;

  const renderSpecificFields = () => {
    switch (logToEdit.type) {
      case "behavior":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="behavior">Behavior</Label>
              <Input
                id="behavior"
                value={formData.behavior || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case "health":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (g)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ""}
                onChange={handleInputChange}
              />
            </div>
            {/* Add other health-specific fields like symptoms if needed */}
          </>
        );
      case "environment":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">Edit Log Entry - {logToEdit.type.charAt(0).toUpperCase() + logToEdit.type.slice(1)}</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rats">Rats</Label>
            {/* This is a simplified single select. If multiple rats can be associated, this needs to be a multi-select component */}
            <Select
              value={selectedRats[0] || ""} // Assuming one rat for simplicity, adjust if multiple
              onValueChange={(value) => handleSelectChange("rats", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rat" />
              </SelectTrigger>
              <SelectContent>
                {availableRats.map(rat => (
                  <SelectItem key={rat} value={rat}>{rat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Display selected rats if multi-select is implemented */}
            {/* <div className="flex flex-wrap gap-1 mt-1">
              {selectedRats.map(rat => <Badge key={rat}>{rat}</Badge>)}
            </div> */}
          </div>

          {renderSpecificFields()}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Trash2 className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New hashtag"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHashtag();}}}
              />
              <Button type="button" onClick={addHashtag} variant="outline">Add Tag</Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLogModal;