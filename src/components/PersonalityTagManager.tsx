
import { cn } from "@/lib/utils"; // Import cn utility

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
  { id: "1", name: "Curious", color: "blue" },
  { id: "2", name: "Shy", color: "purple" },
  { id: "3", name: "Aggressive", color: "red" },
  { id: "4", name: "Calm", color: "green" },
  { id: "5", name: "Adventurous", color: "orange" },
  { id: "6", name: "Vocal", color: "yellow" },
  { id: "7", name: "Friendly", color: "pink" },
  { id: "8", name: "Dominant", color: "gray" },
  { id: "9", name: "Anxious", color: "indigo" },
];

const colorOptions = [
  "blue",
  "purple",
  "red",
  "green",
  "orange",
  "yellow",
  "pink",
  "gray",
  "indigo",
  "cyan",
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

  // Helper to get themed classes for a given color string (e.g., "primary", "red")
  const getThemedColorClasses = (colorName: string) => {
    switch (colorName) {
      case "primary": return "bg-primary/10 text-primary";
      case "secondary": return "bg-secondary/10 text-secondary-foreground";
      case "accent": return "bg-accent/10 text-accent-foreground";
      case "destructive": return "bg-destructive/10 text-destructive-foreground";
      case "muted": return "bg-muted/50 text-muted-foreground";
      // For specific colors, ensure they are defined in your Tailwind config and CSS variables
      case "blue": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "purple": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "red": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "green": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "orange": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "yellow": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "pink": return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
      case "cyan": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
      case "indigo": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      case "gray": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  const getTagColorClasses = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName);
    return getThemedColorClasses(tag?.color || "muted");
  };

  return (
    <div className={cn("space-y-3")}>
      <div className={cn("flex flex-wrap gap-2")}>
        {availableTags.map((tag) => (
          <div key={tag.id} className={cn("flex items-center gap-1")}>
            <Badge
              variant="outline"
              className={cn(
                `cursor-pointer transition-all`,
                getTagColorClasses(tag.name),
                selectedTags.includes(tag.name)
                  ? "ring-2 ring-primary"
                  : ""
              )}
              onClick={() => handleTagToggle(tag.name)}
            >
              {tag.name}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-6 w-6 p-0")}
              onClick={() => handleEditTag(tag)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsAddingTag(true)}
          className={cn("h-7")}
        >
          <Plus className="h-3 w-3 mr-1" />
          {t("Add Tag")}
        </Button>
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent className={cn("sm:max-w-md bg-card text-card-foreground")}>
          <DialogHeader>
            <DialogTitle>{t("Add New Personality Tag")}</DialogTitle>
          </DialogHeader>
          <div className={cn("space-y-4")}>
            <Input
              placeholder={t("Tag name")}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <div className={cn("space-y-2")}>
              <p className={cn("text-sm font-medium")}>{t("Choose color:")}</p>
              <div className={cn("flex flex-wrap gap-2")}>
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className={cn(
                      `cursor-pointer`,
                      getThemedColorClasses(color),
                      selectedColor === color ? "ring-2 ring-primary" : ""
                    )}
                    onClick={() => setSelectedColor(color)}
                  >
                    {t("Sample")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className={cn("flex gap-2")}>
              <Button type="button" onClick={handleAddTag} disabled={!newTagName.trim()}>
                {t("Add Tag")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddingTag(false)}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent className={cn("sm:max-w-md bg-card text-card-foreground")}>
          <DialogHeader>
            <DialogTitle>{t("Edit Personality Tag")}</DialogTitle>
          </DialogHeader>
          <div className={cn("space-y-4")}>
            <Input
              placeholder={t("Tag name")}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag()}
            />
            <div className={cn("space-y-2")}>
              <p className={cn("text-sm font-medium")}>{t("Choose color:")}</p>
              <div className={cn("flex flex-wrap gap-2")}>
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className={cn(
                      `cursor-pointer`,
                      getThemedColorClasses(color),
                      selectedColor === color ? "ring-2 ring-primary" : ""
                    )}
                    onClick={() => setSelectedColor(color)}
                  >
                    {t("Sample")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className={cn("flex gap-2")}>
              <Button type="button" onClick={handleUpdateTag} disabled={!newTagName.trim()}>
                {t("Update Tag")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingTag(null)}>
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
