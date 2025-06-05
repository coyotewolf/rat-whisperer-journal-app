
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface AddRatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatAdded: () => void;
}

const AddRatModal = ({ isOpen, onClose, onRatAdded }: AddRatModalProps) => {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rats')
        .insert({
          user_id: user.id,
          name,
          sex,
          birthday,
          status: 'active',
          personality: []
        });

      if (error) throw error;

      toast({
        title: t("Success"),
        description: t("Rat added successfully!"),
      });
      
      onRatAdded();
      onClose();
      setName("");
      setSex("");
      setBirthday("");
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to add rat"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/80">
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
            <DialogTitle className="flex-1 text-center">{t("Add New Rat")}</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("Name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">{t("Sex")}</Label>
            <Select value={sex} onValueChange={setSex} required>
              <SelectTrigger>
                <SelectValue placeholder={t("Select sex")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("Male")}</SelectItem>
                <SelectItem value="Female">{t("Female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthday">{t("Birthday")}</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("Adding...") : t("Add Rat")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRatModal;
