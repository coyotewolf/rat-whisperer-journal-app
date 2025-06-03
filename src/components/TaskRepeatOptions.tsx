
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RepeatOptions {
  type: 'none' | 'daily' | 'weekly' | 'monthly';
  weekdays?: string[];
  endDate?: Date;
  endType: 'never' | 'date';
}

interface TaskRepeatOptionsProps {
  repeatOptions: RepeatOptions;
  onRepeatChange: (options: RepeatOptions) => void;
}

const TaskRepeatOptions = ({ repeatOptions, onRepeatChange }: TaskRepeatOptionsProps) => {
  const weekdayOptions = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const handleRepeatTypeChange = (type: string) => {
    onRepeatChange({
      ...repeatOptions,
      type: type as RepeatOptions['type'],
      weekdays: type === 'weekly' ? [] : undefined
    });
  };

  const handleWeekdayChange = (weekday: string, checked: boolean) => {
    const currentWeekdays = repeatOptions.weekdays || [];
    const newWeekdays = checked 
      ? [...currentWeekdays, weekday]
      : currentWeekdays.filter(w => w !== weekday);
    
    onRepeatChange({
      ...repeatOptions,
      weekdays: newWeekdays
    });
  };

  const handleEndTypeChange = (endType: 'never' | 'date') => {
    onRepeatChange({
      ...repeatOptions,
      endType,
      endDate: endType === 'never' ? undefined : repeatOptions.endDate
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onRepeatChange({
      ...repeatOptions,
      endDate: date
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Repeat</Label>
        <Select value={repeatOptions.type} onValueChange={handleRepeatTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Never</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {repeatOptions.type === 'weekly' && (
        <div className="space-y-2">
          <Label>Select Days</Label>
          <div className="flex flex-wrap gap-2">
            {weekdayOptions.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={repeatOptions.weekdays?.includes(day.value) || false}
                  onCheckedChange={(checked) => handleWeekdayChange(day.value, checked as boolean)}
                />
                <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {repeatOptions.type !== 'none' && (
        <div className="space-y-2">
          <Label>End Repeat</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="never"
                checked={repeatOptions.endType === 'never'}
                onCheckedChange={() => handleEndTypeChange('never')}
              />
              <Label htmlFor="never" className="text-sm">Never</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="date"
                checked={repeatOptions.endType === 'date'}
                onCheckedChange={() => handleEndTypeChange('date')}
              />
              <Label htmlFor="date" className="text-sm">On date</Label>
            </div>
            {repeatOptions.endType === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal ml-6",
                      !repeatOptions.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {repeatOptions.endDate ? format(repeatOptions.endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={repeatOptions.endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRepeatOptions;
