
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Rat {
  id: string;
  name: string;
}

interface MultiSelectRatsProps {
  rats: Rat[];
  selectedRats: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

const MultiSelectRats = ({ rats, selectedRats, onSelectionChange, placeholder = "Select rats" }: MultiSelectRatsProps) => {
  const [open, setOpen] = useState(false);

  const toggleRat = (ratId: string) => {
    if (selectedRats.includes(ratId)) {
      onSelectionChange(selectedRats.filter(id => id !== ratId));
    } else {
      onSelectionChange([...selectedRats, ratId]);
    }
  };

  const selectedRatNames = rats
    .filter(rat => selectedRats.includes(rat.id))
    .map(rat => rat.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/10 border-white/20 text-white"
        >
          {selectedRatNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedRatNames.slice(0, 2).map(name => (
                <Badge key={name} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
              {selectedRatNames.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedRatNames.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm">
        <div className="max-h-60 overflow-auto">
          {rats.map((rat) => (
            <div
              key={rat.id}
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleRat(rat.id)}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedRats.includes(rat.id) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectedRats.includes(rat.id) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">{rat.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectRats;
