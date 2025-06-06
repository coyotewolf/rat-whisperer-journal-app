import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface FeedingLogFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FeedingLogForm: React.FC<FeedingLogFormProps> = ({ formData, handleInputChange }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="food">{t("Food Type")}</Label>
        <Input
          id="food"
          value={formData.food || ""}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">{t("Amount")}</Label>
        <Input
          id="amount"
          value={formData.amount || ""}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default FeedingLogForm;