import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface BehaviorLogFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BehaviorLogForm: React.FC<BehaviorLogFormProps> = ({ formData, handleInputChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="behavior">{t("Behavior")}</Label>
        <Input
          id="behavior"
          value={formData.behavior || ""}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default BehaviorLogForm;