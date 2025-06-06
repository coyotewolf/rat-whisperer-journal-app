import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface HealthWeightLogFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  logType: string; // To differentiate between 'health' and 'weight'
}

const HealthWeightLogForm: React.FC<HealthWeightLogFormProps> = ({ formData, handleInputChange, setFormData, logType }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="weight">{t("Weight (g)")}</Label>
        <Input
          id="weight"
          type="number"
          value={formData.weight || ""}
          onChange={handleInputChange}
        />
      </div>
      {logType === "health" && (
        <div className="space-y-2">
          <Label htmlFor="symptoms">{t("Symptoms (comma-separated)")}</Label>
          <Input
            id="symptoms"
            value={formData.symptoms ? formData.symptoms.join(", ") : ""}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, symptoms: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
          />
        </div>
      )}
    </>
  );
};

export default HealthWeightLogForm;