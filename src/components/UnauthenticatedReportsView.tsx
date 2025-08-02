import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AuthModal from "@/components/AuthModal";

interface UnauthenticatedReportsViewProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const UnauthenticatedReportsView = ({ authModalOpen, setAuthModalOpen }: UnauthenticatedReportsViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      {/* Header */}
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {t("Reports")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("View detailed analytics and insights")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-4 text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
          <BarChart3 className="h-12 w-12 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{t("Sign in to view reports")}</h3>
        <p className="text-muted-foreground mb-4">{t("Create an account or sign in to access detailed analytics and insights about your rats!")}</p>
        <Button
          onClick={() => setAuthModalOpen(true)}
          variant="default"
        >
          {t("Sign In / Sign Up")}
        </Button>
      </div>

      <BottomNav />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default UnauthenticatedReportsView;