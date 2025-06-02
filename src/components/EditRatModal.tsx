
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Rat {
  id: string;
  name: string;
  sex: string;
  birthday: string;
  status: string;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (rat) {
      setName(rat.name);
      setSex(rat.sex);
      setBirthday(rat.birthday);
      setStatus(rat.status);
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
          status
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
    
    if (!confirm("Are you sure you want to delete this rat? This action cannot be undone.")) {
      return;
    }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Rat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Rat"}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRatModal;
