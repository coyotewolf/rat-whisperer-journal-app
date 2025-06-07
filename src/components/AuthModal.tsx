
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
        <div className={cn("relative p-4 text-center py-12 bg-card text-card-foreground")}> {/* Themed background and text */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn("absolute top-4 left-4 text-muted-foreground hover:text-foreground")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={cn("w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center")}> {/* Themed icon background */}
            <Sparkles className="h-12 w-12 text-primary-foreground" /> {/* Themed icon color */}
          </div>
          <h3 className={cn("text-xl font-semibold text-primary mb-2")}>{isSignUp ? t("Create Account") : t("Sign In")}</h3> {/* Themed title */}
          <p className={cn("text-muted-foreground mb-4")}> {/* Themed subtitle */}
            {isSignUp ? t("Join us to track your furry friends!") : t("Sign in to manage your rats")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className={cn("space-y-4 p-6")}>
          <div className={cn("space-y-2")}>
            <Label htmlFor="email">{t("Email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("Enter your email")}
              required
              disabled={loading}
              className={cn("")} // Removed hardcoded classes, Input component is already themed
            />
          </div>
          <div className={cn("space-y-2")}>
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
              className={cn("")} // Removed hardcoded classes, Input component is already themed
            />
          </div>
          <Button
            type="submit"
            className={cn("w-full")} // Removed hardcoded classes, Button component is already themed
            variant="default" // Use default variant for primary action
            disabled={loading || !email || !password}
          >
            {loading ? t("Loading...") : (isSignUp ? t("Create Account") : t("Sign In"))}
          </Button>
          <div className={cn("text-center text-sm text-muted-foreground")}> {/* Themed text */}
            {isSignUp ? (
              <>
                {t("Already have an account?")}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  disabled={loading}
                  className={cn("font-medium text-primary hover:text-primary/80 underline")}
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
                  className={cn("font-medium text-primary hover:text-primary/80 underline")}
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
