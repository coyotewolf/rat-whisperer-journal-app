import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface WeightLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const WeightLogForm = ({ initialData, onDataChange }: WeightLogFormProps) => {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(initialData?.weight || "");

  useEffect(() => {
    setWeight(initialData?.weight || "");
  }, [initialData]);

  useEffect(() => {
    onDataChange({ weight });
  }, [weight, onDataChange]);

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  }, []);

  return (
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
  );
};

export default WeightLogForm;