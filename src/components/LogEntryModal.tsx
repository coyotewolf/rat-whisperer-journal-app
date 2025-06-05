
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  logType: string;
  onLogAdded: (newLog: any) => void; // Modified to accept newLog parameter
}

const LogEntryModal = ({ isOpen, onClose, onBack, logType, onLogAdded }: LogEntryModalProps) => {
  const [rats, setRats] = useState<any[]>([]);
  const [selectedRat, setSelectedRat] = useState("");
  const [behaviorTags, setBehaviorTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

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
      console.error(t('Error adding tag:'), error);
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

      const { data, error } = await supabase
        .from('log_entries')
        .insert({
          user_id: user.id,
          rat_id: selectedRat,
          type: logType,
          content
        }).select(); // Select the inserted data to pass to onLogAdded

      if (error) throw error;

      toast({
        title: t("Success"),
        description: t("Log entry added successfully!"),
      });
      
      if (data && data.length > 0) {
        onLogAdded(data[0]); // Pass the newly created log entry
      }
      // After successful submission, call onClose (which should trigger full close and navigate)
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to add log entry"),
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
              <Label>{t("Behavior Tags")}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Trash2 className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={(value) => {
                if (!selectedTags.includes(value)) {
                  setSelectedTags([...selectedTags, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Add existing tag")} />
                </SelectTrigger>
                <SelectContent>
                  {behaviorTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder={t("New tag")}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button type="button" onClick={addNewTag}>{t("Add")}</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
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
              <Label htmlFor="status">{t("Health Status")}</Label>
              <Select onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">{t("Excellent")}</SelectItem>
                  <SelectItem value="good">{t("Good")}</SelectItem>
                  <SelectItem value="fair">{t("Fair")}</SelectItem>
                  <SelectItem value="poor">{t("Poor")}</SelectItem>
                  <SelectItem value="sick">{t("Sick")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
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
            <Label htmlFor="weight">{t("Weight (grams)")}</Label>
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
              <Label htmlFor="medication">{t("Medication")}</Label>
              <Input
                id="medication"
                value={formData.medication || ""}
                onChange={(e) => setFormData({...formData, medication: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dose">{t("Dose")}</Label>
              <Input
                id="dose"
                value={formData.dose || ""}
                onChange={(e) => setFormData({...formData, dose: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
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
              <Label htmlFor="food">{t("Food")}</Label>
              <Input
                id="food"
                value={formData.food || ""}
                onChange={(e) => setFormData({...formData, food: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("Amount")}</Label>
              <Input
                id="amount"
                value={formData.amount || ""}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
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
              <Label htmlFor="temperature">{t("Temperature (°C)")}</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity">{t("Humidity (%)")}</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity || ""}
                onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
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
    <Dialog open={isOpen} onOpenChange={(openState) => {
      if (!openState) {
        onClose(); // Overlay click or Esc on LogEntryModal triggers the full close logic via props.onClose
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack} // Use onBack for the internal back button
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{t("Add {{logType}} Log", { logType: logType.charAt(0).toUpperCase() + logType.slice(1) })}</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rat">{t("Select Rat")}</Label>
            <Select value={selectedRat} onValueChange={setSelectedRat} required>
              <SelectTrigger>
                <SelectValue placeholder={t("Choose a rat")} />
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
            {loading ? t("Adding...") : t("Add Log Entry")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogEntryModal;
