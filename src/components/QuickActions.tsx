
import { Button } from "@/components/ui/button";
import { Plus, Activity, Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onQuickLogClick: () => void;
  onNewTaskClick: () => void;
}

const QuickActions = ({ onQuickLogClick, onNewTaskClick }: QuickActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReportsClick = () => {
    navigate('/reports');
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Button
        onClick={onQuickLogClick}
        className="h-20 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <div className="text-center">
          <Plus className="h-6 w-6 mx-auto mb-1" />
          <div className="text-xs font-medium">{t("Quick Log")}</div>
        </div>
      </Button>
      
      <Button
        onClick={onNewTaskClick}
        className="h-20 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <div className="text-center">
          <Calendar className="h-6 w-6 mx-auto mb-1" />
          <div className="text-xs font-medium">{t("New Task")}</div>
        </div>
      </Button>
      
      <Button 
        onClick={handleReportsClick}
        className="h-20 bg-accent text-accent-foreground hover:bg-accent/80 shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <div className="text-center">
          <Activity className="h-6 w-6 mx-auto mb-1" />
          <div className="text-xs font-medium">{t("Reports")}</div>
        </div>
      </Button>
    </div>
  );
};

export default QuickActions;
