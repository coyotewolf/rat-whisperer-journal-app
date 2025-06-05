
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";

interface AccountSettingsProps {
  onBack: () => void;
}

const AccountSettings = ({ onBack }: AccountSettingsProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed out successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Settings")}
        </Button>
      </div>

      {!user ? (
        <div className="relative p-4 text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("Sign in to manage your account")}</h3>
          <p className="text-gray-600 mb-4">{t("Sign in to sync your data across devices!")}</p>
          <Button
            onClick={() => setAuthModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            {t("Sign In / Sign Up")}
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("Account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">{t("Signed in as")}</p>
              <p className="text-sm text-green-600">{user.email}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">{t("Account Actions")}</h3>
              <Button variant="outline" className="w-full">
                {t("Export Data")}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                {loading ? t("Signing Out...") : t("Sign Out")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default AccountSettings;
