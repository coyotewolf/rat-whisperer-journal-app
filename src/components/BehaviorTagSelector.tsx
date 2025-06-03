
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface BehaviorTagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onNewTag?: (tag: string) => void;
}

const BehaviorTagSelector = ({ 
  availableTags, 
  selectedTags, 
  onTagsChange, 
  onNewTag 
}: BehaviorTagSelectorProps) => {
  const [newTag, setNewTag] = useState("");

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      onNewTag?.(newTag.trim());
      onTagsChange([...selectedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedTags.includes(tag) 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Selected Tags</label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-500/20 text-blue-100"
              >
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)} 
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {onNewTag && (
        <div className="flex gap-2">
          <Input
            placeholder="Add new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
          />
          <Button 
            type="button" 
            size="sm"
            onClick={addNewTag}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default BehaviorTagSelector;
