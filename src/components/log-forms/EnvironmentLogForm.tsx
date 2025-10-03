import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from 'react-i18next';

interface EnvironmentLogFormProps {
  initialData?: any;
  onDataChange: (data: any) => void;
}

const EnvironmentLogForm = ({ initialData, onDataChange }: EnvironmentLogFormProps) => {
  const { t } = useTranslation();
  
  // Determine if this is a water-type form (has amount but not temperature/humidity)
  const isWaterType = initialData && 'amount' in initialData && !('temperature' in initialData || 'humidity' in initialData);
  
  const [temperature, setTemperature] = useState(initialData?.temperature || "");
  const [humidity, setHumidity] = useState(initialData?.humidity || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setTemperature(initialData?.temperature || "");
    setHumidity(initialData?.humidity || "");
    setAmount(initialData?.amount || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    if (isWaterType) {
      onDataChange({ amount, notes });
    } else {
      onDataChange({ temperature, humidity, notes });
    }
  }, [temperature, humidity, amount, notes, onDataChange, isWaterType]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "temperature") {
      setTemperature(value);
    } else if (id === "humidity") {
      setHumidity(value);
    } else if (id === "amount") {
      setAmount(value);
    } else if (id === "notes") {
      setNotes(value);
    }
  }, []);

  return (
    <>
      {isWaterType ? (
        <div className="space-y-2">
          <Label htmlFor="amount">{t("Amount")}</Label>
          <Input
            id="amount"
            value={amount}
            onChange={handleInputChange}
            required
          />
        </div>
      ) : (
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
        </>
      )}
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