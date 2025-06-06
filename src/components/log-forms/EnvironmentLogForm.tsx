import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface EnvironmentLogFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EnvironmentLogForm: React.FC<EnvironmentLogFormProps> = ({ formData, handleInputChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="temperature">{t("Temperature (°C)")}</Label>
        <Input
          id="temperature"
          type="number"
          value={formData.temperature || ""}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="humidity">{t("Humidity (%)")}</Label>
        <Input
          id="humidity"
          type="number"
          value={formData.humidity || ""}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default EnvironmentLogForm;