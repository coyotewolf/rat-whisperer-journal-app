import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';

interface HealthLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const HealthLogForm = ({ initialData, onDataChange }: HealthLogFormProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(initialData?.status || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setStatus(initialData?.status || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    onDataChange({ status, notes });
  }, [status, notes, onDataChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="status">{t("Health Status")}</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("Select status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">{t("Excellent")}</SelectItem>
            <SelectItem value="good">{t("Good")}</SelectItem>
            <SelectItem value="fair">{t("Fair")}</SelectItem>
            <SelectItem value="poor">{t("Poor")}</SelectItem>
            <SelectItem value="sick">{t("Sick")}</SelectItem>
          </SelectContent>
        </Select>
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

export default HealthLogForm;