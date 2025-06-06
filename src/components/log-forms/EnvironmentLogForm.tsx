import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from 'react-i18next';

interface EnvironmentLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const EnvironmentLogForm = ({ initialData, onDataChange }: EnvironmentLogFormProps) => {
  const { t } = useTranslation();
  const [temperature, setTemperature] = useState(initialData?.temperature || "");
  const [humidity, setHumidity] = useState(initialData?.humidity || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setTemperature(initialData?.temperature || "");
    setHumidity(initialData?.humidity || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    onDataChange({ temperature, humidity, notes });
  }, [temperature, humidity, notes, onDataChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "temperature") {
      setTemperature(value);
    } else if (id === "humidity") {
      setHumidity(value);
    } else if (id === "notes") {
      setNotes(value);
    }
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="temperature">{t("Temperature (°C)")}</Label>
        <Input
          id="temperature"
          type="number"
          value={temperature}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="humidity">{t("Humidity (%)")}</Label>
        <Input
          id="humidity"
          type="number"
          value={humidity}
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

export default EnvironmentLogForm;