import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from 'react-i18next';

interface FeedingLogFormProps {
  initialData?: any; // For pre-filling data if editing
  onDataChange: (data: any) => void;
}

const FeedingLogForm = ({ initialData, onDataChange }: FeedingLogFormProps) => {
  const { t } = useTranslation();
  const [food, setFood] = useState(initialData?.food || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    setFood(initialData?.food || "");
    setAmount(initialData?.amount || "");
    setNotes(initialData?.notes || "");
  }, [initialData]);

  useEffect(() => {
    onDataChange({ food, amount, notes });
  }, [food, amount, notes, onDataChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "food") {
      setFood(value);
    } else if (id === "amount") {
      setAmount(value);
    } else if (id === "notes") {
      setNotes(value);
    }
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="food">{t("Food")}</Label>
        <Input
          id="food"
          value={food}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">{t("Amount")}</Label>
        <Input
          id="amount"
          value={amount}
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

export default FeedingLogForm;