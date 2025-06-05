
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("Error"),
        description: t("Please fill in all fields"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: t("Error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("Success"),
          description: isSignUp
            ? t("Account created successfully! Please check your email to confirm your account.")
            : t("Signed in successfully!"),
        });
        onClose();
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: t("Error"),
        description: t("An unexpected error occurred"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/80 border-none shadow-none">
        <div className="relative p-4 text-center py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 text-white hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{isSignUp ? t("Create Account") : t("Sign In")}</h3>
          <p className="text-purple-100 mb-4">
            {isSignUp ? t("Join us to track your furry friends!") : t("Sign in to manage your rats")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("Enter your email")}
              required
              disabled={loading}
              className="bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("Password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("Enter your password")}
              required
              disabled={loading}
              minLength={6}
              className="bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            disabled={loading || !email || !password}
          >
            {loading ? t("Loading...") : (isSignUp ? t("Create Account") : t("Sign In"))}
          </Button>
          <div className="text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                {t("Already have an account?")}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {t("Sign in")}
                </button>
              </>
            ) : (
              <>
                {t("Don't have an account?")}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {t("Sign up to sync your data across devices.")}
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
