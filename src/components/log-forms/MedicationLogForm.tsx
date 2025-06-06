import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from 'react-i18next';

interface MedicationLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const MedicationLogForm = ({ initialData, onDataChange }: MedicationLogFormProps) => {
  const { t } = useTranslation();
  const [medication, setMedication] = useState(initialData?.medication || "");
  const [dose, setDose] = useState(initialData?.dose || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setMedication(initialData?.medication || "");
    setDose(initialData?.dose || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    onDataChange({ medication, dose, notes });
  }, [medication, dose, notes, onDataChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "medication") {
      setMedication(value);
    } else if (id === "dose") {
      setDose(value);
    } else if (id === "notes") {
      setNotes(value);
    }
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="medication">{t("Medication")}</Label>
        <Input
          id="medication"
          value={medication}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dose">{t("Dose")}</Label>
        <Input
          id="dose"
          value={dose}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("Notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default MedicationLogForm;