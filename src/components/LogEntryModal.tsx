
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MultiSelectRats from "@/components/MultiSelectRats";
import BehaviorTagSelector from "@/components/BehaviorTagSelector";

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logType: string;
  onLogAdded: () => void;
  editingLog?: any;
}

const LogEntryModal = ({ isOpen, onClose, logType, onLogAdded, editingLog }: LogEntryModalProps) => {
  const [rats, setRats] = useState<any[]>([]);
  const [selectedRats, setSelectedRats] = useState<string[]>([]);
  const [behaviorTags, setBehaviorTags] = useState<string[]>([]);
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

  useEffect(() => {
    if (editingLog) {
      setSelectedRats(editingLog.rat_ids || [editingLog.rat_id]);
      setFormData(editingLog.content || {});
      if (logType === 'behavior' && editingLog.content?.tags) {
        setSelectedTags(editingLog.content.tags);
      }
    } else {
      resetForm();
    }
  }, [editingLog, isOpen]);

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

  const addNewTag = async (newTag: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('behavior_tags')
        .insert({ user_id: user.id, name: newTag });
      
      if (!error) {
        setBehaviorTags([...behaviorTags, newTag]);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedRats.length === 0) return;

    setLoading(true);
    try {
      let content = { ...formData };
      
      if (logType === 'behavior') {
        content.tags = selectedTags;
      }

      if (editingLog) {
        // Update existing log
        const { error } = await supabase
          .from('log_entries')
          .update({ content })
          .eq('id', editingLog.id);

        if (error) throw error;
      } else {
        // Create new log entries for each selected rat
        const entries = selectedRats.map(ratId => ({
          user_id: user.id,
          rat_id: ratId,
          type: logType,
          content
        }));

        const { error } = await supabase
          .from('log_entries')
          .insert(entries);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingLog ? "Log entry updated successfully!" : "Log entry added successfully!",
      });
      
      onLogAdded();
      onClose();
      if (!editingLog) resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingLog ? "Failed to update log entry" : "Failed to add log entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRats([]);
    setSelectedTags([]);
    setFormData({});
  };

  const renderLogTypeFields = () => {
    switch (logType) {
      case 'behavior':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-white">Behavior Tags</Label>
              <BehaviorTagSelector
                availableTags={behaviorTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onNewTag={addNewTag}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </>
        );
      case 'health':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Health Status</Label>
              <Select 
                value={formData.status || ""}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </>
        );
      case 'weight':
        return (
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-white">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ""}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>
        );
      case 'medication':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="medication" className="text-white">Medication</Label>
              <Input
                id="medication"
                value={formData.medication || ""}
                onChange={(e) => setFormData({...formData, medication: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dose" className="text-white">Dose</Label>
              <Input
                id="dose"
                value={formData.dose || ""}
                onChange={(e) => setFormData({...formData, dose: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </>
        );
      case 'feeding':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="food" className="text-white">Food</Label>
              <Input
                id="food"
                value={formData.food || ""}
                onChange={(e) => setFormData({...formData, food: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount</Label>
              <Input
                id="amount"
                value={formData.amount || ""}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </>
        );
      case 'environment':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-white">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity" className="text-white">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity || ""}
                onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
      <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-gray-100 hover:bg-gray-200 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-white">
              {editingLog ? 'Edit' : 'Add'} {logType.charAt(0).toUpperCase() + logType.slice(1)} Log
            </DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!editingLog && (
            <div className="space-y-2">
              <Label className="text-white">Select Rats</Label>
              <MultiSelectRats
                rats={rats}
                selectedRats={selectedRats}
                onSelectionChange={setSelectedRats}
                placeholder="Choose rats"
              />
            </div>
          )}
          {renderLogTypeFields()}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" 
            disabled={loading || (!editingLog && selectedRats.length === 0)}
          >
            {loading ? (editingLog ? "Updating..." : "Adding...") : (editingLog ? "Update Log Entry" : "Add Log Entry")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogEntryModal;
