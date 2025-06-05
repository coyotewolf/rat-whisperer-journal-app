
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Rat {
  id: string;
  name: string;
}

interface MultiSelectRatsProps {
  selectedRatIds: string[];
  onSelectionChange: (ratIds: string[]) => void;
  placeholder?: string;
}

const MultiSelectRats = ({ selectedRatIds, onSelectionChange, placeholder = "Select rats..." }: MultiSelectRatsProps) => {
  const { t } = useTranslation();
  const [rats, setRats] = useState<Rat[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRats();
    }
  }, [user]);

  const fetchRats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('rats')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setRats(data || []);
    } catch (error) {
      console.error('Error fetching rats:', error);
    }
  };

  const handleRatToggle = (ratId: string) => {
    const isSelected = selectedRatIds.includes(ratId);
    if (isSelected) {
      onSelectionChange(selectedRatIds.filter(id => id !== ratId));
    } else {
      onSelectionChange([...selectedRatIds, ratId]);
    }
  };

  const getSelectedRatNames = () => {
    return rats.filter(rat => selectedRatIds.includes(rat.id)).map(rat => rat.name);
  };

  const selectedNames = getSelectedRatNames();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedNames.length === 0 ? (
              <span className="text-muted-foreground">{t(placeholder)}</span>
            ) : selectedNames.length === 1 ? (
              <span>{selectedNames[0]}</span>
            ) : (
              <>
                <Badge variant="secondary" className="text-xs">
                  {selectedNames[0]}
                </Badge>
                {selectedNames.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {t("+{{count}} more", { count: selectedNames.length - 1 })}
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <div className="space-y-2">
          {rats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("No active rats found")}</p>
          ) : (
            rats.map((rat) => (
              <div key={rat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`rat-${rat.id}`}
                  checked={selectedRatIds.includes(rat.id)}
                  onCheckedChange={() => handleRatToggle(rat.id)}
                />
                <Label htmlFor={`rat-${rat.id}`} className="text-sm font-normal cursor-pointer flex-1">
                  {rat.name}
                </Label>
              </div>
            ))
          )}
        </div>
        {selectedNames.length > 0 && (
          <div className="mt-3 pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {selectedNames.map((name, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectRats;
