
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';
import LogTagSuggestions from "@/components/LogTagSuggestions";
import { getHealthStatusEmoji } from "@/utils/cardStyleUtils";

interface HealthLogFormProps {
  initialData?: any;
  onDataChange: (data: any) => void;
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const HealthLogForm = ({ initialData, onDataChange, selectedTags = [], onTagsChange }: HealthLogFormProps) => {
  const { t } = useTranslation();

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDataChange({ notes: e.target.value });
  }, [onDataChange]);

  const handleStatusChange = useCallback((value: string) => {
    onDataChange({ status: value });
  }, [onDataChange]);

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
        <Select value={initialData?.status || ""} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("Select status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">
              <div className="flex items-center gap-2">
                <span>{getHealthStatusEmoji("excellent")}</span>
                <span>{t("Excellent")}</span>
              </div>
            </SelectItem>
            <SelectItem value="good">
              <div className="flex items-center gap-2">
                <span>{getHealthStatusEmoji("good")}</span>
                <span>{t("Good")}</span>
              </div>
            </SelectItem>
            <SelectItem value="fair">
              <div className="flex items-center gap-2">
                <span>{getHealthStatusEmoji("fair")}</span>
                <span>{t("Fair")}</span>
              </div>
            </SelectItem>
            <SelectItem value="poor">
              <div className="flex items-center gap-2">
                <span>{getHealthStatusEmoji("poor")}</span>
                <span>{t("Poor")}</span>
              </div>
            </SelectItem>
            <SelectItem value="sick">
              <div className="flex items-center gap-2">
                <span>{getHealthStatusEmoji("sick")}</span>
                <span>{t("Sick")}</span>
              </div>
            </SelectItem>
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
          value={initialData?.notes || ""}
          onChange={handleNotesChange}
        />
      </div>
    </>
  );
};

export default HealthLogForm;
