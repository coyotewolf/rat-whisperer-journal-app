
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, X } from 'lucide-react';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLogTagSuggestions, type LogTagSuggestion } from "@/hooks/useLogTagSuggestions";

interface LogTagSuggestionsProps {
  onSelect: (tagName: string) => void;
  selectedTags: string[];
}

const LogTagSuggestions = ({ onSelect, selectedTags }: LogTagSuggestionsProps) => {
  const { t } = useTranslation();
  const { suggestions, loading, addSuggestion } = useLogTagSuggestions();
  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSuggestion = async () => {
    if (!newTagName.trim()) return;

    setIsAdding(true);
    try {
      await addSuggestion(newTagName);
      setNewTagName("");
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSuggestion();
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">{t("Loading suggestions...")}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">{t("Quick tag suggestions:")}</p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">{t("No quick tag suggestions yet.")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const isSelected = selectedTags.includes(suggestion.name);
            return (
              <Badge
                key={suggestion.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-orange-500 text-white"
                    : "hover:bg-orange-100"
                }`}
                onClick={() => onSelect(suggestion.name)}
              >
                {suggestion.name}
                {isSelected && <X className="h-3 w-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Input
          placeholder={t("Add new tag suggestion")}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="text-sm"
        />
        <Button
          type="button"
          onClick={handleAddSuggestion}
          disabled={!newTagName.trim() || isAdding}
          variant="outline"
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LogTagSuggestions;
