
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logType: string;
  onLogAdded: () => void;
}

const LogEntryModal = ({ isOpen, onClose, logType, onLogAdded }: LogEntryModalProps) => {
  const [rats, setRats] = useState<any[]>([]);
  const [selectedRat, setSelectedRat] = useState("");
  const [behaviorTags, setBehaviorTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      fetchRats();
      if (logType === 'behavior') {
        fetchBehaviorTags();
      }
    }
  }, [user, isOpen, logType]);

  const fetchRats = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('rats')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (!error) setRats(data || []);
  };

  const fetchBehaviorTags = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('behavior_tags')
      .select('name')
      .eq('user_id', user.id);
    
    if (!error) setBehaviorTags(data?.map(tag => tag.name) || []);
  };

  const addNewTag = async () => {
    if (!newTag.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('behavior_tags')
        .insert({ user_id: user.id, name: newTag.trim() });
      
      if (!error) {
        setBehaviorTags([...behaviorTags, newTag.trim()]);
        setSelectedTags([...selectedTags, newTag.trim()]);
        setNewTag("");
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRat) return;

    setLoading(true);
    try {
      let content = { ...formData };
      
      if (logType === 'behavior') {
        content.tags = selectedTags;
      }

      const { error } = await supabase
        .from('log_entries')
        .insert({
          user_id: user.id,
          rat_id: selectedRat,
          type: logType,
          content
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Log entry added successfully!",
      });
      
      onLogAdded();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add log entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRat("");
    setSelectedTags([]);
    setFormData({});
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const renderLogTypeFields = () => {
    switch (logType) {
      case 'behavior':
        return (
          <>
            <div className="space-y-2">
              <Label>Behavior Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => {
                if (!selectedTags.includes(value)) {
                  setSelectedTags([...selectedTags, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add existing tag" />
                </SelectTrigger>
                <SelectContent>
                  {behaviorTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="New tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button type="button" onClick={addNewTag}>Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        );
      case 'health':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="status">Health Status</Label>
              <Select onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        );
      case 'weight':
        return (
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ""}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              required
            />
          </div>
        );
      case 'medication':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="medication">Medication</Label>
              <Input
                id="medication"
                value={formData.medication || ""}
                onChange={(e) => setFormData({...formData, medication: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dose">Dose</Label>
              <Input
                id="dose"
                value={formData.dose || ""}
                onChange={(e) => setFormData({...formData, dose: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        );
      case 'feeding':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                value={formData.food || ""}
                onChange={(e) => setFormData({...formData, food: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={formData.amount || ""}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </>
        );
      case 'environment':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity || ""}
                onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
          <DialogTitle>Add {logType.charAt(0).toUpperCase() + logType.slice(1)} Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rat">Select Rat</Label>
            <Select value={selectedRat} onValueChange={setSelectedRat} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a rat" />
              </SelectTrigger>
              <SelectContent>
                {rats.map(rat => (
                  <SelectItem key={rat.id} value={rat.id}>{rat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {renderLogTypeFields()}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Log Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogEntryModal;
