
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { ArrowLeft, Plus, X } from "lucide-react";

interface AddRatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatAdded: () => void;
}

const AddRatModal = ({ isOpen, onClose, onRatAdded }: AddRatModalProps) => {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
          profile_picture: profilePicture || null,
          personality: hashtags,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rat added successfully!",
      });
      
      // Reset form
      setName("");
      setSex("");
      setBirthday("");
      setProfilePicture("");
      setHashtags([]);
      setNewHashtag("");
      
      onRatAdded();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add rat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
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
            <DialogTitle className="flex-1 text-white">Add New Rat</DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label className="text-white">Profile Picture</Label>
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentImage={profilePicture}
                onImageUpdate={setProfilePicture}
                petName={name || "Your Rat"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sex" className="text-white">Sex</Label>
            <Select value={sex} onValueChange={setSex} required>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthday" className="text-white">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label className="text-white">Personality Tags</Label>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {hashtags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-500/20 text-blue-100"
                  >
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeHashtag(tag)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add personality tag"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              />
              <Button 
                type="button" 
                size="sm"
                onClick={addHashtag}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Rat"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRatModal;
