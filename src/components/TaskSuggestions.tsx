
import { Badge } from "@/components/ui/badge";

interface TaskSuggestionsProps {
  onSelect: (suggestion: string) => void;
  selectedSuggestion?: string;
}

const TaskSuggestions = ({ onSelect, selectedSuggestion }: TaskSuggestionsProps) => {
  const defaultSuggestions = [
    "Cage cleaning",
    "Vet appointment", 
    "Bedding restock",
    "Food restock",
    "Feeding",
    "Water refill",
    "Playtime"
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Quick suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {defaultSuggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant={selectedSuggestion === suggestion ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedSuggestion === suggestion 
                ? "bg-orange-500 text-white" 
                : "hover:bg-orange-100"
            }`}
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TaskSuggestions;
