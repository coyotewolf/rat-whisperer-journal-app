
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PersonalityTag {
  id: string;
  name: string;
  color: string;
}

interface PersonalityTagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const defaultTags: PersonalityTag[] = [
  { id: "1", name: "Curious", color: "bg-blue-100 text-blue-700" },
  { id: "2", name: "Shy", color: "bg-purple-100 text-purple-700" },
  { id: "3", name: "Aggressive", color: "bg-red-100 text-red-700" },
  { id: "4", name: "Calm", color: "bg-green-100 text-green-700" },
  { id: "5", name: "Adventurous", color: "bg-orange-100 text-orange-700" },
  { id: "6", name: "Vocal", color: "bg-yellow-100 text-yellow-700" },
  { id: "7", name: "Friendly", color: "bg-pink-100 text-pink-700" },
  { id: "8", name: "Dominant", color: "bg-gray-100 text-gray-700" },
  { id: "9", name: "Anxious", color: "bg-indigo-100 text-indigo-700" },
];

const colorOptions = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-pink-100 text-pink-700",
  "bg-gray-100 text-gray-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
];

const PersonalityTagManager = ({ selectedTags, onTagsChange }: PersonalityTagManagerProps) => {
  const { t } = useTranslation();
  const [availableTags, setAvailableTags] = useState<PersonalityTag[]>(defaultTags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<PersonalityTag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const handleTagToggle = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);
    if (isSelected) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: PersonalityTag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: selectedColor,
      };
      setAvailableTags([...availableTags, newTag]);
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  const handleEditTag = (tag: PersonalityTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const handleUpdateTag = () => {
    if (editingTag && newTagName.trim()) {
      const updatedTags = availableTags.map(tag =>
        tag.id === editingTag.id
          ? { ...tag, name: newTagName.trim(), color: selectedColor }
          : tag
      );
      setAvailableTags(updatedTags);
      
      // Update selected tags if the tag name changed
      if (editingTag.name !== newTagName.trim()) {
        const updatedSelectedTags = selectedTags.map(tagName =>
          tagName === editingTag.name ? newTagName.trim() : tagName
        );
        onTagsChange(updatedSelectedTags);
      }
      
      setEditingTag(null);
      setNewTagName("");
    }
  };

  const getTagColor = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.color || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1">
            <Badge
              className={`cursor-pointer border-2 transition-all ${getTagColor(tag.name)} ${
                selectedTags.includes(tag.name)
                  ? "ring-2 ring-orange-300"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => handleTagToggle(tag.name)}
            >
              {tag.name}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => handleEditTag(tag)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingTag(true)}
          className="h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t("Add Tag")}
        </Button>
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Add New Personality Tag")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t("Tag name")}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("Choose color:")}</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    className={`cursor-pointer border-2 ${color} ${
                      selectedColor === color ? "ring-2 ring-orange-300" : "border-transparent"
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {t("Sample")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
                {t("Add Tag")}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingTag(false)}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Edit Personality Tag")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t("Tag name")}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag()}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("Choose color:")}</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    className={`cursor-pointer border-2 ${color} ${
                      selectedColor === color ? "ring-2 ring-orange-300" : "border-transparent"
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {t("Sample")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateTag} disabled={!newTagName.trim()}>
                {t("Update Tag")}
              </Button>
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalityTagManager;
