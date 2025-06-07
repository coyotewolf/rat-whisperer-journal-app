import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"; // Removed Select imports as they are not used here
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import LogTagSuggestions from "@/components/LogTagSuggestions"; // Re-using the tag suggestions component

interface BehaviorLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
  onTagsChange: (tags: string[]) => void;
  selectedTags: string[];
}

const BehaviorLogForm = ({ initialData, onDataChange, onTagsChange, selectedTags: propSelectedTags }: BehaviorLogFormProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [behaviorTags, setBehaviorTags] = useState<string[]>([]);
  const [behavior, setBehavior] = useState(initialData?.behavior || ""); // Add behavior state
  const [notes, setNotes] = useState(initialData?.notes || ""); // Internal state for notes
  const [currentSelectedTags, setCurrentSelectedTags] = useState<string[]>(propSelectedTags); // Internal state for selected tags

  useEffect(() => {
    if (user) {
      fetchBehaviorTags();
    }
  }, [user]);

  useEffect(() => {
    setBehavior(initialData?.behavior || ""); // Update behavior state
    setNotes(initialData?.notes || "");
    setCurrentSelectedTags(propSelectedTags);
  }, [initialData, propSelectedTags]); // Update internal state when props change

  const fetchBehaviorTags = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('behavior_tags')
      .select('name')
      .eq('user_id', user.id);
    
    if (!error) setBehaviorTags(data?.map(tag => tag.name) || []);
  };

  const handleTagSelection = useCallback((tagName: string) => {
    setCurrentSelectedTags(prevTags => {
      const newTags = prevTags.includes(tagName)
        ? prevTags.filter(tag => tag !== tagName)
        : [...prevTags, tagName];
      onTagsChange(newTags); // Notify parent of change
      return newTags;
    });
  }, [onTagsChange]);

  const removeHashtag = useCallback((tagToRemove: string) => {
    setCurrentSelectedTags(prevTags => {
      const newTags = prevTags.filter(tag => tag !== tagToRemove);
      onTagsChange(newTags); // Notify parent of change
      return newTags;
    });
  }, [onTagsChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onDataChange({ notes: e.target.value }); // Notify parent of change, remove behavior
  }, [onDataChange]); // Remove behavior from dependencies


  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="behavior">{t("Behavior")}</Label> {/* Keep label as "Behavior" */}
        <div className="flex flex-wrap gap-1 mb-2">
          {currentSelectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Trash2 className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
            </Badge>
          ))}
        </div>
        <LogTagSuggestions
          onSelect={handleTagSelection}
          selectedTags={currentSelectedTags}
          placeholder={t("Quick behavior suggestions")} // Rename placeholder
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("Notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </>
  );
};

export default BehaviorLogForm;