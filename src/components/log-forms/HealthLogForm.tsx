
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';
import LogTagSuggestions from "@/components/LogTagSuggestions";

interface HealthLogFormProps {
  initialData?: any;
  onDataChange: (data: any) => void;
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const HealthLogForm = ({ initialData, onDataChange, selectedTags = [], onTagsChange }: HealthLogFormProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(initialData?.status || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setStatus(initialData?.status || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    console.log('HealthLogForm: status changed to:', status, 'notes:', notes);
    onDataChange({ status, notes });
  }, [status, notes, onDataChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    console.log('HealthLogForm: handleStatusChange called with:', value);
    setStatus(value);
  }, []);

  const handleTagSelection = (tagName: string) => {
    if (!onTagsChange) return;
    
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="status">{t("Health Status")}</Label>
        <Select value={status} onValueChange={handleStatusChange}>
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

      {onTagsChange && (
        <div className="space-y-2">
          <LogTagSuggestions
            onSelect={handleTagSelection}
            selectedTags={selectedTags}
            category="health"
            placeholder={t("Quick health suggestions:")}
          />
        </div>
      )}

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

export default HealthLogForm;
