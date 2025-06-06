import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface MedicationLogFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const MedicationLogForm: React.FC<MedicationLogFormProps> = ({ formData, handleInputChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="medication">{t("Medication Name")}</Label>
        <Input
          id="medication"
          value={formData.medication || ""}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dose">{t("Dose")}</Label>
        <Input
          id="dose"
          value={formData.dose || ""}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default MedicationLogForm;