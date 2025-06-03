
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import PersonalityTagManagerModal from "@/components/PersonalityTagManagerModal";
import { ArrowLeft, Tag } from "lucide-react";

interface Rat {
  id: string;
  name: string;
  sex: string;
  birthday: string;
  status: string;
  personality?: string[];
}

interface EditRatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatUpdated: () => void;
  rat: Rat | null;
}

const EditRatModal = ({ isOpen, onClose, onRatUpdated, rat }: EditRatModalProps) => {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  const [status, setStatus] = useState("");
  const [personality, setPersonality] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (rat) {
      setName(rat.name);
      setSex(rat.sex);
      setBirthday(rat.birthday);
      setStatus(rat.status);
      setPersonality(rat.personality || []);
    }
  }, [rat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rat) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rats')
        .update({
          name,
          sex,
          birthday,
          status,
          personality
        })
        .eq('id', rat.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rat updated successfully!",
      });
      
      onRatUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rat) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rats')
        .delete()
        .eq('id', rat.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rat deleted successfully!",
      });
      
      onRatUpdated();
      onClose();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagsSave = async () => {
    if (!rat) return;

    try {
      const { error } = await supabase
        .from('rats')
        .update({ personality })
        .eq('id', rat.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personality tags updated successfully!",
      });
      
      onRatUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update personality tags",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto rounded-xl bg-white/95 backdrop-blur-sm border-white/20">
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
              <DialogTitle className="flex-1">Edit Rat</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={sex} onValueChange={setSex} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Personality Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTagManager(true)}
                  className="text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Manage Tags
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {personality.length > 0 ? (
                  <span>{personality.join(', ')}</span>
                ) : (
                  <span className="italic">No personality tags set</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Rat"}
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PersonalityTagManagerModal
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
        selectedTags={personality}
        onTagsChange={setPersonality}
        onSave={handleTagsSave}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Rat"
        description={`Are you sure you want to delete ${rat?.name}? This action cannot be undone and will also delete all associated logs.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};

export default EditRatModal;
