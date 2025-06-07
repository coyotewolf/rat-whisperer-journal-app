import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Corrected import path
import { useTranslation } from 'react-i18next';

interface WeightLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const WeightLogForm = ({ initialData, onDataChange }: WeightLogFormProps) => {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(initialData?.weight || "");
  const [notes, setNotes] = useState(initialData?.notes || ""); // Add notes state

  useEffect(() => {
    setWeight(initialData?.weight || "");
    setNotes(initialData?.notes || ""); // Update notes state
  }, [initialData]);

  useEffect(() => {
    onDataChange({ weight, notes }); // Include notes in onDataChange
  }, [weight, notes, onDataChange]); // Add notes to dependencies

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="weight">{t("Weight (grams)")}</Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={handleWeightChange}
          required
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

export default WeightLogForm;